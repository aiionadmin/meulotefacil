import { reactNodeText } from "./list-export";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(reactNodeText("ok") === "ok", "string");
assert(reactNodeText(42) === "42", "number");
assert(reactNodeText(null) === "", "null");
assert(reactNodeText(["a", "b"]) === "a b", "array");
assert(
  reactNodeText({ props: { children: "pill" } }) === "pill",
  "element-like"
);

console.log("ok: list-export");
