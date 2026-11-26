/** npx tsx lib/import/ofx-parse.test.ts */
import { parseOfxText } from "./ofx-parse";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const sample = `OFXHEADER:100
<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKACCTFROM>
<BANKID>341
<ACCTID>12345-6
</BANKACCTFROM>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20261115
<TRNAMT>1500.50
<FITID>A1
<MEMO>BOLETO 1001
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20261116
<TRNAMT>-89.90
<FITID>B2
<MEMO>TARIFA
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

const bad = parseOfxText("nao e ofx");
assert(bad.ok === false, "rejeita lixo");

const ok = parseOfxText(sample);
assert(ok.ok, "parse ok");
assert(ok.transacoes.length === 2, "2 txns");
assert(ok.transacoes[0].tipo === "credito", "credito");
assert(ok.transacoes[1].tipo === "debito", "debito");
assert(ok.transacoes[0].data === "2026-11-15", "data");
console.log("OK ofx-parse");
