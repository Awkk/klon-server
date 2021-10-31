import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import "dotenv/config";
import express from "express";
import session from "express-session";
import fs from "fs";
import https from "https";
import path from "path";
import redis from "redis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { createUserLoader } from "./dataLoaders/createUserLoader";
import { createVoteLoader } from "./dataLoaders/createVoteLoader";
import { Comment } from "./entities/Comment";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Vote } from "./entities/Vote";
import { CommentResolver } from "./resolvers/comment";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { VoteResolver } from "./resolvers/vote";
import { MyContext } from "./types/expressContext";

const main = async () => {
  try {
    // PostgreSQL connection
    const dbCon = await createConnection({
      type: "postgres",
      url: process.env.DATABASE_URL,
      logging: true,
      //synchronize: true,
      entities: [Post, User, Vote, Comment],
      migrations: [path.join(__dirname, "./migrations/*")],
    });
    await dbCon.runMigrations();

    // Express
    const app = express();
    const port = process.env.PORT;
    app.set("trust proxy", 1);
    app.use(
      cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      })
    );

    // Redis connection
    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient({ url: process.env.REDIS_URL });
    // Session based authentication with Redis
    app.use(
      session({
        store: new RedisStore({ client: redisClient, disableTouch: true }),
        cookie: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
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
        resolvers: [PostResolver, UserResolver, VoteResolver, CommentResolver],
      }),
      context: ({ req, res }): MyContext => ({
        req,
        res,
        userLoader: createUserLoader(),
        voteLoader: createVoteLoader(),
      }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
      app,
      cors: false,
    });

    if (__prod__) {
      // Start server in production
      app.listen(port, () => {
        console.log("server listening on port:", port);
      });
    } else {
      // Create https server in development for cookies cors setting
      const sslFolder = path.join(__dirname, "..", "local-ssl");
      const manualServer = https.createServer(
        {
          key: fs.readFileSync(`${sslFolder}/key.pem`),
          cert: fs.readFileSync(`${sslFolder}/cert.pem`),
          passphrase: process.env.SSL_PASSPHASE,
        },
        app
      );

      manualServer.listen(port, () => {
        console.log("development server listening on port:", port);
      });
    }
  } catch (err) {
    console.error(err);
  }
};

main();
