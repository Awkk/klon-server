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
import { PaginatedPosts } from "./types/paginatedPosts";
import { PostInput } from "./types/postInput";

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
    cursor: number | null
  ): Promise<PaginatedPosts> {
    const cappedLimit = Math.min(50, limit);
    const query = getConnection()
      .getRepository(Post)
      .createQueryBuilder("posts")
      .orderBy("posts.createdDate", "DESC")
      .take(cappedLimit + 1);

    if (cursor) {
      query.where("posts.createdDate < :cursor", { cursor });
    }

    const posts = await query.getMany();

    return {
      id: `L:${limit}C:${cursor}`,
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
    return Post.create({ ...input, authorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ ...input })
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
    const result = await Post.delete(id);
    return result.affected === 1;
  }
}
