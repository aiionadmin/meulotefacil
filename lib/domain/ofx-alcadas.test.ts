/** npx tsx lib/domain/ofx-alcadas.test.ts */
import { matchPagamento, parseOfx, sampleOfx } from "./ofx";
import { podeAprovarPorAlcada, podeConciliar } from "./alcadas";
import { criticalPathIds } from "./gantt-critical";
import type { ApprovalRule } from "./fase1-types";
import type { CronogramaItem } from "./obras-types";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const txns = parseOfx(sampleOfx());
assert(txns.length === 3, "3 STMTTRN no exemplo");
assert(txns[0].valor === -7400, "débito cimento");

const match = matchPagamento(txns[0], [
  {
    id: "pag-1",
    valor: 7400,
    valorPago: 0,
    favorecido: "Distribuidora Sul",
    descricao: "Cimento",
    conciliado: false,
    status: "em_aberto",
  },
]);
assert(match === "pag-1", "casa OFX com pagamento");

const rules: ApprovalRule[] = [
  {
    id: "1",
    tipo: "Ordem de compra",
    perfilNome: "Financeiro",
    valorMinimo: 5000,
    ativo: true,
  },
  {
    id: "2",
    tipo: "Ordem de compra",
    perfilNome: "Direção",
    valorMinimo: 50000,
    ativo: true,
  },
  {
    id: "3",
    tipo: "Conciliação bancária",
    perfilNome: "Financeiro",
    ativo: true,
  },
  {
    id: "4",
    tipo: "Desconciliação bancária",
    perfilNome: "Administrador",
    ativo: true,
  },
];

assert(
  podeAprovarPorAlcada(rules, "Ordem de compra", 1000, "Comercial").ok,
  "abaixo do mínimo livre"
);
assert(
  !podeAprovarPorAlcada(rules, "Ordem de compra", 8000, "Comercial").ok,
  "Comercial bloqueado em 8k"
);
assert(
  podeAprovarPorAlcada(rules, "Ordem de compra", 8000, "Financeiro").ok,
  "Financeiro ok em 8k"
);
assert(
  !podeAprovarPorAlcada(rules, "Ordem de compra", 60000, "Financeiro").ok,
  "Financeiro bloqueado em 60k"
);
assert(
  podeAprovarPorAlcada(rules, "Ordem de compra", 60000, "Direção").ok,
  "Direção ok em 60k"
);
assert(podeConciliar(rules, "Financeiro").ok, "Financeiro concilia");
assert(!podeConciliar(rules, "Comercial").ok, "Comercial não concilia");
assert(
  !podeConciliar(rules, "Financeiro", true).ok,
  "Financeiro não desconcilia"
);
assert(podeConciliar(rules, "Administrador", true).ok, "Admin desconcilia");

const crono: CronogramaItem[] = [
  {
    id: "a",
    obraId: "o",
    label: "A",
    duracaoDias: 5,
    inicio: "2026-01-01",
    fim: "2026-01-06",
  },
  {
    id: "b",
    obraId: "o",
    label: "B",
    duracaoDias: 10,
    inicio: "2026-01-06",
    fim: "2026-01-16",
    predecessorId: "a",
  },
  {
    id: "c",
    obraId: "o",
    label: "C",
    duracaoDias: 2,
    inicio: "2026-01-06",
    fim: "2026-01-08",
    predecessorId: "a",
  },
];
const crit = criticalPathIds(crono);
assert(crit.has("a") && crit.has("b") && !crit.has("c"), "caminho A→B");

console.log("OK ofx-alcadas", { txns: txns.length, crit: [...crit] });
