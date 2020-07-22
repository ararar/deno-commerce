import { oak, mysql } from "./deps.ts";
import { readJsonSync } from "https://deno.land/std@0.61.0/fs/mod.ts";

import {
  green,
  cyan,
  bold,
  yellow,
  red,
} from "https://deno.land/std@0.61.0/fmt/colors.ts";

import { dbConfig } from "./config/site.ts";

import adminRouter from "./admin/mod.ts";
import productRouter from "./core/product/mod.ts";

const { Application } = oak;
const { Client } = mysql;

const client = await new Client().connect(dbConfig);
const result = await client.execute("SELECT CURDATE();");
console.log(result);

const app = new Application();

// TODO: Push to error logs
// Error handler middleware
app.use(async (context, next) => {
  try {
    await next();
  } catch (e) {
    if (e instanceof oak.HttpError) {
      context.response.status = e.status as any;
      if (e.expose) {
        context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>${e.status} - ${e.message}</h1>
              </body>
            </html>`;
      } else {
        context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>${e.status} - ${oak.Status[e.status]}</h1>
              </body>
            </html>`;
      }
    } else if (e instanceof Error) {
      context.response.status = 500;
      context.response.body = `<!DOCTYPE html>
            <html>
              <body>
                <h1>500 - Internal Server Error</h1>
              </body>
            </html>`;
      console.log("Unhandled Error:", red(bold(e.message)));
      console.log(e.stack);
    }
  }
});

// TODO: Improve and centralize logging
// Basic Logger
app.use(async (context, next) => {
  await next();

  const rt = context.response.headers.get("X-Response-Time");

  const message =
    `${context.request.method} ${context.request.url.pathname} - ${
      String(rt)
    }\n`;

  const logsFolder = `${Deno.cwd()}/logs`;
  const fileName = `${new Date().toDateString().split(" ").join("-")}.txt`;

  await Deno.mkdir(logsFolder, { recursive: true });

  await Deno.writeTextFile(`${logsFolder}/${fileName}`, message, {
    append: true,
  });

  console.log(
    `${green(context.request.method)} ${cyan(context.request.url.pathname)} - ${
      bold(String(rt))
    }`,
  );
});

// TODO: Include in logs
// Response Time
app.use(async (context, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  context.response.headers.set("X-Response-Time", `${ms}ms`);
});

// register some middleware
app.use(adminRouter.routes());
app.use(adminRouter.allowedMethods()); // What is allowedMethods?

// register core modules
app.use(productRouter.routes());

// TODO: Error checks
const siteOptions = <Record<string, any>> (
  readJsonSync(`${Deno.cwd()}/config/options.json`)
);

// TODO: hard coded plugin functionality
const pluginOneOptions = siteOptions.plugins["plugin-one"];
if (pluginOneOptions.enabled) {
  const { default: pluginOneRouter } = await import(
    `${Deno.cwd()}/plugins/${pluginOneOptions.name}/${pluginOneOptions.root}`
  );
  app.use(pluginOneRouter.routes());
}

const rootRouter = new oak.Router();
rootRouter.get("/", (ctx) => {
  ctx.response.body = "Hello Deno Commerce 🎉";
});
app.use(rootRouter.routes());

// Send static content
app.use(async (context) => {
  await context.send({
    root: `${Deno.cwd()}/static`,
  });
});

const controller = new AbortController();
const { signal } = controller;

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    bold(`Listening on: ${secure ? "https://" : "http://"}`) +
      yellow(`${hostname ?? "localhost"}:${port}`),
  );
});

await app.listen({ hostname: "127.0.0.1", port: 8000, signal });
console.log(bold("Finished."));
