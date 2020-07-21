// admin module endpoints
import { oak, dejs } from "../deps.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";

const { Router } = oak;
const { renderFile } = dejs;
const { Buffer, copy, cwd } = Deno;

const THEME_NAME = "theme-two"; // TODO: Make this configurable

const THEME_DIR = `${cwd()}/admin/themes/${THEME_NAME}`;
const DEFAULT_VIEW_DIR = `${cwd()}/admin/views`;

const router = new Router();

router.prefix("/admin");

router.get("/", async (context) => {
  let template = `${THEME_DIR}/index.ejs`;

  if (!existsSync(template)) {
    template = `${DEFAULT_VIEW_DIR}/index.ejs`;
  }

  const output = await renderFile(template, {
    title: "Deno Commerce",
    heading: "hello, admin!",
  });

  const buf = new Buffer();
  await copy(output, buf);

  context.response.body = new TextDecoder().decode(buf.bytes());
  context.response.type = "text/html";
});

export default router;
