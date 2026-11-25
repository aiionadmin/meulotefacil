/** npx tsx lib/domain/demandas-integracoes.test.ts */
import { relatorioDemandas, seedParte5 } from "./parte5-seed";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const seed = seedParte5();
assert(seed.materiaisVenda.length >= 3, "materiais de venda");
assert(
  seed.materiaisVenda.every((m) => m.url.startsWith("/materiais/")),
  "urls públicas"
);

const dem = seed.demandas[0];
assert(!!dem.custoPrevisto, "demanda com custo para cobrança");

const rel = relatorioDemandas({
  ...seed,
  hoje: "2026-11-25",
});
assert(rel.porTipo.some((t) => t.qtd > 0), "relatório por tipo");
assert(typeof rel.tempoMedioDias === "number", "tempo médio");
assert(rel.atrasadas >= 0, "atrasadas");

console.log("OK demandas-integracoes", {
  materiais: seed.materiaisVenda.length,
  rel,
});
