import assert from "node:assert/strict";
import { mergeTableOverlay } from "./load-from-tables";

const base = {
  planos: [{ id: "a", nome: "Seed" }],
  config: { x: 1 },
  extra: "keep",
};

const overlay = {
  planos: [{ id: "b", nome: "Tabela" }],
  config: { x: 2 },
};

const merged = mergeTableOverlay(base, overlay);
assert.equal(merged.planos[0].id, "b");
assert.equal(merged.config.x, 2);
assert.equal(merged.extra, "keep");

const emptyArr = mergeTableOverlay(base, { planos: [] });
assert.equal(emptyArr.planos[0].id, "a");

const none = mergeTableOverlay(base, null);
assert.equal(none.planos[0].id, "a");

console.log("ok: load-from-tables-merge");
