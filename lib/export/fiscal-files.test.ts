import {
  buildContabilidadeCsv,
  buildDimobText,
  buildSpedContribuicoes,
} from "./fiscal-files";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const contracts = [
  {
    numero: "1001",
    compradorNome: "Ana Souza",
    empNome: "Horizonte",
    preco: 185000,
    dataContrato: "2025-12-20",
  },
];

const dimob = buildDimobText({
  ano: 2026,
  empresa: "MEU LOTE FACIL",
  empreendimentos: 2,
  metaEmpreendimentos: 41,
  contracts,
  metaContratos: 3690,
});
assert(dimob.includes("DIMOB|ANO=2026"), "header");
assert(dimob.includes("R01|1001|Ana Souza"), "linha R01");
assert(dimob.includes("185000.00"), "preco");

const sped = buildSpedContribuicoes({
  empresa: "MEU LOTE FACIL",
  empreendimentos: 2,
  contracts,
});
assert(sped.startsWith("|0000|SPED|"), "sped header");
assert(sped.includes("|C100|1001|2025-12-20|185000.00|"), "c100");
assert(sped.trimEnd().endsWith("|9999|"), "trailer");

const csv = buildContabilidadeCsv([
  {
    pagoEm: "2026-01-10",
    contratoNumero: "1001",
    n: 1,
    valor: 1500,
    status: "paga",
  },
  {
    pagoEm: null,
    contratoNumero: "1001",
    n: 2,
    valor: 1500,
    status: "em_aberto",
  },
]);
assert(csv.includes("data;conta;historico"), "csv header");
assert(csv.includes("Recibo 1001 parc.1"), "paga");
assert(!csv.includes("parc.2"), "ignora aberta");

console.log("ok: fiscal-files");
