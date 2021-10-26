import DataLoader from "dataloader";
import { Vote } from "../entities/Vote";

export const createVoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Vote>(async (keys) => {
    const votes = await Vote.findByIds(keys as any);
    const updootIdsToUpdoot: Record<string, Vote> = {};
    votes.forEach((vote) => {
      updootIdsToUpdoot[`${vote.userId}|${vote.postId}`] = vote;
    });

    return keys.map((key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]);
  });
