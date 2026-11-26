import { buildCnab400Remessa } from "./remessa";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const txt = buildCnab400Remessa(
  [
    {
      nossoNumero: "12345678",
      vencimento: "2026-12-10",
      valor: 1500.5,
      contratoNumero: "1001",
      sacadoNome: "Ana Souza",
    },
  ],
  { empresa: "MEU LOTE FACIL" }
);

const lines = txt.split(/\r?\n/);
assert(lines.length === 3, `esperado 3 linhas, veio ${lines.length}`);
assert(lines[0].startsWith("01REMESSA") || lines[0][0] === "0", "header");
assert(lines[0].length === 400, `header len ${lines[0].length}`);
assert(lines[1][0] === "1", "detalhe tipo 1");
assert(lines[1].length === 400, `detalhe len ${lines[1].length}`);
assert(lines[2][0] === "9", "trailer");
assert(txt.includes("ANA SOUZA"), "sacado no detalhe");
assert(txt.includes("341"), "banco Itaú");

console.log("ok: remessa CNAB 400");
