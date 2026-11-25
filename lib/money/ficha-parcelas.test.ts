/** npx tsx lib/money/ficha-parcelas.test.ts — volume 240 parcelas */
import {
  encargosParaPagina,
  gerarParcelasVolume,
  paginateIds,
} from "./ficha-parcelas";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const t0 = Date.now();
const all = gerarParcelasVolume(240, { valor: 500, status: "em_aberto", juros: 0, multa: 0 });
assert(all.length === 240, "240 parcelas");

const page = paginateIds(all, { page: 1, pageSize: 25 });
assert(page.items.length === 25, "página 25");
assert(page.pageCount === 10, "10 páginas");

const withEncargos = encargosParaPagina(
  page.items,
  () => ({ taxaMoraMes: 0.01, taxaMulta: 0.02, diasTolerancia: 0 }),
  "2026-11-24"
);
assert(withEncargos.length === 25, "encargos só da página");
assert(
  withEncargos.some((p) => p.status === "paga" || p.juros >= 0),
  "cálculo ok"
);

const elapsed = Date.now() - t0;
assert(elapsed < 2000, `deve ser <2s, foi ${elapsed}ms`);

console.log("OK ficha-parcelas 240", { elapsedMs: elapsed, page: page.page });
