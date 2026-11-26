/** G14 — parse OFX texto (SGML/XML leve) para conciliação. */

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
