/** npx tsx lib/domain/financeiro-plano-crud.test.ts */
import { seedFinanceiro } from "./financeiro-seed";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const seed = seedFinanceiro();
const mat = seed.categorias.find((c) => c.nome === "Materiais")!;
const usadaEmLan = seed.lancamentos.some((l) => l.categoriaId === mat.id);
const usadaEmPag = seed.pagamentos.some((p) => p.categoriaId === mat.id);
assert(usadaEmLan || usadaEmPag, "Materiais referenciada no seed");

const livre = seed.categorias.find(
  (c) =>
    !seed.lancamentos.some((l) => l.categoriaId === c.id) &&
    !seed.pagamentos.some((p) => p.categoriaId === c.id)
);
assert(!!livre, "existe categoria sem lançamento");

assert(seed.naturezas.length === 15, "15 naturezas");
assert(
  seed.planos.some((p) => p.nome === "Receita Operacional Bruta"),
  "plano receita"
);

console.log("ok: financeiro-plano-crud");
