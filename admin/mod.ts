// admin module endpoints
import { oak, dejs } from "../deps.ts";

const { Router } = oak;
const { renderFile } = dejs;
const { Buffer, copy } = Deno;

const THEME_NAME = "theme-one";
const THEME_LOCATION = `${Deno.cwd()}/admin/themes/${THEME_NAME}`;

const router = new Router();

router.prefix("/admin");

router.get("/", async (context) => {
  const output = await renderFile(`${THEME_LOCATION}/index.ejs`, {});

  const buf = new Buffer();
  await copy(output, buf);

  context.response.body = new TextDecoder().decode(buf.bytes());
  context.response.type = "text/html";
});

export default router;
