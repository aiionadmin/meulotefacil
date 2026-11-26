/** G14 — parse OFX texto/binário (SGML/XML, BOM, UTF-16, QFX). */

export type OfxTxn = {
  fitId: string;
  data: string;
  valor: number;
  memo: string;
  tipo: "credito" | "debito";
};

export type OfxParseResult = {
  ok: boolean;
  banco?: string;
  conta?: string;
  transacoes: OfxTxn[];
  erro?: string;
  encoding?: string;
};

function tag(block: string, name: string): string {
  const re = new RegExp(`<${name}>([^<\r\n]+)`, "i");
  const m = block.match(re);
  return m ? m[1].trim() : "";
}

function parseDate(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length !== 8) return raw;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

/** Decodifica ArrayBuffer com BOM UTF-8/UTF-16 ou heurística. */
export function decodeOfxBytes(buf: ArrayBuffer): {
  text: string;
  encoding: string;
} {
  const bytes = new Uint8Array(buf);
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return {
      text: new TextDecoder("utf-8").decode(bytes.subarray(3)),
      encoding: "utf-8-bom",
    };
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return {
      text: new TextDecoder("utf-16le").decode(bytes.subarray(2)),
      encoding: "utf-16le",
    };
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return {
      text: new TextDecoder("utf-16be").decode(bytes.subarray(2)),
      encoding: "utf-16be",
    };
  }
  // Heurística UTF-16 LE sem BOM (nulls em posições ímpares)
  let nullOdd = 0;
  const sample = Math.min(bytes.length, 200);
  for (let i = 1; i < sample; i += 2) {
    if (bytes[i] === 0) nullOdd += 1;
  }
  if (sample > 20 && nullOdd / (sample / 2) > 0.4) {
    return {
      text: new TextDecoder("utf-16le").decode(bytes),
      encoding: "utf-16le-heuristic",
    };
  }
  return {
    text: new TextDecoder("utf-8").decode(bytes),
    encoding: "utf-8",
  };
}

export function parseOfxText(content: string): OfxParseResult {
  if (!content || !/<OFX|<STMTTRN|<BANKTRANLIST/i.test(content)) {
    return {
      ok: false,
      transacoes: [],
      erro: "Arquivo OFX inválido ou vazio",
    };
  }
  const banco = tag(content, "BANKID") || tag(content, "ORG");
  const conta = tag(content, "ACCTID");
  const chunks = content.split(/<STMTTRN>/i).slice(1);
  const transacoes: OfxTxn[] = [];
  for (const chunk of chunks) {
    const fitId = tag(chunk, "FITID") || `ofx-${transacoes.length + 1}`;
    const rawVal = tag(chunk, "TRNAMT").replace(",", ".");
    const valor = Number(rawVal);
    if (!Number.isFinite(valor)) continue;
    const data = parseDate(tag(chunk, "DTPOSTED"));
    const memo =
      tag(chunk, "MEMO") || tag(chunk, "NAME") || tag(chunk, "CHECKNUM") || "—";
    transacoes.push({
      fitId,
      data,
      valor: Math.abs(valor),
      memo,
      tipo: valor < 0 ? "debito" : "credito",
    });
  }
  return { ok: true, banco, conta, transacoes };
}

/** Entrada preferida para upload de arquivo (G14 binário). */
export function parseOfxBytes(buf: ArrayBuffer): OfxParseResult {
  const { text, encoding } = decodeOfxBytes(buf);
  const parsed = parseOfxText(text);
  return { ...parsed, encoding };
}
