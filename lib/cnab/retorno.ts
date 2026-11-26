/**
 * Retorno CNAB 400 (Itau 341) simplificado — H23.
 * Lê arquivo .ret e extrai liquidações por nosso número.
 */

export type CnabRetornoOcorrencia =
  | "liquidacao"
  | "entrada_confirmada"
  | "baixa"
  | "rejeicao"
  | "outra";

export type CnabRetornoItem = {
  nossoNumero: string;
  ocorrencia: CnabRetornoOcorrencia;
  codigoOcorrencia: string;
  valorPago?: number;
  dataOcorrencia?: string;
  linha: number;
};

export type CnabRetornoPreview = {
  ok: boolean;
  itens: CnabRetornoItem[];
  liquidacoes: number;
  erros: string[];
};

function mapOcorrencia(code: string): CnabRetornoOcorrencia {
  const c = code.trim();
  if (c === "06" || c === "08" || c === "10") return "liquidacao";
  if (c === "02") return "entrada_confirmada";
  if (c === "09" || c === "10") return "baixa";
  if (c === "03" || c === "15" || c === "16") return "rejeicao";
  return "outra";
}

function parseMoneyCents(raw: string): number | undefined {
  const d = raw.replace(/\D/g, "");
  if (!d) return undefined;
  return Number(d) / 100;
}

/**
 * Parseia linhas de detalhe tipo 1 (400 colunas).
 * Nosso número: posições típicas 63–70 (1-based) → slice 62:70.
 * Ocorrência: 109–110 → slice 108:110.
 * Valor pago: 254–266 → slice 253:266.
 */
export function parseCnab400Retorno(text: string): CnabRetornoPreview {
  const lines = text
    .replace(/^\ufeff/, "")
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/, ""));
  const itens: CnabRetornoItem[] = [];
  const erros: string[] = [];

  lines.forEach((line, idx) => {
    if (!line) return;
    const n = idx + 1;
    if (line[0] === "0" || line.startsWith("02RETORNO") || line.startsWith("01REMESSA")) {
      return;
    }
    if (line[0] === "9") return;
    if (line[0] !== "1") {
      if (line.length >= 10) erros.push(`Linha ${n}: tipo não reconhecido`);
      return;
    }
    const padded = line.padEnd(400, " ");
    const nossoNumero = padded.slice(62, 70).replace(/\D/g, "").replace(/^0+/, "") ||
      padded.slice(62, 70).trim();
    const codigoOcorrencia = padded.slice(108, 110);
    const valorPago = parseMoneyCents(padded.slice(253, 266));
    const ddmmyy = padded.slice(110, 116).replace(/\D/g, "");
    let dataOcorrencia: string | undefined;
    if (ddmmyy.length === 6) {
      dataOcorrencia = `20${ddmmyy.slice(4, 6)}-${ddmmyy.slice(2, 4)}-${ddmmyy.slice(0, 2)}`;
    }
    if (!nossoNumero) {
      erros.push(`Linha ${n}: nosso número vazio`);
      return;
    }
    itens.push({
      nossoNumero,
      ocorrencia: mapOcorrencia(codigoOcorrencia),
      codigoOcorrencia,
      valorPago,
      dataOcorrencia,
      linha: n,
    });
  });

  const liquidacoes = itens.filter((i) => i.ocorrencia === "liquidacao" || i.ocorrencia === "baixa").length;
  return {
    ok: erros.length === 0 && itens.length > 0,
    itens,
    liquidacoes,
    erros,
  };
}

/** Gera um retorno sintético (posições alinhadas ao parser). */
export function buildCnab400RetornoDemo(
  titulos: { nossoNumero: string; valor: number }[],
  ocorrencia = "06"
): string {
  const hoje = new Date();
  const ddmmyy = `${String(hoje.getDate()).padStart(2, "0")}${String(hoje.getMonth() + 1).padStart(2, "0")}${String(hoje.getFullYear()).slice(2)}`;
  const header = ("02RETORNO01COBRANCA" + " ".repeat(380)).slice(0, 400);
  const details = titulos.map((t, i) => {
    const buf = Array.from({ length: 400 }, () => " ");
    buf[0] = "1";
    const nn = t.nossoNumero.replace(/\D/g, "").padStart(8, "0").slice(-8);
    for (let j = 0; j < 8; j++) buf[62 + j] = nn[j] ?? "0";
    buf[108] = ocorrencia[0] ?? "0";
    buf[109] = ocorrencia[1] ?? "6";
    for (let j = 0; j < 6; j++) buf[110 + j] = ddmmyy[j] ?? "0";
    const valor = String(Math.round(t.valor * 100)).padStart(13, "0");
    for (let j = 0; j < 13; j++) buf[253 + j] = valor[j] ?? "0";
    const seq = String(i + 2).padStart(6, "0");
    for (let j = 0; j < 6; j++) buf[394 + j] = seq[j] ?? "0";
    return buf.join("");
  });
  const trailer = ("9" + String(titulos.length + 2).padStart(6, "0")).padEnd(
    400,
    " "
  );
  return [header, ...details, trailer].join("\r\n");
}
