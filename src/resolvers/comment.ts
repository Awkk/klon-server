import { User } from "../entities/User";
import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Comment } from "../entities/Comment";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types/expressContext";

@Resolver(Comment)
export class CommentResolver {
  @FieldResolver(() => User)
  async author(@Root() comment: Comment, @Ctx() { userLoader }: MyContext) {
    return await userLoader.load(comment.authorId);
  }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async createComment(
    @Arg("postId", () => Int) postId: number,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment> {
    const post = await Post.findOne(postId);
    if (post) {
      post.commentsCount++;
      post.save();
    }
    return Comment.create({
      postId: postId,
      authorId: req.session.userId,
      text: text,
    }).save();
  }

  @Mutation(() => Comment, { nullable: true })
  @UseMiddleware(isAuth)
  async updateComment(
    @Arg("id", () => Int) id: number,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Comment)
      .set({ text: text })
      .where('id = :id and "authorId" = :authorId', {
        id: id,
        authorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Number, { nullable: true })
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<number | null> {
    const comment = await Comment.findOne(id);
    if (!comment) return null;
    if (comment.authorId !== req.session.userId) {
      throw new Error("not authorized");
    }
    await comment.remove();
    const post = await Post.findOne(comment.postId);
    if (post) {
      post.commentsCount--;
      post.save();
    }
    return post ? post.id : null;
  }
}
