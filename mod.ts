import { oak, mysql } from "./deps.ts";
import { readJsonSync } from "https://deno.land/std/fs/mod.ts";

import { dbConfig } from "./config/site.ts";

import adminRouter from "./admin/mod.ts";
import productRouter from "./core/product/mod.ts";

const { Client } = mysql;

const client = await new Client().connect(dbConfig);
const result = await client.execute("SELECT CURDATE();");
console.log(result);

const app = new oak.Application();

// register some middleware
app.use(adminRouter.routes());
app.use(adminRouter.allowedMethods()); // What is allowedMethods?

// register core modules
app.use(productRouter.routes());

// TODO: Error checks
const siteOptions = <Record<string, any>> (
  readJsonSync(`${Deno.cwd()}/config/options.json`)
);

// hard coded plugin functionality
const pluginOneOptions = siteOptions.plugins["plugin-one"];
if (pluginOneOptions.enabled) {
  const { default: pluginOneRouter } = await import(
    `${Deno.cwd()}/plugins/${pluginOneOptions.name}/${pluginOneOptions.root}`
  );
  app.use(pluginOneRouter.routes());
}

// Send static content
app.use(async (context) => {
  await context.send({
    root: `${Deno.cwd()}/static`,
  });
});

app.use((ctx: oak.Context) => {
  ctx.response.body = "Hello Deno Commerce 🎉";
});

const controller = new AbortController();
const { signal } = controller;

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? "https://" : "http://"}${hostname ??
      "localhost"}:${port}`,
  );
});

await app.listen({ port: 8000, signal });
