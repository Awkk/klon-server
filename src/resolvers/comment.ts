import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Comment } from "../entities/Comment";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types/expressContext";

@Resolver()
export class CommentResolver {
  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async createComment(
    @Arg("postId") postId: number,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment> {
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

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const comment = await Comment.findOne(id);
    if (!comment) return false;
    if (comment.authorId !== req.session.userId) {
      throw new Error("not authorized");
    }
    const result = await Post.delete(id);
    return result.affected === 1;
  }
}
