import { buildCnab400RetornoDemo, parseCnab400Retorno } from "./retorno";
import { buildCnab400Remessa } from "./remessa";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const rem = buildCnab400Remessa([
  {
    nossoNumero: "12345678",
    vencimento: "2026-03-15",
    valor: 1500.5,
    contratoNumero: "1001",
    sacadoNome: "Ana Souza",
  },
]);
assert(rem.split(/\r?\n/)[0].length === 400, "remessa header 400");

const demo = buildCnab400RetornoDemo([
  { nossoNumero: "12345678", valor: 1500.5 },
]);
const preview = parseCnab400Retorno(demo);
assert(preview.itens.length === 1, "1 item");
assert(preview.itens[0].nossoNumero === "12345678", "nn");
assert(preview.itens[0].ocorrencia === "liquidacao", "liq");
assert(preview.liquidacoes === 1, "count");
assert(Math.abs((preview.itens[0].valorPago ?? 0) - 1500.5) < 0.001, "valor");

const empty = parseCnab400Retorno("");
assert(!empty.ok, "vazio");

console.log("ok: cnab-retorno");
