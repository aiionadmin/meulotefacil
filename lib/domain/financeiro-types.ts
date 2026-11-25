/** Parte 4 — Financeiro Mais Controle: lançamento→pagamentos, faturamento→recebimentos. */

export type ResultadoGrupo =
  | "Receita Operacional Bruta"
  | "Receita Operacional Bruta (dedução)"
  | "Receita Operacional Líquida"
  | "Despesas Variáveis"
  | "Despesas Operacionais"
  | "Resultado Financeiro"
  | "Resultado"
  | "Somente Fluxo de Caixa";

export type ClassificacaoObra =
  | "Mão de Obra (Salários)"
  | "Mão de Obra (Encargos)"
  | "Mão de Obra (Terceirizada)"
  | "Materiais"
  | "Equipamentos"
  | "Compra de Terreno"
  | "Outros"
  | "Oculta na Gestão"
  | "a classificar";

export type PlanoConta = {
  id: string;
  nome: string;
  fluxo: "receitas" | "despesas";
  grupoResultados: ResultadoGrupo;
  ativo: boolean;
};

export type Categoria = {
  id: string;
  nome: string;
  planoId: string;
  classificacaoObra: ClassificacaoObra;
  ativo: boolean;
};

export type NaturezaReceita = {
  id: string;
  nome: string;
  ativo: boolean;
};

export type ContaBancaria = {
  id: string;
  nome: string;
  banco: string;
  tipo: "corrente" | "poupanca" | "caixa";
  proprietario: "empresa" | "cliente";
  dataInicial: string;
  valorInicial: number;
  saldo: number;
  ativa: boolean;
  bloqueioAte?: string;
  boleto: boolean;
};

export type CentroFin = {
  tipo: "obra" | "empresa";
  obraId?: string;
  label: string;
  valor?: number;
  pct?: number;
};

export type CondicaoPagamento = "a_vista" | "recorrente" | "parcelado";
export type FormaPagamento =
  | "boleto"
  | "pix"
  | "permuta"
  | "transferencia"
  | "dinheiro"
  | "cartao";

export type PagamentoStatus = "em_aberto" | "pago" | "vencido" | "parcial";

export type Lancamento = {
  id: string;
  descricao: string;
  favorecido: string;
  categoriaId: string;
  competencia: string;
  vencimento: string;
  pagador: string;
  contaId: string;
  valor: number;
  numeroDoc?: string;
  forma: FormaPagamento;
  condicao: CondicaoPagamento;
  centros: CentroFin[];
  orderId?: string;
  observacoes?: string;
  criadoEm: string;
};

export type Pagamento = {
  id: string;
  lancamentoId: string;
  parcela: string;
  vencimento: string;
  valor: number;
  valorPago: number;
  status: PagamentoStatus;
  favorecido: string;
  descricao: string;
  categoriaId: string;
  contaId: string;
  centroLabel: string;
  forma: FormaPagamento;
  condicao: CondicaoPagamento;
  numeroDoc?: string;
  pagoEm?: string;
  conciliado: boolean;
  historico: { valor: number; data: string; contaId: string; forma: FormaPagamento; quem: string }[];
};

export type Faturamento = {
  id: string;
  descricao: string;
  cliente: string;
  naturezaId: string;
  competencia: string;
  vencimento: string;
  centro: CentroFin;
  contaId: string;
  valorBruto: number;
  impostosRetidos: number;
  valorLiquido: number;
  forma: FormaPagamento;
  vendedor?: string;
  criadoEm: string;
};

export type Recebimento = {
  id: string;
  faturamentoId?: string;
  origem: "faturamento" | "contrato";
  contratoRef?: string;
  parcela: string;
  vencimento: string;
  valor: number;
  valorRecebido: number;
  status: "em_aberto" | "recebido" | "vencido" | "parcial";
  cliente: string;
  descricao: string;
  naturezaId?: string;
  contaId: string;
  centroLabel: string;
  forma: FormaPagamento;
  recebidoEm?: string;
  conciliado: boolean;
};

export type PreLancamento = {
  id: string;
  descricao: string;
  valor: number;
  centro: CentroFin;
  solicitante: string;
  status: "pendente" | "aprovado" | "recusado";
  motivoRecusa?: string;
  criadoEm: string;
  lancamentoId?: string;
};

export type Transferencia = {
  id: string;
  data: string;
  descricao: string;
  deContaId: string;
  paraContaId: string;
  valor: number;
  pago: boolean;
};

export type NotaFiscal = {
  id: string;
  emissao: string;
  serie: string;
  numero: string;
  situacao: string;
  emissor: string;
  cnpj: string;
  valor: number;
  lancada: boolean;
  lancamentoId?: string;
  meuCnpj: string;
};

export type FinanceiroConfig = {
  mesesProvisionamento: number;
  numeroDocObrigatorioLancamento: boolean;
  numeroDocObrigatorioPagamento: boolean;
};

export type MeuCnpj = {
  id: string;
  cnpj: string;
  razaoSocial: string;
  certificadoValidade?: string;
  emissaoNfse: boolean;
  capturaSefaz: boolean;
  ativo: boolean;
};

export type OfxImport = {
  id: string;
  contaId: string;
  arquivo: string;
  importadoEm: string;
  qtd: number;
  conciliados: number;
  fitIds: string[];
};

export type ExtratoLinha = {
  data: string;
  descricao: string;
  valor: number;
  saldo: number;
  origem: "saldo_inicial" | "pagamento" | "recebimento" | "transferencia" | "ofx";
  refId?: string;
  conciliado?: boolean;
};

export type FinanceiroState = {
  config: FinanceiroConfig;
  planos: PlanoConta[];
  categorias: Categoria[];
  naturezas: NaturezaReceita[];
  contas: ContaBancaria[];
  lancamentos: Lancamento[];
  pagamentos: Pagamento[];
  faturamentos: Faturamento[];
  recebimentos: Recebimento[];
  preLancamentos: PreLancamento[];
  transferencias: Transferencia[];
  notas: NotaFiscal[];
  ofxImports: OfxImport[];
  meusCnpjs: MeuCnpj[];
};
