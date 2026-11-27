/** E04 — linha do tempo em 4 passos da solicitação. */

import type { ScStatus, Solicitacao } from "@/lib/domain/compras-types";

export type ScPasso = {
  id: string;
  label: string;
  done: boolean;
  current: boolean;
  quando?: string;
  autor?: string;
};

const PASSOS = [
  {
    id: "criada",
    label: "Criada",
    statuses: ["rascunho", "em_aprovacao"] as ScStatus[],
  },
  {
    id: "aprovada",
    label: "Aprovada",
    statuses: ["a_atender"] as ScStatus[],
  },
  {
    id: "atendida",
    label: "Atendida",
    statuses: ["em_andamento"] as ScStatus[],
  },
  {
    id: "recebida",
    label: "Itens recebidos",
    statuses: ["concluida"] as ScStatus[],
  },
];

export type ScTimelineMeta = {
  criadoEm?: string;
  solicitante?: string;
  aprovadoEm?: string;
  aprovadoPor?: string;
  atendidoEm?: string;
  atendidoPor?: string;
  recebidoEm?: string;
  recebidoPor?: string;
};

export function scTimeline(
  status: ScStatus,
  meta?: ScTimelineMeta
): ScPasso[] {
  if (status === "recusada") {
    return PASSOS.map((p, i) => ({
      id: p.id,
      label: p.label,
      done: i === 0,
      current: i === 0,
      quando: i === 0 ? meta?.criadoEm : undefined,
      autor: i === 0 ? meta?.solicitante : undefined,
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
  return PASSOS.map((p) => {
    const stepIdx =
      p.id === "criada"
        ? 0
        : p.id === "aprovada"
          ? 2
          : p.id === "atendida"
            ? 3
            : 4;
    const done = idx > stepIdx || (p.id === "recebida" && status === "concluida");
    const current =
      (p.id === "criada" &&
        (status === "rascunho" || status === "em_aprovacao")) ||
      (p.id === "aprovada" && status === "a_atender") ||
      (p.id === "atendida" && status === "em_andamento") ||
      (p.id === "recebida" && status === "concluida");
    const stamp =
      p.id === "criada"
        ? { quando: meta?.criadoEm, autor: meta?.solicitante }
        : p.id === "aprovada"
          ? { quando: meta?.aprovadoEm, autor: meta?.aprovadoPor }
          : p.id === "atendida"
            ? { quando: meta?.atendidoEm, autor: meta?.atendidoPor }
            : { quando: meta?.recebidoEm, autor: meta?.recebidoPor };
    return {
      id: p.id,
      label: p.label,
      done: done && !current,
      current,
      quando: stamp.quando,
      autor: stamp.autor,
    };
  });
}

export function scTimelineFromSolicitacao(sc: Solicitacao): ScPasso[] {
  return scTimeline(sc.status, {
    criadoEm: sc.criadoEm,
    solicitante: sc.solicitante,
    aprovadoEm: sc.aprovadoEm,
    aprovadoPor: sc.aprovadoPor,
    atendidoEm: sc.atendidoEm,
    atendidoPor: sc.atendidoPor,
    recebidoEm: sc.recebidoEm,
    recebidoPor: sc.recebidoPor,
  });
}
