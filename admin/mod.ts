// admin module endpoints
import { oak, dejs } from "../deps.ts";
import { existsSync, readJsonSync } from "https://deno.land/std/fs/mod.ts";

const { Router } = oak;
const { renderFile } = dejs;
const { Buffer, copy, cwd } = Deno;

// TODO: Assert and error checks
const siteOptions = <Record<string, any>> readJsonSync(
  `${Deno.cwd()}/config/options.json`,
);
const THEME_NAME = siteOptions.theme;

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
