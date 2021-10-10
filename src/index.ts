import "dotenv/config";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    synchronize: true,
    entities: [Post],
  });
};

main().catch((err) => {
  console.error(err);
});
