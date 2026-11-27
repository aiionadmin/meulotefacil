import assert from "node:assert/strict";
import {
  FORMAS_PAGAMENTO_VENDA,
  labelFormaPagamentoVenda,
  validatePermutaDescricao,
} from "./venda-pagamento";

assert.ok(
  FORMAS_PAGAMENTO_VENDA.some((f) => f.value === "permuta"),
  "permuta nas opções"
);
assert.equal(labelFormaPagamentoVenda("permuta"), "Permuta");
assert.equal(
  validatePermutaDescricao("permuta", ""),
  "Descreva como foi a permuta (obrigatório)"
);
assert.equal(
  validatePermutaDescricao("permuta", "   "),
  "Descreva como foi a permuta (obrigatório)"
);
assert.equal(
  validatePermutaDescricao("permuta", "Troca por terreno em Valinhos"),
  null
);
assert.equal(validatePermutaDescricao("pix", ""), null);
assert.equal(validatePermutaDescricao("plano", undefined), null);

console.log("ok: venda-pagamento");
