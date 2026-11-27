/** Tipos Fases 2–4 — empreendimentos, contratos, recebimentos (docs/especificacao.md §6–7, §12). */

export type LotStatus =
  | "advogado"
  | "caucionado"
  | "disponivel"
  | "escritura"
  | "invadido"
  | "juridico"
  | "quitado"
  | "reservado"
  | "vendido";

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
  cep?: string;
  areaTotal?: string;
  codigoMunicipio?: string;
  padrao?: string;
  confrontacao?: string;
  matriculaNumero?: string;
  matriculaData?: string;
  adminRazao?: string;
  adminCnpj?: string;
  adminEndereco?: string;
  contaCorrentePadrao?: string;
  numeracaoPropria?: boolean;
  recadoPadrao?: string;
  qtdQuadras: number;
  qtdLotes: number;
  diasMora: number;
  taxaMoraMes: number;
  taxaMulta: number;
  diaMulta: number;
  observacoes?: string;
  empresaId?: string;
  /**
   * Planta DXF persistida no empreendimento (meta).
   * O arquivo sobe no IndexedDB (`lib/persist/dxf-blob`); amostras usam `sampleId`.
   */
  plantaDxf?: {
    nome: string;
    sampleId?: string;
    savedAt: string;
    labelCount?: number;
  };
  /** Cartório / registro (cadastro completo). */
  cartorioNome?: string;
  cartorioCidade?: string;
  cartorioUf?: string;
  certidaoNumero?: string;
  certidaoData?: string;
  certidaoObs?: string;
};

export type EmpSocio = {
  id: string;
  developmentId: string;
  nome: string;
  documento: string;
  percentual: number;
};

export type PaymentPlan = {
  id: string;
  nome: string;
  developmentId?: string;
  entradas: number;
  prestacoes: number;
  moedaRef: string;
  moedaResiduo: string;
  dataBase: string;
  series: string;
  ativo: boolean;
};

export type IndexQuote = {
  id: string;
  indice: string;
  competencia: string;
  fator: number;
};

export type Cartorio = {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  contato?: string;
};

export type Escritura = {
  id: string;
  contractId: string;
  cartorioId: string;
  protocolo: string;
  status: "em_andamento" | "registrada" | "pendente";
  data?: string;
};

export type CaixaMovimento = {
  id: string;
  data: string;
  contratoNumero?: string;
  cliente: string;
  valor: number;
  forma: string;
  autenticacao: string;
  vias: 1 | 2;
  estornado?: boolean;
  /** Movimento entra no fechamento quando marcado. */
  fechamentoId?: string;
};

/** H20 — fechamento de caixa. */
export type CaixaFechamento = {
  id: string;
  data: string;
  saldoAntes: number;
  entradas: number;
  estornos: number;
  saldoDepois: number;
  qtdMovimentos: number;
  quem: string;
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
  /** C05 — polígono da área na planta (0–100 % do canvas). */
  plantaPoligono?: { x: number; y: number }[];
};

export type PriceTable = {
  id: string;
  developmentId: string;
  nome: string;
  valorM2: number;
  jurosPct: number;
  entradaPct: number;
  opcoesParcelas: number[];
  comissaoPct: number;
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
  /** Conteúdo CNAB 400 para download (H22). */
  conteudo?: string;
};

export type AdjustmentRun = {
  id: string;
  indice: string;
  fator: number;
  mesBase: number;
  ano: number;
  qtdParcelas: number;
  residuosGerados: number;
  residuoIds: string[];
  criadoEm: string;
  desfeito: boolean;
};

/** H21 — parâmetros de recebimento / caixa. */
export type ReceiptParams = {
  multaAcumulativa: boolean;
  naoReceberAtuaisComAtrasadas: boolean;
  pagamentoParcial: boolean;
  unirVendasNoCaixa: boolean;
  despesaBancariaPadrao: number;
  textoRecibo: string;
  reciboVias: 1 | 2;
  autenticacao: boolean;
  estornoSoAdmin: boolean;
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
    | "acordo"
    | "distrato"
    | "alteracao_plano";
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
  socios: EmpSocio[];
  paymentPlans: PaymentPlan[];
  indices: IndexQuote[];
  cartorios: Cartorio[];
  escrituras: Escritura[];
  caixa: CaixaMovimento[];
  caixaFechamentos?: CaixaFechamento[];
  comissoes: {
    id: string;
    corretorNome: string;
    vendaRef: string;
    valorPrevisto: number;
    valorLiberado: number;
    valorPago: number;
    status: "prevista" | "liberada" | "paga";
  }[];
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
  receiptParams: ReceiptParams;
};
