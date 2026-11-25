/** npx tsx lib/domain/financeiro-flow.test.ts */
import { seedFinanceiro, planoDaCategoria } from "./financeiro-seed";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const seed = seedFinanceiro();
assert(seed.planos.length >= 16, "planos de despesa carregados");
assert(seed.categorias.length >= 40, "categorias carregadas");
assert(seed.naturezas.length === 11, "naturezas de receita");

const mat = seed.categorias.find((c) => c.nome === "Materiais");
assert(!!mat, "categoria Materiais");
const plano = planoDaCategoria(seed, mat!.id);
assert(plano?.nome === "Materiais", "Materiais → plano Materiais");
assert(mat!.classificacaoObra === "Materiais", "classificação obra");

const somenteFc = seed.planos.filter(
  (p) => p.grupoResultados === "Somente Fluxo de Caixa"
);
assert(somenteFc.length >= 3, "planos só fluxo de caixa");

const contrato = seed.recebimentos.find((r) => r.origem === "contrato");
assert(!!contrato?.contratoRef, "recebimento origem contrato");

const rateio = seed.pagamentos.filter((p) => p.lancamentoId === "lan-demo");
assert(rateio.length === 2, "seed rateio 2 parcelas");

console.log("OK financeiro-flow", {
  planos: seed.planos.length,
  categorias: seed.categorias.length,
  pagamentos: seed.pagamentos.length,
});
