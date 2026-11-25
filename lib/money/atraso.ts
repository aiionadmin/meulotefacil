/**
 * Encargos de atraso — docs/especificacao.md §11.3.
 * Fórmulas observadas na tela LoteWin; validar contra contratos reais antes de produção.
 * Caso de referência: R$ 238,75 venc. 10/07/2026, consulta 24/11/2026 → juros 10,90 + multa 4,78.
 */

export type AtrasoInput = {
  valor: number;
  vencimento: string; // YYYY-MM-DD
  consulta: string; // YYYY-MM-DD
  taxaMoraMes: number; // ex.: 0.01 = 1% a.m.
  taxaMulta: number; // ex.: 0.02 = 2%
  diasTolerancia?: number;
};

export type AtrasoResult = {
  diasAtraso: number;
  emAtraso: boolean;
  juros: number;
  multa: number;
  total: number;
};

function parseDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calcAtraso(input: AtrasoInput): AtrasoResult {
  const tolerancia = input.diasTolerancia ?? 0;
  const venc = parseDate(input.vencimento);
  const cons = parseDate(input.consulta);
  const ms = cons.getTime() - venc.getTime();
  const diasCorridos = Math.max(0, Math.floor(ms / 86_400_000));
  const diasAtraso = Math.max(0, diasCorridos - tolerancia);
  const emAtraso = diasAtraso > 0;

  if (!emAtraso) {
    return {
      diasAtraso: 0,
      emAtraso: false,
      juros: 0,
      multa: 0,
      total: round2(input.valor),
    };
  }

  const juros = round2(
    input.valor * input.taxaMoraMes * (diasAtraso / 30)
  );
  const multa = round2(input.valor * input.taxaMulta);
  const total = round2(input.valor + juros + multa);

  return { diasAtraso, emAtraso, juros, multa, total };
}
