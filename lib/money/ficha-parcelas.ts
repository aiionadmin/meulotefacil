/**
 * Paginação + encargos só das parcelas visíveis (Parte 1 §2.7).
 * Evita recalcular milhares de linhas a cada render.
 */
import { calcAtraso } from "./atraso";

export type ParcelaBase = {
  id: string;
  valor: number;
  vencimento: string;
  status: string;
  juros: number;
  multa: number;
};

export type ContratoTaxas = {
  taxaMoraMes: number;
  taxaMulta: number;
  diasTolerancia: number;
};

export type PageParams = {
  page: number;
  pageSize: number;
};

export function paginateIds<T>(
  items: T[],
  { page, pageSize }: PageParams
): { items: T[]; total: number; page: number; pageSize: number; pageCount: number } {
  const total = items.length;
  const safeSize = Math.max(1, Math.min(100, pageSize || 25));
  const pageCount = Math.max(1, Math.ceil(total / safeSize));
  const safePage = Math.min(Math.max(1, page || 1), pageCount);
  const start = (safePage - 1) * safeSize;
  return {
    items: items.slice(start, start + safeSize),
    total,
    page: safePage,
    pageSize: safeSize,
    pageCount,
  };
}

/** Calcula juros/multa apenas para a página exibida. */
export function encargosParaPagina<T extends ParcelaBase>(
  pageItems: T[],
  taxasPorContrato: (item: T) => ContratoTaxas | null,
  consulta: string
): T[] {
  return pageItems.map((p) => {
    if (p.status === "paga" || p.status === "cancelada") return p;
    const taxas = taxasPorContrato(p);
    if (!taxas) return p;
    const r = calcAtraso({
      valor: p.valor,
      vencimento: p.vencimento,
      consulta,
      taxaMoraMes: taxas.taxaMoraMes,
      taxaMulta: taxas.taxaMulta,
      diasTolerancia: taxas.diasTolerancia,
    });
    return {
      ...p,
      juros: r.juros,
      multa: r.multa,
      status: r.emAtraso ? "vencida" : p.status === "vencida" ? "em_aberto" : p.status,
    };
  });
}

/** Gera N parcelas sintéticas para teste de volume. */
export function gerarParcelasVolume(
  qtd: number,
  base: Omit<ParcelaBase, "id" | "n" | "vencimento"> & { n?: number }
): (ParcelaBase & { n: number })[] {
  const out: (ParcelaBase & { n: number })[] = [];
  const start = new Date("2025-01-10T12:00:00Z");
  for (let i = 1; i <= qtd; i++) {
    const d = new Date(start);
    d.setUTCMonth(d.getUTCMonth() + (i - 1));
    out.push({
      id: `vol-${i}`,
      n: i,
      valor: base.valor,
      vencimento: d.toISOString().slice(0, 10),
      status: i <= 3 ? "paga" : "em_aberto",
      juros: 0,
      multa: 0,
    });
  }
  return out;
}
