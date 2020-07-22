import { assertEquals } from "https://deno.land/std@0.61.0/testing/asserts.ts";

Deno.test({
  name: "Hello Deno Commerce 🎉",
  fn: () => {
    const yay = "yay";
    assertEquals(yay, "yay");
  },
});
