import type { IndexQuote } from "@/lib/domain/carteira-types";

/** Normaliza competência YYYY-MM. */
export function normalizeCompetencia(raw: string): string {
  const t = raw.trim();
  const m = t.match(/^(\d{4})[-/]?(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}`;
  return t;
}

/**
 * Cotação de mercado para o índice na competência (ou a mais recente ≤ competência).
 * Sem match → null (não inventa fator).
 */
export function findIndexQuote(
  quotes: IndexQuote[],
  indice: string,
  competencia?: string
): IndexQuote | null {
  const code = indice.trim().toUpperCase();
  const same = quotes.filter((q) => q.indice.trim().toUpperCase() === code);
  if (!same.length) return null;
  const sorted = [...same].sort((a, b) =>
    normalizeCompetencia(b.competencia).localeCompare(
      normalizeCompetencia(a.competencia)
    )
  );
  if (!competencia) return sorted[0] ?? null;
  const target = normalizeCompetencia(competencia);
  return (
    sorted.find((q) => normalizeCompetencia(q.competencia) === target) ??
    sorted.find((q) => normalizeCompetencia(q.competencia) <= target) ??
    null
  );
}

/** Competência YYYY-MM a partir de mês-base (1–12) e ano. */
export function competenciaFromMesBase(
  mesBase: number,
  ano = new Date().getFullYear()
): string {
  const m = Math.min(12, Math.max(1, Math.round(mesBase) || 1));
  return `${ano}-${String(m).padStart(2, "0")}`;
}
