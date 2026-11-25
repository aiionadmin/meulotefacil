/** npx tsx lib/money/orcamento.test.ts */
import { custoLinha, precoComBdi, totaisOrcamento } from "./orcamento";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

assert(custoLinha({ quantidade: 10, custoUnit: 25 }) === 250, "custo linha");
assert(precoComBdi(100, 0.25) === 125, "bdi 25%");

const tot = totaisOrcamento(
  [
    { quantidade: 10, custoUnit: 100, bdiPct: 0.2 },
    { quantidade: 2, custoUnit: 500, bdiPct: 0.3 },
  ],
  0.25
);
assert(tot.custo === 2000, "custo total");
assert(tot.preco === 2500, "preço 10*100*1.2 + 2*500*1.3");

console.log("OK orcamento", tot);
