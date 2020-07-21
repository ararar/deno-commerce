import { oak, dotenv, mysql } from "./deps.ts";
import adminRouter from "./admin/mod.ts";
const { Client } = mysql;

const env = dotenv.config();

const dbConfig = {
  hostname: env.DB_HOST,
  username: env.DB_USER,
  db: env.DB_NAME,
  password: env.DB_PASSWORD,
};

const client = await new Client().connect(dbConfig);
const result = await client.execute("SELECT CURDATE();");
console.log(result);

const app = new oak.Application();

// register some middleware
app.use(adminRouter.routes());
app.use(adminRouter.allowedMethods());

app.use((ctx: oak.Context) => {
  ctx.response.body = "Hello Deno Commerce 🎉";
});

const controller = new AbortController();
const { signal } = controller;

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? "https://" : "http://"}${
      hostname ?? "localhost"
    }:${port}`
  );
});

await app.listen({ port: 8000, signal });
