import {
  curvaAbc,
  desempenhoCustos,
  orcamentoAnalitico,
  orcamentoSintetico,
} from "./relatorios-d17";
import type { OrcamentoNode } from "@/lib/domain/obras-types";

const nodes: OrcamentoNode[] = [
  {
    id: "e1",
    obraId: "o1",
    kind: "etapa",
    codigo: "1",
    descricao: "Infra",
    unidade: "",
    quantidade: 0,
    custoUnit: 0,
    orcado: 10000,
    realizado: 4000,
    fisicoPct: 40,
    bdiPct: 0,
    ordem: 1,
  },
  {
    id: "i1",
    obraId: "o1",
    parentId: "e1",
    kind: "item",
    codigo: "1.1",
    descricao: "Terrapleno",
    unidade: "m3",
    quantidade: 100,
    custoUnit: 80,
    orcado: 8000,
    realizado: 3000,
    fisicoPct: 40,
    bdiPct: 20,
    grupo: "material",
    ordem: 1,
  },
  {
    id: "i2",
    obraId: "o1",
    parentId: "e1",
    kind: "item",
    codigo: "1.2",
    descricao: "Drenagem",
    unidade: "m",
    quantidade: 50,
    custoUnit: 40,
    orcado: 2000,
    realizado: 1000,
    fisicoPct: 50,
    bdiPct: 20,
    grupo: "material",
    ordem: 2,
  },
];

const sint = orcamentoSintetico(nodes);
if (sint.length !== 1 || sint[0].codigo !== "1") throw new Error("sintetico");

const ana = orcamentoAnalitico(nodes);
if (ana.length !== 2) throw new Error("analitico");

const abc = curvaAbc(nodes);
if (abc[0].classe !== "A") throw new Error("abc A");
if (abc[0].codigo !== "1.1") throw new Error("abc ordem");

const des = desempenhoCustos(nodes);
if (des.itens !== 2) throw new Error("desempenho itens");
if (des.orcado !== 10000) throw new Error(String(des.orcado));

console.log("relatorios-d17.test ok");
