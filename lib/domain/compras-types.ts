/** Parte 3 — Solicitação → Cotação → Ordem de Compra. */

export type ScStatus =
  | "rascunho"
  | "em_aprovacao"
  | "a_atender"
  | "em_andamento"
  | "concluida"
  | "recusada";

export type CotacaoStatus =
  | "em_aberto"
  | "solicitado"
  | "enviado"
  | "respondido_parcial"
  | "cotado_parcial"
  | "cotado"
  | "finalizado";

export type OcAprovacao =
  | "aprovado"
  | "em_aberto"
  | "negociando"
  | "aguardando_aprovacao"
  | "negado";

export type OcCompraStatus =
  | "aguardando"
  | "comprado"
  | "entregue_parcial"
  | "entregue_total";

export type CentroCusto =
  | { tipo: "obra"; obraId: string; label: string }
  | { tipo: "empresa"; label: string };

export type ScItem = {
  id: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  quantidadeCotada: number;
  quantidadeComprada: number;
  quantidadeRecebida: number;
  budgetNodeId?: string;
  insumoId?: string;
  status: string;
};

export type ScComentario = {
  id: string;
  texto: string;
  autor: string;
  quando: string;
};

export type ScArquivo = {
  id: string;
  nome: string;
  quando: string;
};

export type Solicitacao = {
  id: string;
  numero: string;
  descricao: string;
  centro: CentroCusto;
  solicitante: string;
  criadoEm: string;
  necessidade: string;
  /** E04 — previsão de entrega. */
  previsaoEntrega?: string;
  urgente: boolean;
  status: ScStatus;
  itens: ScItem[];
  motivoRecusa?: string;
  cotacaoIds: string[];
  ordemIds: string[];
  comentarios?: ScComentario[];
  arquivos?: ScArquivo[];
  /** Eventos da linha do tempo (autor + data). */
  aprovadoEm?: string;
  aprovadoPor?: string;
  atendidoEm?: string;
  atendidoPor?: string;
  recebidoEm?: string;
  recebidoPor?: string;
};

export type CotacaoFornecedor = {
  id: string;
  fornecedor: string;
  contato?: string;
  email?: string;
  telefone?: string;
  qualificacao: number;
  publicToken: string;
  respondido: boolean;
};

export type CotacaoItem = {
  id: string;
  requestItemId?: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorOrcamento: number;
};

export type CotacaoPreco = {
  id: string;
  itemId: string;
  supplierId: string;
  precoUnitario: number;
  quantidadeCotada: number;
  prazoDias?: number;
  vencedor: boolean;
};

export type CotacaoArquivo = {
  id: string;
  nome: string;
  quando: string;
  supplierId?: string;
  origem: "upload" | "email";
};

export type Cotacao = {
  id: string;
  numero: string;
  descricao: string;
  requestId?: string;
  centro: CentroCusto;
  status: CotacaoStatus;
  prioridade: boolean;
  necessidade?: string;
  solicitante: string;
  criadoEm: string;
  itens: CotacaoItem[];
  fornecedores: CotacaoFornecedor[];
  precos: CotacaoPreco[];
  ordemIds: string[];
  arquivos?: CotacaoArquivo[];
};

export type OcItem = {
  id: string;
  quotationItemId?: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valor: number;
};

export type OrdemCompra = {
  id: string;
  numero: string;
  fornecedor: string;
  descricao: string;
  centro: CentroCusto;
  quotationId?: string;
  requestId?: string;
  valor: number;
  frete: number;
  outrasDespesas: number;
  impostos: number;
  desconto: number;
  aprovacaoStatus: OcAprovacao;
  compraStatus: OcCompraStatus;
  criadoEm: string;
  previsaoEntrega?: string;
  itens: OcItem[];
  payableId?: string;
};

export type ComprasConfig = {
  cotacaoNumeroInicial: number;
  ocNumeroInicial: number;
  permitirOcSemCotacao: boolean;
  fornecedorDocumentoObrigatorio: boolean;
};

export type ComprasState = {
  config: ComprasConfig;
  solicitacoes: Solicitacao[];
  cotacoes: Cotacao[];
  ordens: OrdemCompra[];
};
