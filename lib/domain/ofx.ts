/** Parser OFX mínimo (STMTTRN) para conciliação demo. */

export type OfxTxn = {
  fitId: string;
  data: string;
  valor: number;
  memo: string;
  tipo: "DEBIT" | "CREDIT" | "OTHER";
};

export function parseOfx(text: string): OfxTxn[] {
  const blocks = text.split(/<STMTTRN>/i).slice(1);
  const out: OfxTxn[] = [];
  for (const block of blocks) {
    const tag = (name: string) => {
      const m = block.match(new RegExp(`<${name}>([^<\\r\\n]+)`, "i"));
      return m?.[1]?.trim() ?? "";
    };
    const rawDate = tag("DTPOSTED").slice(0, 8);
    const data =
      rawDate.length === 8
        ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
        : new Date().toISOString().slice(0, 10);
    const valor = Number(tag("TRNAMT").replace(",", ".")) || 0;
    const trnType = tag("TRNTYPE").toUpperCase();
    out.push({
      fitId: tag("FITID") || `fit-${out.length + 1}`,
      data,
      valor,
      memo: tag("MEMO") || tag("NAME") || "Movimento OFX",
      tipo:
        trnType.includes("CREDIT") || valor > 0
          ? "CREDIT"
          : trnType.includes("DEBIT") || valor < 0
            ? "DEBIT"
            : "OTHER",
    });
  }
  return out;
}

export function sampleOfx(): string {
  return `OFXHEADER:100
DATA:OFXSGML
VERSION:102
<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20261128
<TRNAMT>-7400.00
<FITID>OFX-001
<MEMO>PIX DISTRIBUIDORA SUL CIMENTO
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20261115
<TRNAMT>-5000.00
<FITID>OFX-002
<MEMO>BOLETO ENGENHARIA TERCEIROS
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20261120
<TRNAMT>1850.50
<FITID>OFX-003
<MEMO>BOLETO MARIA SOUZA CTR-1001
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
}

/** Casa débito OFX com pagamento pelo valor (tolerância 0,01) e memo. */
export function matchPagamento(
  txn: OfxTxn,
  pagamentos: {
    id: string;
    valor: number;
    valorPago: number;
    favorecido: string;
    descricao: string;
    conciliado: boolean;
    status: string;
  }[]
): string | null {
  if (txn.valor >= 0) return null;
  const abs = Math.abs(txn.valor);
  const memo = txn.memo.toLowerCase();
  const candidates = pagamentos.filter(
    (p) =>
      !p.conciliado &&
      (p.status === "pago" || p.status === "parcial" || p.status === "em_aberto" || p.status === "vencido") &&
      Math.abs(p.valor - abs) < 0.02
  );
  const byMemo = candidates.find(
    (p) =>
      memo.includes(p.favorecido.toLowerCase().slice(0, 8)) ||
      memo.includes(p.descricao.toLowerCase().slice(0, 8))
  );
  return (byMemo ?? candidates[0])?.id ?? null;
}
