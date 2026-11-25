/** Tipos Fases 2–4 — empreendimentos, contratos, recebimentos (docs/especificacao.md §6–7, §12). */

export type LotStatus =
  | "disponivel"
  | "reservado"
  | "vendido"
  | "quitado"
  | "escritura"
  | "bloqueado";

export type DevelopmentStatus =
  | "em_orcamento"
  | "em_andamento"
  | "paralisada"
  | "finalizada";

export type DevelopmentTipo =
  | "loteamento"
  | "regularizacao"
  | "avcb"
  | "construcao";

/** C03 — modalidade do empreendimento (liga/desliga abas). */
export type DevelopmentModalidade =
  | "loteamento"
  | "regularizacao"
  | "loteamento_e_regularizacao";

export type ContractStatus =
  | "ativo"
  | "quitado"
  | "cancelado"
  | "renegociado"
  | "transferido"
  | "trocado";

export type InstallmentStatus = "em_aberto" | "vencida" | "paga" | "cancelada";

export type BankSlipStatus =
  | "gerado"
  | "remessa"
  | "registrado"
  | "pago"
  | "baixado"
  | "cancelado";

export type Development = {
  id: string;
  codigo: string;
  nome: string;
  tipo: DevelopmentTipo;
  modalidade: DevelopmentModalidade;
  status: DevelopmentStatus;
  cidade: string;
  uf: string;
  areaTotal?: string;
  qtdQuadras: number;
  qtdLotes: number;
  diasMora: number;
  taxaMoraMes: number;
  taxaMulta: number;
  diaMulta: number;
  observacoes?: string;
  empresaId?: string;
};

export type Lot = {
  id: string;
  developmentId: string;
  empNome: string;
  quadra: string;
  lote: string;
  area: number;
  padrao?: string;
  custo: number;
  valor: number;
  valorM2: number;
  status: LotStatus;
  bloqueiaVenda: boolean;
  bloqueiaFinanceiro: boolean;
  compradorNome?: string;
  contractId?: string;
  frente?: string;
  fundo?: string;
  direita?: string;
  esquerda?: string;
  matricula?: string;
};

export type PriceTable = {
  id: string;
  developmentId: string;
  nome: string;
  valorM2: number;
  ativa: boolean;
};

export type Contract = {
  id: string;
  numero: string;
  developmentId: string;
  lotId: string;
  empNome: string;
  quadra: string;
  lote: string;
  compradorId: string;
  compradorNome: string;
  corretorNome?: string;
  preco: number;
  status: ContractStatus;
  dataContrato: string;
  dataPrimeiraParcela: string;
  multaPct: number;
  taxaMoraMes: number;
  diasTolerancia: number;
  descontoPontualidadePct: number;
  diaLimiteDesconto: number;
  emiteBoleto: boolean;
  tipoReajuste: string;
  mesBase: number;
};

export type Installment = {
  id: string;
  contractId: string;
  contratoNumero: string;
  compradorNome: string;
  tipo: string;
  n: number;
  vencimento: string;
  valor: number;
  juros: number;
  multa: number;
  correcao: number;
  despesaBancaria: number;
  desconto: number;
  status: InstallmentStatus;
  nossoNumero?: string;
  pagoEm?: string;
};

export type BankSlip = {
  id: string;
  installmentId: string;
  contractId: string;
  contratoNumero: string;
  nossoNumero: string;
  banco: string;
  valor: number;
  vencimento: string;
  status: BankSlipStatus;
  remessaId?: string;
};

export type RemittanceFile = {
  id: string;
  nome: string;
  criadoEm: string;
  qtd: number;
  status: "gerada" | "enviada" | "processada";
};

export type AdjustmentRun = {
  id: string;
  indice: string;
  fator: number;
  mesBase: number;
  ano: number;
  qtdParcelas: number;
  criadoEm: string;
  desfeito: boolean;
};

export type ContractOperation = {
  id: string;
  contractId: string;
  tipo:
    | "transferencia"
    | "renegociacao"
    | "troca"
    | "retomada"
    | "antecipacao"
    | "acordo";
  quando: string;
  detalhe: string;
  desfeita: boolean;
};

export type LotStatusEvent = {
  id: string;
  lotId: string;
  de: LotStatus;
  para: LotStatus;
  motivo: string;
  quando: string;
};

export type JourneyCard = {
  id: string;
  contractId?: string;
  lotId?: string;
  pessoaNome: string;
  empNome: string;
  coluna:
    | "novo_contato"
    | "em_atendimento"
    | "proposta_reserva"
    | "contrato"
    | "carteira_em_dia"
    | "cobranca"
    | "escritura"
    | "quitado"
    | "retomado";
};

export type CarteiraState = {
  developments: Development[];
  lots: Lot[];
  priceTables: PriceTable[];
  contracts: Contract[];
  installments: Installment[];
  bankSlips: BankSlip[];
  remittances: RemittanceFile[];
  adjustments: AdjustmentRun[];
  operations: ContractOperation[];
  lotHistory: LotStatusEvent[];
  cards: JourneyCard[];
  caixaSaldo: number;
};
