import { Request, Response } from "express";
import { createUserLoader } from "../dataLoaders/createUserLoader";

export type MyContext = {
  req: Request;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
};
