/** Tipos Fases 5–7 — importação, financeiro, obras, compras (docs/especificacao.md §8–9, §13). */

export type PayableStatus = "em_aberto" | "pago" | "vencido" | "parcial";
export type ReceivableStatus = "em_aberto" | "recebido" | "vencido";
export type PurchaseStatus =
  | "rascunho"
  | "em_aprovacao"
  | "a_atender"
  | "em_andamento"
  | "concluida"
  | "recusada";
export type BudgetStatus = "rascunho" | "aprovado" | "em_execucao" | "finalizado";

export type BankAccount = {
  id: string;
  nome: string;
  banco: string;
  tipo: "corrente" | "caixa" | "aplicacao";
  saldo: number;
  boleto: boolean;
};

export type Payable = {
  id: string;
  favorecido: string;
  descricao: string;
  categoria: string;
  centroCusto: string;
  vencimento: string;
  valor: number;
  status: PayableStatus;
  contaId: string;
  pagoEm?: string;
};

export type Receivable = {
  id: string;
  cliente: string;
  descricao: string;
  origem: "contrato" | "faturamento";
  contratoRef?: string;
  centroCusto: string;
  vencimento: string;
  valor: number;
  status: ReceivableStatus;
  contaId: string;
  recebidoEm?: string;
};

export type Transfer = {
  id: string;
  deContaId: string;
  paraContaId: string;
  valor: number;
  data: string;
  descricao: string;
};

export type PreEntry = {
  id: string;
  descricao: string;
  valor: number;
  centroCusto: string;
  solicitante: string;
  status: "pendente" | "aprovado" | "recusado";
};

export type BudgetNode = {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  custoUnit: number;
  orcado: number;
  realizado: number;
};

export type WorkSite = {
  id: string;
  developmentId: string;
  nome: string;
  status: string;
  fisico: number;
  orcado: number;
  realizado: number;
  budgetStatus: BudgetStatus;
  nodes: BudgetNode[];
};

export type PurchaseRequest = {
  id: string;
  numero: string;
  descricao: string;
  centroCusto: string;
  solicitante: string;
  necessidade: string;
  urgente: boolean;
  status: PurchaseStatus;
  itens: number;
  valorEstimado: number;
};

export type PurchaseOrder = {
  id: string;
  numero: string;
  fornecedor: string;
  centroCusto: string;
  valor: number;
  status: "aguardando" | "aprovado" | "comprado" | "entregue";
  requestId?: string;
};

export type ImportEntity = {
  id: string;
  entidade: string;
  ordem: number;
  legacySystem: "lotewin" | "mais_controle";
  expected: number;
  imported: number;
  status: "pendente" | "parcial" | "ok" | "divergente";
  legacyIdSample?: string;
};

export type ConferenceMetric = {
  id: string;
  label: string;
  expected: number;
  actual: number;
  unit: "count" | "money";
};

export type OperacoesState = {
  accounts: BankAccount[];
  payables: Payable[];
  receivables: Receivable[];
  transfers: Transfer[];
  preEntries: PreEntry[];
  works: WorkSite[];
  purchases: PurchaseRequest[];
  orders: PurchaseOrder[];
  importQueue: ImportEntity[];
  conference: ConferenceMetric[];
  lastImportAt?: string;
};
