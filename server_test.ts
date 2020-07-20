import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test({
  name: "Hello Deno Commerce 🎉",
  fn: () => {
    const yay = "yay";
    assertEquals(yay, "yay");
  },
});
