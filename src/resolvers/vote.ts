import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types/expressContext";
import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { Vote } from "../entities/Vote";

@Resolver()
export class VoteResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const userId = req.session.userId;
    const lastVote = await Vote.findOne({ postId, userId });
    // Make sure a vote only has single value
    const finalValue = value === 1 ? 1 : -1;

    if (lastVote && value === 0) {
      // Voted before and cancelling vote
      await getConnection().transaction(async (manager) => {
        await manager
          .createQueryBuilder()
          .delete()
          .from(Vote)
          .where({ userId: userId, postId: postId })
          .execute();
        await manager
          .createQueryBuilder()
          .update(Post)
          .set({ score: () => "score + :x" })
          .setParameter("x", -lastVote.value)
          .where("id = :postId", { postId: postId })
          .execute();
      });
    } else if (lastVote && lastVote.value !== finalValue) {
      // Voted before and changing vote value
      await getConnection().transaction(async (manager) => {
        await manager
          .createQueryBuilder()
          .update(Vote)
          .set({ value: value })
          .where({ userId: userId, postId: postId })
          .execute();
        await manager
          .createQueryBuilder()
          .update(Post)
          .set({ score: () => "score + :x" })
          .setParameter("x", finalValue - lastVote.value)
          .where("id = :postId", { postId: postId })
          .execute();
      });
    } else if (!lastVote) {
      // First time voting
      await getConnection().transaction(async (manager) => {
        await manager
          .createQueryBuilder()
          .insert()
          .into(Vote)
          .values({ userId: userId, postId: postId, value: finalValue })
          .execute();
        await manager
          .createQueryBuilder()
          .update(Post)
          .set({ score: () => "score + :x" })
          .setParameter("x", finalValue)
          .where("id = :postId", { postId: postId })
          .execute();
      });
    } else {
      // Voting with the same value of last vote
      return false;
    }

    return true;
  }
}
