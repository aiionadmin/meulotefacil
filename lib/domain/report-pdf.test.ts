/** npx tsx lib/domain/report-pdf.test.ts */
import {
  buildMapaCotacaoHtml,
  buildPagamentosHtml,
  buildRecebimentosHtml,
} from "./report-pdf";
import { seedFinanceiro } from "./financeiro-seed";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const mapa = buildMapaCotacaoHtml({
  numero: "COT-100",
  descricao: "Teste",
  centro: "Obra X",
  fornecedores: [
    { id: "f1", nome: "Sul" },
    { id: "f2", nome: "Camp" },
  ],
  itens: [
    {
      id: "i1",
      descricao: "Cimento",
      unidade: "sc",
      quantidade: 10,
      valorOrcamento: 40,
    },
  ],
  precos: [
    { itemId: "i1", supplierId: "f1", precoUnitario: 37, vencedor: true },
    { itemId: "i1", supplierId: "f2", precoUnitario: 39, vencedor: false },
  ],
});
assert(mapa.includes("Mapa de cotação COT-100"), "título mapa");
assert(mapa.includes("winner") || mapa.includes("★"), "vencedor");
assert(mapa.includes("Meu Lote Fácil"), "marca");

const pags = buildPagamentosHtml(
  [
    {
      vencimento: "2026-11-28",
      favorecido: "Sul",
      descricao: "Cimento",
      valor: 7400,
      status: "em_aberto",
      centro: "Horizonte",
    },
  ],
  "nov/2026"
);
assert(pags.includes("Relatório de pagamentos"), "pagamentos");
assert(pags.includes("7400.00"), "valor");

const recs = buildRecebimentosHtml(
  [
    {
      vencimento: "2026-12-10",
      cliente: "Demo",
      descricao: "Medição",
      valor: 100,
      status: "em_aberto",
      origem: "faturamento",
    },
  ],
  "lista"
);
assert(recs.includes("Relatório de recebimentos"), "recebimentos");

const seed = seedFinanceiro();
assert(seed.meusCnpjs.length >= 1, "CNPJ seed");
assert(seed.meusCnpjs[0].emissaoNfse === false, "NFSe off por padrão");
assert(seed.meusCnpjs[0].capturaSefaz === false, "Sefaz off por padrão");

console.log("OK report-pdf");
