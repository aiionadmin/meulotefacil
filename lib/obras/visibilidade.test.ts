import assert from "node:assert/strict";
import { canSeeObra, filterObrasVisiveis } from "./visibilidade";

const obraA = { id: "o1", visivelPara: ["Administrador", "Comercial"] };
const obraB = { id: "o2", visivelPara: ["Engenharia"] };
const obraC = { id: "o3", visivelPara: ["Maria Silva"] };

const admin = { id: "u1", nome: "Admin", chave: true };
const comercial = { id: "u2", nome: "João", verTodasObras: false };
const engenharia = { id: "u3", nome: "Ana", obraIds: ["o2"] };
const maria = { id: "u4", nome: "Maria Silva" };

assert.equal(canSeeObra(obraA, admin, "Comercial"), true);
assert.equal(canSeeObra(obraA, comercial, "Comercial"), true);
assert.equal(canSeeObra(obraA, comercial, "Engenharia"), false);
assert.equal(canSeeObra(obraB, engenharia, "Financeiro"), true);
assert.equal(canSeeObra(obraB, comercial, "Comercial"), false);
assert.equal(canSeeObra(obraC, maria, "Comercial"), true);
assert.equal(canSeeObra(obraA, null, "Administrador"), false);

const list = filterObrasVisiveis([obraA, obraB, obraC], comercial, "Comercial");
assert.deepEqual(
  list.map((o) => o.id),
  ["o1"]
);

assert.equal(
  canSeeObra(obraB, { id: "u5", nome: "X", verTodasObras: true }, "Comercial"),
  true
);

console.log("ok: obras-visibilidade");
