import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types/expressContext";
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { PostInput } from "./types/postInput";
import { PaginatedPosts } from "./types/paginatedPosts";

@Resolver()
export class PostResolver {
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
      .leftJoinAndSelect("posts.author", "user")
      .orderBy("posts.createdDate", "DESC")
      .take(cappedLimit + 1);

    if (cursor) {
      query.where("posts.createdDate < :cursor", { cursor });
    }

    const posts = await query.getMany();

    return {
      posts: posts.slice(0, cappedLimit),
      hasMore: posts.length === cappedLimit + 1,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
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
    @Arg("input") input: PostInput
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ ...input })
      .where("id = :id", { id: id })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(@Arg("id", () => Int) id: number): Promise<boolean> {
    const result = await Post.delete(id);
    return result.affected === 1;
  }
}
