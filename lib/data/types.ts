export type Papel = "admin" | "corretor" | "cliente";

export type StatusEmpreendimento = "lancamento" | "ultimas_unidades" | "esgotado";

export type StatusLote = "disponivel" | "reservado" | "vendido";

export type StatusProposta = "nova" | "em_analise" | "aprovada" | "contrato";

export type StatusParcela = "a_receber" | "vencida" | "paga";

export type StatusContrato = "rascunho" | "aguardando_assinatura" | "ativo" | "encerrado";

export type Empreendimento = {
  id: string;
  slug: string;
  nome: string;
  cidade: string;
  estado: string;
  metragemDesde: number;
  parcelaDesde: number;
  status: StatusEmpreendimento;
  descricao: string;
  imagem: string;
  totalLotes: number;
  lotesDisponiveis: number;
};

export type Lote = {
  id: string;
  empreendimentoId: string;
  empreendimentoSlug: string;
  quadra: string;
  numero: string;
  metragem: number;
  valor: number;
  status: StatusLote;
  /** Polígono SVG points para o mapa ilustrado */
  points: string;
};

export type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  criadoEm: string;
  lotesIds: string[];
};

export type Proposta = {
  id: string;
  clienteId: string;
  clienteNome: string;
  loteId: string;
  loteLabel: string;
  valor: number;
  status: StatusProposta;
  criadoEm: string;
};

export type Contrato = {
  id: string;
  clienteNome: string;
  loteLabel: string;
  valor: number;
  status: StatusContrato;
  assinadoEm?: string;
};

export type Parcela = {
  id: string;
  clienteNome: string;
  loteLabel: string;
  numero: number;
  totalParcelas: number;
  valor: number;
  vencimento: string;
  status: StatusParcela;
};

export type Documento = {
  id: string;
  nome: string;
  tipo: string;
  tamanho: string;
  atualizadoEm: string;
  relacionadoA: string;
};

export type Atividade = {
  id: string;
  texto: string;
  quando: string;
  tipo: "proposta" | "reserva" | "pagamento" | "documento";
};

export type VendaMes = {
  mes: string;
  vendas: number;
  receita: number;
};
