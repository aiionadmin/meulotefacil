/** npx tsx lib/import/bloco-k.test.ts */
import { upsertByOrigin } from "./idempotent";
import { runLotewinConference, conferenceSummary } from "./conference";
import { filtrarReceitasSemDuplicar } from "./revenue-dedup";
import { previewLotewinMdb } from "./mdb-reader";
import { LOTEWIN_PANEL_2026_11_24 } from "@/lib/domain/operacoes-seed";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

type Row = { legacySystem: string; legacyId: string; nome: string };

const first = upsertByOrigin<Row>(new Map(), [
  { legacySystem: "lotewin", legacyId: "p-1", nome: "Ana" },
  { legacySystem: "lotewin", legacyId: "p-2", nome: "Bruno" },
]);
assert(first.result.created === 2, "K01 cria 2");

const second = upsertByOrigin(first.next, [
  { legacySystem: "lotewin", legacyId: "p-1", nome: "Ana Souza" },
  { legacySystem: "lotewin", legacyId: "p-3", nome: "Carla" },
]);
assert(second.result.created === 1, "K01 cria 1 novo");
assert(second.result.updated === 1, "K01 atualiza 1");
assert(second.next.size === 3, "K01 total 3");

void (async () => {
  const bad = await previewLotewinMdb({ name: "planilha.csv", size: 10 });
  assert(bad.ok === false, "K02 rejeita csv");
  const ok = await previewLotewinMdb({ name: "Finance.mdb", size: 1024 });
  assert(ok.ok === true, "K02 aceita mdb");

  const checks = runLotewinConference({
    empreendimentos: LOTEWIN_PANEL_2026_11_24.empreendimentos,
    lotes: LOTEWIN_PANEL_2026_11_24.lotes,
    lotesVendidos: LOTEWIN_PANEL_2026_11_24.lotesVendidos,
    clientes: LOTEWIN_PANEL_2026_11_24.clientes,
    contratos: LOTEWIN_PANEL_2026_11_24.contratos,
    contratosAtivos: LOTEWIN_PANEL_2026_11_24.contratosAtivos,
    aReceber: LOTEWIN_PANEL_2026_11_24.aReceber,
    emAtraso: LOTEWIN_PANEL_2026_11_24.emAtraso,
  });
  assert(conferenceSummary(checks).allOk, "K03 conferência OK");

  const kept = filtrarReceitasSemDuplicar([
    {
      id: "1",
      origem: "contrato_lotewin",
      chaveNegocio: "ct-1001-p1",
      valor: 1000,
    },
    {
      id: "2",
      origem: "faturamento_mais_controle",
      chaveNegocio: "ct-1001-p1",
      valor: 1000,
      vendaLoteGenerica: true,
    },
    {
      id: "3",
      origem: "faturamento_mais_controle",
      chaveNegocio: "fat-obra-9",
      valor: 500,
    },
  ]);
  assert(kept.map((k) => k.id).join(",") === "1,3", "K04 anti-duplicação");

  console.log("OK bloco-k");
})();
