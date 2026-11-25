/** npx tsx lib/domain/lead-score.test.ts */
import { leadProntoParaProposta, scoreLead } from "./lead-score";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const frio = scoreLead({ telefone: "1" });
assert(frio.temperatura === "frio" && frio.score < 40, "frio");

const quente = scoreLead({
  empInteresse: "Hor",
  tipoInteresse: "comprar_lote",
  finalidade: "morar",
  faixaValorMin: 100000,
  faixaValorMax: 200000,
  entradaDisponivel: 20000,
  parcelaCabivel: 1500,
  visitou: true,
  prazoDecidir: "30d",
  telefone: "(19) 99999-0000",
  melhorHorario: "manhã",
  canalPreferido: "whatsapp",
});
assert(quente.temperatura === "quente" && quente.score >= 70, "quente");

assert(
  leadProntoParaProposta({
    empInteresse: "X",
    tipoInteresse: "ambos",
    telefone: "1",
  }),
  "pronto"
);
assert(
  !leadProntoParaProposta({ telefone: "1" }),
  "não pronto"
);

console.log("OK lead-score", { frio, quente });
