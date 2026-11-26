import { buildRdoText } from "./rdo-report";
import type { Rdo } from "@/lib/domain/obras-types";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const sample: Rdo = {
  id: "r1",
  obraId: "o1",
  numero: 12,
  data: "2026-11-25",
  responsavel: "Eng. Paula",
  status: "aprovado",
  clima: {
    manha: { clima: "claro", condicao: "praticavel" },
    tarde: { clima: "nublado", condicao: "praticavel" },
    noite: { clima: "claro", condicao: "praticavel" },
  },
  efetivo: [
    { tipo: "propria", funcao: "Pedreiro", quantidade: 4, horas: 8 },
  ],
  equipamentos: [
    { nome: "Betoneira", quantidade: 1, situacao: "em_uso", horas: 6 },
  ],
  atividades: [
    {
      descricao: "Fundação",
      situacao: "em_andamento",
      quantidade: 1,
      fisicoAcumulado: 40,
    },
  ],
  materiais: [{ descricao: "Cimento", quantidade: 20 }],
  ocorrencias: [],
  efetivoTotal: 4,
};

const txt = buildRdoText(sample, "Obra Demo");
assert(txt.includes("RDO nº 12"), "titulo");
assert(txt.includes("Fundação"), "atividade");
assert(txt.includes("Pedreiro"), "efetivo");
console.log("ok: rdo-report");
