import { aplicarFatorReajuste } from "./reajuste";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const base = [
  {
    id: "1",
    contractId: "c1",
    valor: 100,
    status: "em_aberto",
    correcao: 0,
  },
  {
    id: "2",
    contractId: "c1",
    valor: 100.33,
    status: "em_aberto",
    correcao: 0,
  },
  { id: "3", contractId: "c1", valor: 50, status: "paga", correcao: 0 },
];

const { atualizadas, qtd } = aplicarFatorReajuste(base, 1.045, {
  gerarResiduo: true,
});

assert(qtd === 2, `qtd ${qtd}`);
assert(atualizadas[0].valor === 104.5, `v0 ${atualizadas[0].valor}`);
assert(atualizadas[2].valor === 50, "paga intacta");
assert(atualizadas[0].correcao === 4.5, `corr ${atualizadas[0].correcao}`);

const undo = aplicarFatorReajuste(atualizadas, 1 / 1.045);
assert(Math.abs(undo.atualizadas[0].valor - 100) < 0.02, "undo aprox");

// Fator com sobra de arredondamento acumulada ≥ R$ 0,01
const weird = [
  { id: "a", contractId: "c2", valor: 33.33, status: "em_aberto", correcao: 0 },
  { id: "b", contractId: "c2", valor: 33.33, status: "em_aberto", correcao: 0 },
  { id: "c", contractId: "c2", valor: 33.33, status: "em_aberto", correcao: 0 },
];
const withRes = aplicarFatorReajuste(weird, 1.001, { gerarResiduo: true });
assert(withRes.qtd === 3, "qtd weird");
console.log("ok: reajuste + residuos", { residuos: withRes.residuos });
