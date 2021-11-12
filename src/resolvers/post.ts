import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Comment } from "../entities/Comment";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Vote } from "../entities/Vote";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types/expressContext";
import { getPreviewImg } from "../utils/getPreviewImg";
import { PaginatedPosts } from "./types/paginatedPosts";
import { PostInput } from "./types/postInput";
import { PostSort, SortOrder, SortPeriod } from "./types/postSortEnum";

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => Int)
  async voteStatus(
    @Root() post: Post,
    @Ctx() { req, voteLoader }: MyContext
  ): Promise<number> {
    const userId = req.session.userId;
    if (userId) {
      const lastVote = await voteLoader.load({
        postId: post.id,
        userId: userId,
      });
      if (lastVote) {
        return lastVote.value;
      }
    }
    return 0;
  }

  @FieldResolver(() => User)
  async author(
    @Root() post: Post,
    @Ctx() { userLoader }: MyContext
  ): Promise<User> {
    return userLoader.load(post.authorId);
  }

  @FieldResolver(() => [Comment])
  async comments(@Root() post: Post): Promise<Comment[]> {
    return Comment.find({
      where: {
        postId: post.id,
      },
      order: {
        createdDate: "ASC",
      },
    });
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("cursor", () => String, { nullable: true })
    cursor: string | null,
    @Arg("idCursor", () => Int, { nullable: true })
    idCursor: number | null,
    @Arg("userId", () => Int, { nullable: true })
    userId: number | null,
    @Arg("sort", () => PostSort, {
      nullable: true,
      defaultValue: PostSort.createdDate,
    })
    sort: PostSort,
    @Arg("order", () => SortOrder, {
      nullable: true,
      defaultValue: SortOrder.DESC,
    })
    order: SortOrder,
    @Arg("period", () => SortPeriod, {
      nullable: true,
    })
    period: SortPeriod
  ): Promise<PaginatedPosts> {
    const cappedLimit = Math.min(50, limit);
    const query = getConnection()
      .getRepository(Post)
      .createQueryBuilder("posts")
      .orderBy(`posts.${sort}`, order)
      .take(cappedLimit + 1);

    // Filtering from period
    if (period && period !== SortPeriod.all) {
      const now = new Date();
      let startDate;
      if (period === SortPeriod.day) {
        startDate = addDays(now, -1);
      } else if (period === SortPeriod.week) {
        startDate = addWeeks(now, -1);
      } else if (period === SortPeriod.month) {
        startDate = addMonths(now, -1);
      } else {
        startDate = addYears(now, -1);
      }
      query.andWhere("posts.createdDate > :startDate", { startDate });
    }

    // Filtering from cursors
    if (cursor && idCursor) {
      const compare = order === SortOrder.DESC ? "<" : ">";
      query.andWhere(`posts.${sort} ${compare} :cursor`, { cursor });
      query.orWhere(`posts.${sort} = :cursor AND posts.id > :idCursor`, {
        cursor,
        idCursor,
      });
      query.addOrderBy("posts.id", "ASC");
    }

    // Filtering from userId
    if (userId) {
      query.andWhere("posts.authorId = :userId", { userId });
    }

    const posts = await query.getMany();

    return {
      id: `L:${limit}C:${cursor}IC:${idCursor}U:${userId}S:${sort}O:${order}P:${period}`,
      posts: posts.slice(0, cappedLimit),
      hasMore: posts.length === cappedLimit + 1,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    const post = await Post.findOne(id);
    if (post) {
      post.views++;
      await post.save();
    }
    return post;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    let previewImg;
    if (input.link) {
      previewImg = await getPreviewImg(input.link);
    }
    return Post.create({
      ...input,
      authorId: req.session.userId,
      previewImg: previewImg,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    let previewImg;
    if (input.link) {
      previewImg = await getPreviewImg(input.link);
    }
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ ...input, previewImg: previewImg })
      .where('id = :id and "authorId" = :authorId', {
        id: id,
        authorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOne(id);
    if (!post) return false;
    if (post.authorId !== req.session.userId) {
      throw new Error("not authorized");
    }
    await Vote.delete({ postId: id });
    await Comment.delete({ postId: id });
    const result = await Post.delete(id);
    return result.affected === 1;
  }
}
