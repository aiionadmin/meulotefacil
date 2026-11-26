/** G16/G17 — matriz de fluxo e demonstrativo mensal. */

import type {
  Categoria,
  Pagamento,
  PlanoConta,
  Recebimento,
} from "@/lib/domain/financeiro-types";

export type Granularidade = "diario" | "semanal" | "mensal";
export type Regime = "caixa" | "competencia";

export type FluxoCelula = {
  realizado: number;
  previsto: number;
};

export type FluxoLinha = {
  planoId: string;
  planoNome: string;
  fluxo: "receitas" | "despesas";
  porPeriodo: Record<string, FluxoCelula>;
  totalRealizado: number;
  totalPrevisto: number;
};

export type FluxoMatriz = {
  periodos: string[];
  linhas: FluxoLinha[];
  saldoInicial: number;
  saldos: { periodo: string; saldo: number }[];
};

export type ResultadoMensalLinha = {
  grupo: string;
  porMes: Record<string, number>;
  total: number;
};

function isoDay(d: string): string {
  return d.slice(0, 10);
}

/** Segunda-feira da semana ISO aproximada (YYYY-MM-DD → YYYY-Www). */
export function periodKey(isoDate: string, g: Granularidade): string {
  const day = isoDay(isoDate);
  if (g === "diario") return day;
  if (g === "mensal") return day.slice(0, 7);
  const dt = new Date(day + "T12:00:00");
  const onejan = new Date(dt.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((dt.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
  );
  return `${dt.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function matchCentro(
  label: string,
  visao: "geral" | "empresa" | "obra"
): boolean {
  if (visao === "geral") return true;
  if (visao === "empresa") return /empresa|meu lote/i.test(label);
  return !/^meu lote fácil$/i.test(label.trim());
}

function dataCaixaPag(p: Pagamento): string {
  return p.pagoEm?.slice(0, 10) || p.vencimento;
}

function dataCaixaRec(r: Recebimento): string {
  return r.recebidoEm?.slice(0, 10) || r.vencimento;
}

export function buildFluxoMatriz(input: {
  planos: PlanoConta[];
  categorias: Categoria[];
  pagamentos: Pagamento[];
  recebimentos: Recebimento[];
  saldoInicial: number;
  visao: "geral" | "empresa" | "obra";
  granularidade: Granularidade;
}): FluxoMatriz {
  const catToPlano = new Map(
    input.categorias.map((c) => [c.id, c.planoId] as const)
  );
  const periodoSet = new Set<string>();
  const acc = new Map<string, Record<string, FluxoCelula>>();

  const bump = (
    planoId: string,
    periodo: string,
    kind: "realizado" | "previsto",
    valor: number
  ) => {
    if (!acc.has(planoId)) acc.set(planoId, {});
    const row = acc.get(planoId)!;
    if (!row[periodo]) row[periodo] = { realizado: 0, previsto: 0 };
    row[periodo][kind] += valor;
    periodoSet.add(periodo);
  };

  for (const p of input.pagamentos) {
    if (!matchCentro(p.centroLabel, input.visao)) continue;
    const planoId = catToPlano.get(p.categoriaId);
    if (!planoId) continue;
    const per = periodKey(dataCaixaPag(p), input.granularidade);
    if (p.status === "pago") {
      bump(planoId, per, "realizado", p.valorPago);
    } else {
      bump(planoId, per, "previsto", p.valor);
    }
  }

  // Receitas: plano sintético "receitas"
  const receitaPlanoId = input.planos.find((p) => p.fluxo === "receitas")?.id;
  for (const r of input.recebimentos) {
    if (!matchCentro(r.centroLabel, input.visao)) continue;
    const per = periodKey(dataCaixaRec(r), input.granularidade);
    const pid = receitaPlanoId ?? "__receitas__";
    if (r.status === "recebido") {
      bump(pid, per, "realizado", r.valorRecebido);
    } else {
      bump(pid, per, "previsto", r.valor);
    }
  }

  const periodos = [...periodoSet].sort();
  const linhas: FluxoLinha[] = input.planos
    .filter((p) => p.ativo)
    .map((p) => {
      const porPeriodo = acc.get(p.id) ?? {};
      let totalRealizado = 0;
      let totalPrevisto = 0;
      for (const per of periodos) {
        const c = porPeriodo[per] ?? { realizado: 0, previsto: 0 };
        totalRealizado += c.realizado;
        totalPrevisto += c.previsto;
      }
      // incluir planos sem movimento só se houver algo
      return {
        planoId: p.id,
        planoNome: p.nome,
        fluxo: p.fluxo,
        porPeriodo,
        totalRealizado: Math.round(totalRealizado * 100) / 100,
        totalPrevisto: Math.round(totalPrevisto * 100) / 100,
      };
    })
    .filter((l) => l.totalRealizado || l.totalPrevisto);

  // saldo acumulado (receitas realizadas − despesas realizadas)
  let running = input.saldoInicial;
  const saldos = periodos.map((periodo) => {
    let rec = 0;
    let desp = 0;
    for (const l of linhas) {
      const c = l.porPeriodo[periodo];
      if (!c) continue;
      if (l.fluxo === "receitas") rec += c.realizado;
      else desp += c.realizado;
    }
    running = Math.round((running + rec - desp) * 100) / 100;
    return { periodo, saldo: running };
  });

  return {
    periodos,
    linhas,
    saldoInicial: input.saldoInicial,
    saldos,
  };
}

export function buildResultadosMensais(input: {
  planos: PlanoConta[];
  categorias: Categoria[];
  pagamentos: Pagamento[];
  recebimentos: Recebimento[];
  visao: "geral" | "empresa" | "obra";
  regime: Regime;
}): { meses: string[]; linhas: ResultadoMensalLinha[] } {
  const catToPlano = new Map(
    input.categorias.map((c) => [c.id, c.planoId] as const)
  );
  const planoById = new Map(input.planos.map((p) => [p.id, p] as const));
  const mesSet = new Set<string>();
  const map = new Map<string, Record<string, number>>();

  const bump = (grupo: string, mes: string, valor: number) => {
    if (!map.has(grupo)) map.set(grupo, {});
    const row = map.get(grupo)!;
    row[mes] = (row[mes] ?? 0) + valor;
    mesSet.add(mes);
  };

  for (const p of input.pagamentos) {
    if (!matchCentro(p.centroLabel, input.visao)) continue;
    if (input.regime === "caixa" && p.status !== "pago") continue;
    const data =
      input.regime === "caixa" ? dataCaixaPag(p) : p.vencimento;
    if (!data) continue;
    const mes = data.slice(0, 7);
    const plano = planoById.get(catToPlano.get(p.categoriaId) ?? "");
    if (!plano || plano.grupoResultados === "Somente Fluxo de Caixa") continue;
    const valor =
      input.regime === "caixa" ? p.valorPago : p.valor;
    bump(plano.grupoResultados, mes, -Math.abs(valor));
  }

  for (const r of input.recebimentos) {
    if (!matchCentro(r.centroLabel, input.visao)) continue;
    if (input.regime === "caixa" && r.status !== "recebido") continue;
    const data =
      input.regime === "caixa" ? dataCaixaRec(r) : r.vencimento;
    const mes = data.slice(0, 7);
    const valor =
      input.regime === "caixa" ? r.valorRecebido : r.valor;
    bump("Receita Operacional Bruta", mes, valor);
  }

  const meses = [...mesSet].sort();
  const linhas = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([grupo, porMes]) => {
      let total = 0;
      for (const m of meses) total += porMes[m] ?? 0;
      return {
        grupo,
        porMes,
        total: Math.round(total * 100) / 100,
      };
    });

  return { meses, linhas };
}
