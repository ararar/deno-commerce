import { Oak } from "./deps.ts";
import adminRouter from "./admin/mod.ts";

const app = new Oak.Application();

// register some middleware
app.use(adminRouter.routes());
app.use(adminRouter.allowedMethods());

app.use((ctx: Oak.Context) => {
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
