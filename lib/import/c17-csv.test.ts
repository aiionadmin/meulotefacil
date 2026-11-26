import { modeloC17Csv, parseC17Csv } from "./c17-csv";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const modelo = modeloC17Csv("clientes");
const preview = parseC17Csv("clientes", modelo);
assert(preview.ok, "modelo clientes ok");
assert(preview.criar === 1, "criar 1");
assert(preview.rows[0].payload.nome === "Ana Souza", "nome");

const bad = parseC17Csv(
  "clientes",
  "nome;cpf_cnpj;telefone;email;cidade\n;;1199;;\n"
);
assert(!bad.ok, "bad fails");
assert(bad.erros >= 1, "tem erros");

const upd = parseC17Csv("clientes", modelo, new Set(["12345678901"]));
assert(upd.atualizar === 1, "atualizar por cpf");
assert(upd.criar === 0, "sem criar");

const forn = parseC17Csv("fornecedores", modeloC17Csv("fornecedores"));
assert(forn.ok, "fornecedores");

const ins = parseC17Csv("insumos", modeloC17Csv("insumos"));
assert(ins.ok, "insumos");

console.log("ok: c17-csv");
