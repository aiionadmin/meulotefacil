import { parseLotesCsv, modeloLotesCsv } from "./lotes-csv";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const preview = parseLotesCsv(modeloLotesCsv());
assert(preview.ok, "modelo ok");
assert(preview.criaveis === 2, `criaveis ${preview.criaveis}`);
assert(preview.rows[0].quadra === "A", "quadra");
assert(preview.rows[0].situacao === "disponivel", "status");

const bad = parseLotesCsv(
  "quadra;lote;area;situacao\nA;01;abc;foo\nA;01;10;disponivel"
);
assert(!bad.ok, "rejeita erros");
assert(bad.comErro >= 1, "tem erro");

console.log("ok: lotes-csv");
