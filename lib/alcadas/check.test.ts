import { canApprove, findApprovalRule } from "./check";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const rules = [
  {
    tipo: "Ordem de compra",
    perfilNome: "Financeiro",
    valorMinimo: 5000,
    ativo: true,
  },
  {
    tipo: "RDO",
    perfilNome: "Engenharia",
    ativo: true,
  },
  {
    tipo: "Desconciliar",
    perfilNome: "Financeiro",
    ativo: false,
  },
];

assert(findApprovalRule(rules, "rdo")?.perfilNome === "Engenharia", "find");
assert(
  canApprove({
    rules,
    tipo: "Ordem de compra",
    valor: 1000,
    perfilNome: "Compras",
  }).ok,
  "baixo valor ok"
);
assert(
  !canApprove({
    rules,
    tipo: "Ordem de compra",
    valor: 9000,
    perfilNome: "Compras",
  }).ok,
  "alto valor bloqueia"
);
assert(
  canApprove({
    rules,
    tipo: "Ordem de compra",
    valor: 9000,
    perfilNome: "Financeiro",
  }).ok,
  "financeiro ok"
);
assert(
  canApprove({
    rules,
    tipo: "Ordem de compra",
    valor: 9000,
    perfilNome: "Administrador",
  }).ok,
  "admin ok"
);
assert(
  canApprove({ rules, tipo: "Desconciliar", perfilNome: "Compras" }).ok,
  "inativa libera"
);

console.log("ok: alcadas-check");
