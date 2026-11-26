/** E04 — linha do tempo em 4 passos da solicitação. */

import type { ScStatus } from "@/lib/domain/compras-types";

export type ScPasso = {
  id: string;
  label: string;
  done: boolean;
  current: boolean;
};

const PASSOS = [
  { id: "solicitada", label: "Solicitada", statuses: ["rascunho", "em_aprovacao"] as ScStatus[] },
  { id: "aprovada", label: "Aprovada", statuses: ["a_atender"] as ScStatus[] },
  { id: "em_compra", label: "Em compra", statuses: ["em_andamento"] as ScStatus[] },
  { id: "recebida", label: "Recebida", statuses: ["concluida"] as ScStatus[] },
];

export function scTimeline(status: ScStatus): ScPasso[] {
  if (status === "recusada") {
    return PASSOS.map((p, i) => ({
      id: p.id,
      label: i === 0 ? "Solicitada" : p.label,
      done: i === 0,
      current: i === 0,
    }));
  }
  const order: ScStatus[] = [
    "rascunho",
    "em_aprovacao",
    "a_atender",
    "em_andamento",
    "concluida",
  ];
  const idx = order.indexOf(status);
  return PASSOS.map((p, i) => {
    const stepIdx =
      p.id === "solicitada"
        ? 0
        : p.id === "aprovada"
          ? 2
          : p.id === "em_compra"
            ? 3
            : 4;
    const done = idx > stepIdx || (p.id === "recebida" && status === "concluida");
    const current =
      (p.id === "solicitada" && (status === "rascunho" || status === "em_aprovacao")) ||
      (p.id === "aprovada" && status === "a_atender") ||
      (p.id === "em_compra" && status === "em_andamento") ||
      (p.id === "recebida" && status === "concluida");
    return { id: p.id, label: p.label, done: done && !current, current };
  });
}
