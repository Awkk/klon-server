import "dotenv/config";
import { createConnection } from "typeorm";

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
  });
  console.log(connection.isConnected);
};

main();
