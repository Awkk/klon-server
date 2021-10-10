import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  try {
    // PostgreSQL connection
    await createConnection({
      type: "postgres",
      url: process.env.DATABASE_URL,
      logging: true,
      synchronize: true,
      entities: [Post, User],
    });

    // Express
    const app = express();
    const port = process.env.PORT;

    // Apollo Server
    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [PostResolver, UserResolver],
      }),
      context: ({ req, res }) => ({
        req,
        res,
      }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    // Start server
    app.listen(port, () => {
      console.log("server listening on port:", port);
    });
  } catch (err) {
    console.error(err);
  }
};

main();
