/** §7 — faixas de vencimento por conta (pagamentos / recebimentos). */

export type AgingFaixaId = "vencidos90" | "hoje" | "em7" | "em30";

export type AgingFaixa = {
  id: AgingFaixaId;
  label: string;
  qtd: number;
  valor: number;
};

export type AgingPorConta = {
  contaId: string;
  contaNome: string;
  faixas: AgingFaixa[];
};

function daysFromToday(iso: string) {
  const t = new Date(iso + "T12:00:00").getTime();
  const n = new Date();
  n.setHours(12, 0, 0, 0);
  return Math.round((t - n.getTime()) / 86400000);
}

function emptyFaixas(): AgingFaixa[] {
  return [
    { id: "vencidos90", label: "Vencidos (90d)", qtd: 0, valor: 0 },
    { id: "hoje", label: "Hoje", qtd: 0, valor: 0 },
    { id: "em7", label: "Em 7 dias", qtd: 0, valor: 0 },
    { id: "em30", label: "Em 30 dias", qtd: 0, valor: 0 },
  ];
}

function faixaForDays(d: number): AgingFaixaId | null {
  if (d < 0 && d >= -90) return "vencidos90";
  if (d === 0) return "hoje";
  if (d >= 1 && d <= 7) return "em7";
  if (d >= 8 && d <= 30) return "em30";
  return null;
}

type Titulo = {
  contaId: string;
  vencimento: string;
  valor: number;
  aberto: boolean;
};

export function agingPorConta(
  titulos: Titulo[],
  contas: { id: string; nome: string }[]
): AgingPorConta[] {
  const map = new Map<string, AgingFaixa[]>();
  for (const c of contas) map.set(c.id, emptyFaixas());

  for (const t of titulos) {
    if (!t.aberto) continue;
    const faixas = map.get(t.contaId) ?? emptyFaixas();
    if (!map.has(t.contaId)) map.set(t.contaId, faixas);
    const fid = faixaForDays(daysFromToday(t.vencimento));
    if (!fid) continue;
    const f = faixas.find((x) => x.id === fid)!;
    f.qtd += 1;
    f.valor = Math.round((f.valor + t.valor) * 100) / 100;
  }

  return [...map.entries()].map(([contaId, faixas]) => ({
    contaId,
    contaNome: contas.find((c) => c.id === contaId)?.nome ?? contaId,
    faixas,
  }));
}
