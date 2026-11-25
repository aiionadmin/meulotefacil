/** Parte 5 — dashboards, portais, demandas. */

import type {
  ComissaoCorretor,
  ReservaLote,
} from "./corretor-comissao-reserva";

export type {
  ComissaoCorretor,
  ReservaLote,
} from "./corretor-comissao-reserva";

export type DemandaStatus =
  | "aberta"
  | "em_analise"
  | "agendada"
  | "em_execucao"
  | "concluida"
  | "cancelada";

export type DemandaOrigem = "interno" | "portal_cliente" | "corretor";

export type DemandaPrioridade = "baixa" | "normal" | "alta" | "urgente";

export type DemandaTipo = {
  id: string;
  nome: string;
  prazoDias: number;
  responsavelPadrao: string;
  checklist: string[];
  ativo: boolean;
};

export type Demanda = {
  id: string;
  numero: string;
  tipoId: string;
  empresa: string;
  empreendimentoId: string;
  empreendimentoNome: string;
  quadra?: string;
  lote?: string;
  clienteId?: string;
  clienteNome?: string;
  descricao: string;
  prioridade: DemandaPrioridade;
  responsavel: string;
  prazo: string;
  origem: DemandaOrigem;
  custoPrevisto?: number;
  status: DemandaStatus;
  criadoEm: string;
  corretorId?: string;
  purchaseRequestId?: string;
  faturamentoId?: string;
};

export type PortalCorretorSession = {
  corretorId: string;
  nome: string;
};

export type PortalClienteSession = {
  clienteId: string;
  nome: string;
  cpf: string;
};

export type MaterialVenda = {
  id: string;
  titulo: string;
  tipo: "tabela" | "folheto" | "planta";
  empreendimentoNome: string;
  url: string;
};

export type Parte5State = {
  demandaTipos: DemandaTipo[];
  demandas: Demanda[];
  portalCorretor: PortalCorretorSession;
  portalCliente: PortalClienteSession;
  materiaisVenda: MaterialVenda[];
  comissoes: ComissaoCorretor[];
  reservas: ReservaLote[];
};
