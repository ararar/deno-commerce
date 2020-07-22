import { dotenv } from "../deps.ts";

const env = dotenv.config();

const dbConfig = {
  hostname: env.DB_HOST,
  username: env.DB_USER,
  db: env.DB_NAME,
  password: env.DB_PASSWORD,
};

export {
  dbConfig,
};
