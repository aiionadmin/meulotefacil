import { buildFisicoFinanceiro } from "./fisico-financeiro";
import type {
  CronogramaItem,
  CurvaSPonto,
  OrcamentoNode,
} from "@/lib/domain/obras-types";

const nodes: OrcamentoNode[] = [
  {
    id: "n1",
    obraId: "o1",
    kind: "item",
    codigo: "1.1",
    descricao: "Terraplanagem",
    unidade: "m3",
    quantidade: 100,
    custoUnit: 50,
    orcado: 5000,
    realizado: 2000,
    fisicoPct: 40,
    bdiPct: 20,
    ordem: 1,
  },
];

const cronograma: CronogramaItem[] = [
  {
    id: "c1",
    obraId: "o1",
    nodeId: "n1",
    label: "Terraplanagem",
    duracaoDias: 60,
    inicio: "2026-01-15",
    fim: "2026-02-28",
  },
];

const curva: CurvaSPonto[] = [
  {
    periodo: "2026-01",
    planejadoFisico: 20,
    realizadoFisico: 15,
    planejadoFinanceiro: 2500,
    realizadoFinanceiro: 1000,
  },
  {
    periodo: "2026-02",
    planejadoFisico: 40,
    realizadoFisico: 40,
    planejadoFinanceiro: 5000,
    realizadoFinanceiro: 2000,
  },
];

const rows = buildFisicoFinanceiro({ cronograma, curvaS: curva, nodes });
if (rows.length < 2) throw new Error(`esperava ≥2 períodos, veio ${rows.length}`);
if (rows[0].periodo !== "2026-01") throw new Error(rows[0].periodo);
if (rows[0].atividades < 1) throw new Error("atividades jan");
if (rows[1].fisicoRealPct !== 40) throw new Error(String(rows[1].fisicoRealPct));
console.log("fisico-financeiro.test ok", rows.length, "períodos");
