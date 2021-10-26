import { Request, Response } from "express";
import { createVoteLoader } from "../dataLoaders/createVoteLoader";
import { createUserLoader } from "../dataLoaders/createUserLoader";

export type MyContext = {
  req: Request;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  voteLoader: ReturnType<typeof createVoteLoader>;
};
