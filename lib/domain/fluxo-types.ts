/** Tipos Fases 8–10 — comercial, cobrança, jurídico, regularização, fiscal (docs/especificacao.md §4–5, §7, §9). */

export type JornadaColuna =
  | "novo_contato"
  | "em_atendimento"
  | "proposta_reserva"
  | "contrato"
  | "carteira_em_dia"
  | "cobranca"
  | "quitado"
  | "escritura"
  | "perdido"
  | "retomado";

export type LeadOrigem =
  | "whatsapp"
  | "anuncio"
  | "indicacao"
  | "site"
  | "manual";

export type Lead = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  empInteresse?: string;
  origem: LeadOrigem;
  responsavel: string;
  etapa: JornadaColuna;
  criadoEm: string;
  ultimoContato?: string;
  observacoes?: string;
};

export type Proposal = {
  id: string;
  leadId?: string;
  cliente: string;
  empNome: string;
  loteLabel: string;
  valor: number;
  parcelas: number;
  entrada: number;
  validade: string;
  status: "aberta" | "reservada" | "convertida" | "cancelada";
  responsavel: string;
};

export type CollectionCase = {
  id: string;
  contratoNumero: string;
  cliente: string;
  empNome: string;
  diasAtraso: number;
  valorOriginal: number;
  valorAtualizado: number;
  faixa:
    | "a_vencer_5"
    | "1_30"
    | "31_90"
    | "acordo"
    | "juridico"
    | "retomada";
  ultimoContato?: string;
  responsavel: string;
};

export type CollectionContact = {
  id: string;
  caseId: string;
  quando: string;
  canal: "whatsapp" | "email" | "telefone" | "tarefa";
  resultado: string;
};

export type Agreement = {
  id: string;
  caseId: string;
  contratoNumero: string;
  valorAtualizado: number;
  desconto: number;
  entrada: number;
  qtdParcelas: number;
  status: "ativo" | "quebrado" | "cumprido";
  criadoEm: string;
};

export type Lawsuit = {
  id: string;
  contratoNumero: string;
  cliente: string;
  tipo: string;
  numero: string;
  vara: string;
  advogado: string;
  valorCausa: number;
  situacao: "ativo" | "suspenso" | "encerrado";
  proximoPrazo?: string;
};

export type RegularizationCase = {
  id: string;
  loteLabel: string;
  empNome: string;
  cliente: string;
  etapa:
    | "documentos"
    | "prefeitura"
    | "cartorio"
    | "registro"
    | "matricula"
    | "entregue";
  responsavel: string;
  prazo?: string;
};

export type FiscalDoc = {
  id: string;
  tipo: "nfe_recebida" | "nfse_emitida";
  numero: string;
  emissor: string;
  valor: number;
  emissao: string;
  status: "pendente" | "vinculada" | "cancelada" | "autorizada";
};

export type ReportDef = {
  id: string;
  grupo: string;
  nome: string;
  favorito: boolean;
};

export type ReportRun = {
  id: string;
  reportId: string;
  nome: string;
  quando: string;
};

export type CardMove = {
  id: string;
  cardId: string;
  de: string;
  para: string;
  quando: string;
  usuario: string;
  motivo?: string;
};

export type FluxoState = {
  leads: Lead[];
  proposals: Proposal[];
  collection: CollectionCase[];
  contacts: CollectionContact[];
  agreements: Agreement[];
  lawsuits: Lawsuit[];
  regularization: RegularizationCase[];
  fiscal: FiscalDoc[];
  reports: ReportDef[];
  reportRuns: ReportRun[];
  cardMoves: CardMove[];
  regraPausada: string[];
};
