import "dotenv/config";
import "reflect-metadata";
import express from "express";
import session from "express-session";
import redis from "redis";
import connectRedis from "connect-redis";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { COOKIE_NAME, __prod__ } from "./constants";
import { MyContext } from "./types/expressContext";

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

    // Redis connection
    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();
    // Session based authentication with Redis
    app.use(
      session({
        store: new RedisStore({ client: redisClient, disableTouch: true }),
        cookie: {
          sameSite: "lax",
          secure: __prod__,
        },
        name: COOKIE_NAME,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false,
      })
    );

    // Apollo Server
    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [PostResolver, UserResolver],
      }),
      context: ({ req, res }): MyContext => ({
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
