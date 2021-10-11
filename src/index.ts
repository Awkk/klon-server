import "dotenv/config";
import "reflect-metadata";
import express from "express";
import session from "express-session";
import redis from "redis";
import connectRedis from "connect-redis";
import cors from "cors";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { COOKIE_NAME, __prod__ } from "./constants";
import { MyContext } from "./types/expressContext";
import https from "https";
import fs from "fs";
import path from "path";

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

    app.use(
      cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      })
    );

    // Redis connection
    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();
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
        resolvers: [PostResolver, UserResolver],
      }),
      context: ({ req, res }): MyContext => ({
        req,
        res,
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
