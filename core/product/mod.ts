// register the core product module
import { oak } from "../../deps.ts";

const { Router } = oak;

const router = new Router();

router.prefix("/products");

router.get("/", async (context) => {
  context.response.body = { "message": "hello, products" };
  context.response.type = "application/json";
});

export default router;
