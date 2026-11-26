/** D12 — cronograma físico-financeiro por período. */

import type {
  CronogramaItem,
  CurvaSPonto,
  OrcamentoNode,
} from "@/lib/domain/obras-types";

export type FisicoFinanceiroLinha = {
  periodo: string;
  atividades: number;
  fisicoPlanPct: number;
  fisicoRealPct: number;
  finPlan: number;
  finReal: number;
  saldoFin: number;
};

function ym(iso: string): string {
  return iso.slice(0, 7);
}

function monthsBetween(a: string, b: string): string[] {
  const start = ym(a);
  const end = ym(b);
  if (!start || !end) return [];
  const out: string[] = [];
  let [y, m] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    if (out.length > 48) break;
  }
  return out;
}

/**
 * Agrega cronograma + Curva S + itens do orçamento em linhas mensais.
 * Custo planejado do cronograma é rateado pelo número de meses da atividade
 * usando o orçado do node vinculado (ou 0).
 */
export function buildFisicoFinanceiro(input: {
  cronograma: CronogramaItem[];
  curvaS: CurvaSPonto[];
  nodes: OrcamentoNode[];
}): FisicoFinanceiroLinha[] {
  const nodeById = new Map(input.nodes.map((n) => [n.id, n]));
  const map = new Map<
    string,
    {
      atividades: number;
      finPlan: number;
      fisicoPlanPct: number;
      fisicoRealPct: number;
      finReal: number;
    }
  >();

  const ensure = (p: string) => {
    if (!map.has(p)) {
      map.set(p, {
        atividades: 0,
        finPlan: 0,
        fisicoPlanPct: 0,
        fisicoRealPct: 0,
        finReal: 0,
      });
    }
    return map.get(p)!;
  };

  for (const c of input.cronograma) {
    const periodos = monthsBetween(c.inicio, c.fim);
    if (!periodos.length) continue;
    const node = c.nodeId ? nodeById.get(c.nodeId) : undefined;
    const orcado = node?.orcado ?? 0;
    const share = orcado / periodos.length;
    for (const p of periodos) {
      const row = ensure(p);
      row.atividades += 1;
      row.finPlan += share;
    }
  }

  for (const ponto of input.curvaS) {
    const p = ponto.periodo.length === 7 ? ponto.periodo : ym(ponto.periodo);
    const row = ensure(p);
    row.fisicoPlanPct = Math.max(row.fisicoPlanPct, ponto.planejadoFisico);
    row.fisicoRealPct = Math.max(row.fisicoRealPct, ponto.realizadoFisico);
    if (!row.finPlan) row.finPlan = ponto.planejadoFinanceiro;
    row.finReal = Math.max(row.finReal, ponto.realizadoFinanceiro);
  }

  // realizados sem curva: soma itens com físico > 0 rateados no mês corrente se houver
  if (!input.curvaS.length) {
    const realTotal = input.nodes
      .filter((n) => n.kind === "item")
      .reduce((a, n) => a + n.realizado, 0);
    const fisAvg =
      input.nodes.filter((n) => n.kind === "item").length === 0
        ? 0
        : input.nodes
            .filter((n) => n.kind === "item")
            .reduce((a, n) => a + n.fisicoPct, 0) /
          input.nodes.filter((n) => n.kind === "item").length;
    for (const row of map.values()) {
      if (!row.finReal) row.finReal = realTotal / Math.max(1, map.size);
      if (!row.fisicoRealPct) row.fisicoRealPct = Math.round(fisAvg);
    }
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodo, r]) => ({
      periodo,
      atividades: r.atividades,
      fisicoPlanPct: Math.round(r.fisicoPlanPct),
      fisicoRealPct: Math.round(r.fisicoRealPct),
      finPlan: Math.round(r.finPlan * 100) / 100,
      finReal: Math.round(r.finReal * 100) / 100,
      saldoFin: Math.round((r.finPlan - r.finReal) * 100) / 100,
    }));
}
