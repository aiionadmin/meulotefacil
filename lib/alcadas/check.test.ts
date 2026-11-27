import {
  canApprove,
  findApprovalRule,
  matchingApprovalRules,
} from "./check";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const rules = [
  {
    tipo: "Ordem de compra",
    perfilNome: "Financeiro",
    valorMinimo: 5000,
    valorMaximo: 50000,
    centroTipo: "obra" as const,
    ativo: true,
  },
  {
    tipo: "Ordem de compra",
    perfilNome: "Direção",
    valorMinimo: 50000.01,
    centroTipo: "obra" as const,
    ativo: true,
  },
  {
    tipo: "Ordem de compra",
    perfilNome: "Administrador",
    valorMinimo: 1000,
    centroTipo: "empresa" as const,
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
    centroTipo: "obra",
  }).ok,
  "baixo valor obra ok"
);
assert(
  !canApprove({
    rules,
    tipo: "Ordem de compra",
    valor: 9000,
    perfilNome: "Compras",
    centroTipo: "obra",
  }).ok,
  "faixa média bloqueia compras"
);
assert(
  canApprove({
    rules,
    tipo: "Ordem de compra",
    valor: 9000,
    perfilNome: "Financeiro",
    centroTipo: "obra",
  }).ok,
  "financeiro ok na faixa"
);
assert(
  canApprove({
    rules,
    tipo: "Ordem de compra",
    valor: 9000,
    perfilNome: "Administrador",
    centroTipo: "obra",
  }).ok,
  "admin ok"
);
assert(
  !canApprove({
    rules,
    tipo: "Ordem de compra",
    valor: 2000,
    perfilNome: "Compras",
    centroTipo: "empresa",
  }).ok,
  "empresa exige administrador na faixa"
);
assert(
  matchingApprovalRules(rules, "Ordem de compra", {
    valor: 60000,
    centroTipo: "obra",
  })[0]?.perfilNome === "Direção",
  "faixa alta → direção"
);
assert(
  canApprove({ rules, tipo: "Desconciliar", perfilNome: "Compras" }).ok,
  "inativa libera"
);

console.log("ok: alcadas-check");
