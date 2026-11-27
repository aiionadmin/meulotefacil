import assert from "node:assert/strict";
import { validateCartorioObrigatorio } from "./cartorio-required";

assert.equal(
  validateCartorioObrigatorio({ cartorioId: "", cartorioNome: "" }),
  "Cartório obrigatório — selecione um cadastrado ou informe o nome"
);
assert.equal(
  validateCartorioObrigatorio({ cartorioId: "  ", cartorioNome: "  " }),
  "Cartório obrigatório — selecione um cadastrado ou informe o nome"
);
assert.equal(
  validateCartorioObrigatorio({ cartorioId: "c1", cartorioNome: "" }),
  null
);
assert.equal(
  validateCartorioObrigatorio({ cartorioId: "", cartorioNome: "1º RI" }),
  null
);

console.log("ok: cartorio-required");
