/** Pontuação automática de lead 0–100 (Parte 1 §2.4). */

export type LeadScoreInput = {
  empInteresse?: string;
  tipoInteresse?: string;
  finalidade?: string;
  faixaValorMin?: number;
  faixaValorMax?: number;
  entradaDisponivel?: number;
  parcelaCabivel?: number;
  visitou?: boolean;
  prazoDecidir?: string;
  telefone?: string;
  melhorHorario?: string;
  canalPreferido?: string;
};

export type LeadScoreWeights = {
  empreendimento: number;
  tipoInteresse: number;
  finalidade: number;
  faixaValor: number;
  entrada: number;
  parcela: number;
  visita: number;
  prazo: number;
  contato: number;
};

export const DEFAULT_LEAD_SCORE_WEIGHTS: LeadScoreWeights = {
  empreendimento: 15,
  tipoInteresse: 10,
  finalidade: 5,
  faixaValor: 15,
  entrada: 15,
  parcela: 10,
  visita: 15,
  prazo: 10,
  contato: 5,
};

export type LeadTemperatura = "frio" | "morno" | "quente";

export function scoreLead(
  lead: LeadScoreInput,
  weights: LeadScoreWeights = DEFAULT_LEAD_SCORE_WEIGHTS
): { score: number; temperatura: LeadTemperatura } {
  let score = 0;
  if (lead.empInteresse) score += weights.empreendimento;
  if (lead.tipoInteresse) score += weights.tipoInteresse;
  if (lead.finalidade) score += weights.finalidade;
  if (
    lead.faixaValorMin != null ||
    lead.faixaValorMax != null
  ) {
    score += weights.faixaValor;
  }
  if (lead.entradaDisponivel != null && lead.entradaDisponivel > 0) {
    score += weights.entrada;
  }
  if (lead.parcelaCabivel != null && lead.parcelaCabivel > 0) {
    score += weights.parcela;
  }
  if (lead.visitou) score += weights.visita;
  if (lead.prazoDecidir) score += weights.prazo;
  if (lead.telefone && (lead.melhorHorario || lead.canalPreferido)) {
    score += weights.contato;
  }
  score = Math.max(0, Math.min(100, Math.round(score)));
  const temperatura: LeadTemperatura =
    score >= 70 ? "quente" : score >= 40 ? "morno" : "frio";
  return { score, temperatura };
}

export const DEFAULT_CAMPOS_MINIMOS_PROPOSTA = [
  "empInteresse",
  "tipoInteresse",
  "telefone",
] as const;

export function leadProntoParaProposta(
  lead: LeadScoreInput & { telefone?: string },
  campos: readonly string[] = DEFAULT_CAMPOS_MINIMOS_PROPOSTA
): boolean {
  for (const c of campos) {
    const v = (lead as Record<string, unknown>)[c];
    if (v == null || v === "") return false;
  }
  return true;
}
