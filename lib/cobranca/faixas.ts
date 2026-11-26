/** Formatação de faixas de atraso (B09). */

const FAIXAS: Record<string, string> = {
  a_vencer_5: "A vencer em 5 dias",
  "1_30": "1 a 30 dias",
  "31_90": "31 a 90 dias",
  "91_180": "91 a 180 dias",
  "180_mais": "Mais de 180 dias",
  acordo: "Acordo",
};

export function faixaAtrasoLabel(codigo: string): string {
  if (FAIXAS[codigo]) return FAIXAS[codigo];
  // Fallback: "31 90" / "31_90" → "31 a 90 dias"
  const parts = codigo.replace(/_/g, " ").trim().split(/\s+/);
  if (parts.length === 2 && parts.every((p) => /^\d+$/.test(p))) {
    return `${parts[0]} a ${parts[1]} dias`;
  }
  if (/^a vencer/i.test(codigo.replace(/_/g, " "))) {
    const n = codigo.match(/\d+/);
    return n ? `A vencer em ${n[0]} dias` : "A vencer";
  }
  return codigo.replace(/_/g, " ");
}
