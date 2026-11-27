import {
  buildContratoDocHtml,
  buildContratoDocText,
} from "./contrato-docs";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const c = {
  numero: "1001",
  compradorNome: "Ana Souza",
  empNome: "Horizonte",
  quadra: "A",
  lote: "01",
  preco: 185000,
  dataContrato: "2025-12-20",
  saldo: 120000,
  parcelas: [
    { n: 1, vencimento: "2026-01-15", valor: 1500 },
    { n: 2, vencimento: "2026-02-15", valor: 1500 },
  ],
};

async function main() {
  assert(buildContratoDocText("contrato", c).includes("Ana Souza"), "ctr");
  assert(buildContratoDocText("promissoria", c).includes("NP 001"), "np");
  assert(buildContratoDocText("mala_direta", c).includes("Saldo atualizado"), "md");
  const html = await buildContratoDocHtml("contrato", c);
  assert(html.includes("Contrato de compra"), "html");
  assert(html.includes("Meu Lote Fácil Ltda"), "empresa no cabeçalho");
  console.log("ok: contrato-docs");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
