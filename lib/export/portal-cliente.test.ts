import { buildInformeAnualHtml, buildSegundaViaPix } from "./portal-cliente";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const via = buildSegundaViaPix({
  cliente: "Ana Souza",
  contrato: "1001",
  valor: 1500.5,
  vencimento: "2026-03-15",
});
assert(via.includes("Ana Souza"), "cliente");
assert(via.includes("Pix"), "pix");
assert(via.includes("1500,50") || via.includes("1500.50"), "valor");

const html = buildInformeAnualHtml({
  ano: 2026,
  cliente: "Ana Souza",
  cpf: "123.456.789-00",
  contratos: [
    {
      numero: "1001",
      empreendimento: "Horizonte",
      preco: 185000,
      saldo: 120000,
    },
  ],
  parcelasPagas: [
    {
      vencimento: "2026-01-10",
      valor: 1500,
      status: "recebido",
      contratoRef: "1001",
    },
  ],
});
assert(html.includes("Informe anual 2026"), "titulo");
assert(html.includes("Ana Souza"), "nome");
assert(html.includes("1001"), "contrato");

console.log("ok: portal-cliente");
