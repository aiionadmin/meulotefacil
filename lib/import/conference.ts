import { LOTEWIN_PANEL_2026_11_24 } from "@/lib/domain/operacoes-seed";

/** K03 — conferência automática contra o painel LoteWin 24/11/2026. */

export type ConferenceCheck = {
  id: string;
  label: string;
  expected: number;
  actual: number;
  unit: "count" | "money";
  ok: boolean;
  delta: number;
};

export type ConferenceInput = {
  empreendimentos: number;
  lotes: number;
  lotesVendidos: number;
  clientes: number;
  contratos: number;
  contratosAtivos: number;
  aReceber: number;
  emAtraso: number;
};

const PANEL = LOTEWIN_PANEL_2026_11_24;

function check(
  id: string,
  label: string,
  expected: number,
  actual: number,
  unit: "count" | "money"
): ConferenceCheck {
  const delta =
    unit === "money"
      ? Math.round((actual - expected) * 100) / 100
      : actual - expected;
  return {
    id,
    label,
    expected,
    actual,
    unit,
    ok: delta === 0,
    delta,
  };
}

export function runLotewinConference(input: ConferenceInput): ConferenceCheck[] {
  return [
    check(
      "emp",
      "Empreendimentos",
      PANEL.empreendimentos,
      input.empreendimentos,
      "count"
    ),
    check("lotes", "Lotes", PANEL.lotes, input.lotes, "count"),
    check(
      "vendidos",
      "Lotes vendidos",
      PANEL.lotesVendidos,
      input.lotesVendidos,
      "count"
    ),
    check("clientes", "Clientes", PANEL.clientes, input.clientes, "count"),
    check("contratos", "Contratos", PANEL.contratos, input.contratos, "count"),
    check(
      "ativos",
      "Contratos ativos",
      PANEL.contratosAtivos,
      input.contratosAtivos,
      "count"
    ),
    check("a_receber", "A receber", PANEL.aReceber, input.aReceber, "money"),
    check("em_atraso", "Em atraso", PANEL.emAtraso, input.emAtraso, "money"),
  ];
}

export function conferenceSummary(checks: ConferenceCheck[]) {
  const ok = checks.filter((c) => c.ok).length;
  return { ok, total: checks.length, allOk: ok === checks.length };
}
