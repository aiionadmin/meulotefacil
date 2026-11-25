import { REGULARIZACAO_FORWARD_ORDER } from "./kanban-forward";
import type { RegularizationCase } from "./fluxo-types";

export const REGULARIZACAO_ETAPA_LABEL: Record<
  (typeof REGULARIZACAO_FORWARD_ORDER)[number],
  string
> = {
  documentos: "Documentos",
  prefeitura: "Prefeitura",
  cartorio: "Cartório",
  registro: "Registro",
  matricula: "Matrícula",
  entregue: "Escritura entregue",
};

export type TimelineStep = {
  etapa: (typeof REGULARIZACAO_FORWARD_ORDER)[number];
  label: string;
  status: "concluida" | "atual" | "proxima";
};

export type PortalRegularizacaoView = {
  caso: RegularizationCase;
  etapas: TimelineStep[];
  docsPendentes: string[];
  exigencias: string[];
  previsaoEscritura?: string;
};

/** Monta a linha do tempo a partir da etapa atual do caso. */
export function timelineRegularizacao(
  caso: RegularizationCase
): PortalRegularizacaoView {
  const idx = REGULARIZACAO_FORWARD_ORDER.indexOf(caso.etapa);
  const etapas: TimelineStep[] = REGULARIZACAO_FORWARD_ORDER.map((etapa, i) => ({
    etapa,
    label: REGULARIZACAO_ETAPA_LABEL[etapa],
    status:
      i < idx ? "concluida" : i === idx ? "atual" : ("proxima" as const),
  }));
  return {
    caso,
    etapas,
    docsPendentes: caso.docsPendentes ?? [],
    exigencias: caso.exigencias ?? [],
    previsaoEscritura: caso.previsaoEscritura ?? caso.prazo,
  };
}

/** Filtra processos do portal pelo nome/CPF do cliente logado. */
export function regularizacoesDoCliente(
  casos: RegularizationCase[],
  clienteNome: string,
  clienteCpf?: string
): PortalRegularizacaoView[] {
  const nome = clienteNome.trim().toLowerCase();
  const first = nome.split(/\s+/)[0] ?? "";
  const cpf = (clienteCpf ?? "").replace(/\D/g, "");
  return casos
    .filter((c) => {
      const cn = c.cliente.toLowerCase();
      if (first && cn.includes(first)) return true;
      if (cpf && c.clienteCpf && c.clienteCpf.replace(/\D/g, "") === cpf)
        return true;
      return false;
    })
    .map(timelineRegularizacao);
}
