// register sample plugin
import { Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();

router.prefix("/plugin-one");

router.get("/", async (context) => {
  context.response.body = { "message": "hello, plugin" };
  context.response.type = "application/json";
});

export default router;
