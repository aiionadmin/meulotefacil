import { parseNfeXml } from "./nfe-xml";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const sample = `<?xml version="1.0"?>
<nfeProc>
  <NFe>
    <infNFe Id="NFe35260112345678000190550010000012341123456789">
      <ide><nNF>1234</nNF><serie>1</serie><dhEmi>2026-01-15T10:00:00-03:00</dhEmi></ide>
      <emit><xNome>Fornecedor Exemplo LTDA</xNome></emit>
      <total><ICMSTot><vNF>2500.50</vNF></ICMSTot></total>
    </infNFe>
  </NFe>
</nfeProc>`;

const p = parseNfeXml(sample);
assert(p.ok, "ok");
assert(p.tipo === "nfe", "tipo");
assert(p.numero === "1234", "numero");
assert(p.emissor?.includes("Fornecedor"), "emissor");
assert(Math.abs((p.valor ?? 0) - 2500.5) < 0.001, "valor");
assert(p.emissao === "2026-01-15", "data");

const bad = parseNfeXml("nao-xml");
assert(!bad.ok, "bad");

console.log("ok: nfe-xml");
