import type { Lead } from "@/lib/domain/fluxo-types";

/** Pesos configuráveis (C10) — defaults; sobrescrevíveis por empresa. */
export type LeadScoreWeights = {
  visitou: number;
  entrada: number;
  parcela: number;
  prazo: number;
  origem: number;
  finalidade: number;
};

export const DEFAULT_LEAD_WEIGHTS: LeadScoreWeights = {
  visitou: 20,
  entrada: 20,
  parcela: 15,
  prazo: 15,
  origem: 15,
  finalidade: 15,
};

export type LeadClassificacao = "frio" | "morno" | "quente";

export function classifyScore(score: number): LeadClassificacao {
  if (score >= 70) return "quente";
  if (score >= 40) return "morno";
  return "frio";
}

export function computeLeadScore(
  lead: Partial<Lead>,
  weights: LeadScoreWeights = DEFAULT_LEAD_WEIGHTS
): { score: number; classificacao: LeadClassificacao } {
  let score = 0;
  if (lead.visitou) score += weights.visitou;
  if ((lead.entradaDisponivel ?? 0) > 0) score += weights.entrada;
  if ((lead.parcelaCabe ?? 0) > 0) score += weights.parcela;
  if (lead.prazoDecidir) score += weights.prazo;
  if (lead.origem && lead.origem !== "manual") score += weights.origem;
  if (lead.finalidade) score += weights.finalidade;
  score = Math.max(0, Math.min(100, score));
  return { score, classificacao: classifyScore(score) };
}
