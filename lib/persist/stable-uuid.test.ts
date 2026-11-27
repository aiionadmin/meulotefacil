import assert from "node:assert/strict";
import { stableUuid } from "./stable-uuid";

const a = stableUuid("plano-1");
const b = stableUuid("plano-1");
const c = stableUuid("plano-2");
assert.equal(a, b);
assert.notEqual(a, c);
assert.match(
  a,
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
);

const real = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
assert.equal(stableUuid(real), real);

console.log("ok: stable-uuid");
