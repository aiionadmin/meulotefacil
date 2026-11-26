import { computeGanttCritico } from "./gantt-critico";
import type { CronogramaItem } from "@/lib/domain/obras-types";

const itens: CronogramaItem[] = [
  {
    id: "a",
    obraId: "o1",
    label: "A",
    duracaoDias: 5,
    inicio: "2026-01-01",
    fim: "2026-01-06",
  },
  {
    id: "b",
    obraId: "o1",
    label: "B",
    duracaoDias: 10,
    inicio: "2026-01-01",
    fim: "2026-01-11",
    predecessorId: "a",
  },
  {
    id: "c",
    obraId: "o1",
    label: "C",
    duracaoDias: 3,
    inicio: "2026-01-01",
    fim: "2026-01-04",
    predecessorId: "a",
  },
];

const out = computeGanttCritico(itens, 8);
if (out.length !== 3) throw new Error("len");
const b = out.find((x) => x.id === "b")!;
const c = out.find((x) => x.id === "c")!;
if (!b.caminhoCritico) throw new Error("B deve ser crítico");
if (c.folgaDias < 1) throw new Error("C deve ter folga");
console.log("gantt-critico.test ok", out.map((x) => `${x.id}:${x.folgaDias}`).join(","));
