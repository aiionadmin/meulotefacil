import type {
  Atividade,
  Cliente,
  Contrato,
  Documento,
  Parcela,
  Proposta,
  VendaMes,
} from "./types";

export const clientes: Cliente[] = [
  {
    id: "cli-1",
    nome: "Ana Souza",
    email: "ana.souza@email.com",
    telefone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    criadoEm: "2026-01-12",
    lotesIds: ["l-a1"],
  },
  {
    id: "cli-2",
    nome: "Bruno Lima",
    email: "bruno.lima@email.com",
    telefone: "(19) 99876-5432",
    cpf: "987.654.321-00",
    criadoEm: "2026-02-03",
    lotesIds: ["l-b3"],
  },
  {
    id: "cli-3",
    nome: "Carla Mendes",
    email: "carla.mendes@email.com",
    telefone: "(15) 97654-3210",
    cpf: "456.789.123-00",
    criadoEm: "2026-02-18",
    lotesIds: [],
  },
  {
    id: "cli-4",
    nome: "Diego Rocha",
    email: "diego.rocha@email.com",
    telefone: "(11) 96543-2109",
    cpf: "321.654.987-00",
    criadoEm: "2026-03-01",
    lotesIds: ["l-c4"],
  },
];

export const propostas: Proposta[] = [
  {
    id: "prop-1",
    clienteId: "cli-3",
    clienteNome: "Carla Mendes",
    loteId: "l-c3",
    loteLabel: "Horizonte · Quadra C · 03",
    valor: 148000,
    status: "nova",
    criadoEm: "2026-03-10",
  },
  {
    id: "prop-2",
    clienteId: "cli-1",
    clienteNome: "Ana Souza",
    loteId: "l-a1",
    loteLabel: "Horizonte · Quadra A · 01",
    valor: 98000,
    status: "em_analise",
    criadoEm: "2026-03-08",
  },
  {
    id: "prop-3",
    clienteId: "cli-2",
    clienteNome: "Bruno Lima",
    loteId: "l-b3",
    loteLabel: "Horizonte · Quadra B · 03",
    valor: 122000,
    status: "aprovada",
    criadoEm: "2026-03-05",
  },
  {
    id: "prop-4",
    clienteId: "cli-4",
    clienteNome: "Diego Rocha",
    loteId: "l-c4",
    loteLabel: "Horizonte · Quadra C · 04",
    valor: 150000,
    status: "contrato",
    criadoEm: "2026-02-28",
  },
  {
    id: "prop-5",
    clienteId: "cli-3",
    clienteNome: "Carla Mendes",
    loteId: "l-d1",
    loteLabel: "Colinas · Quadra D · 01",
    valor: 168000,
    status: "nova",
    criadoEm: "2026-03-12",
  },
];

export const contratos: Contrato[] = [
  {
    id: "ctr-1",
    clienteNome: "Diego Rocha",
    loteLabel: "Horizonte · Quadra C · 04",
    valor: 150000,
    status: "aguardando_assinatura",
  },
  {
    id: "ctr-2",
    clienteNome: "Bruno Lima",
    loteLabel: "Horizonte · Quadra B · 03",
    valor: 122000,
    status: "ativo",
    assinadoEm: "2026-03-01",
  },
  {
    id: "ctr-3",
    clienteNome: "Ana Souza",
    loteLabel: "Horizonte · Quadra A · 01",
    valor: 98000,
    status: "rascunho",
  },
];

export const parcelas: Parcela[] = [
  {
    id: "par-1",
    clienteNome: "Bruno Lima",
    loteLabel: "Horizonte · B/03",
    numero: 1,
    totalParcelas: 120,
    valor: 1120,
    vencimento: "2026-03-10",
    status: "paga",
  },
  {
    id: "par-2",
    clienteNome: "Bruno Lima",
    loteLabel: "Horizonte · B/03",
    numero: 2,
    totalParcelas: 120,
    valor: 1120,
    vencimento: "2026-04-10",
    status: "a_receber",
  },
  {
    id: "par-3",
    clienteNome: "Maria Exemplo",
    loteLabel: "Aurora · A/02",
    numero: 8,
    totalParcelas: 96,
    valor: 890,
    vencimento: "2026-02-15",
    status: "vencida",
  },
  {
    id: "par-4",
    clienteNome: "João Exemplo",
    loteLabel: "Colinas · D/04",
    numero: 3,
    totalParcelas: 100,
    valor: 1450,
    vencimento: "2026-03-20",
    status: "a_receber",
  },
];

export const documentos: Documento[] = [
  {
    id: "doc-1",
    nome: "Matrícula do imóvel.pdf",
    tipo: "PDF",
    tamanho: "1,2 MB",
    atualizadoEm: "2026-03-01",
    relacionadoA: "Residencial Horizonte",
  },
  {
    id: "doc-2",
    nome: "Contrato modelo.docx",
    tipo: "DOCX",
    tamanho: "340 KB",
    atualizadoEm: "2026-02-20",
    relacionadoA: "Geral",
  },
  {
    id: "doc-3",
    nome: "RG - Ana Souza.jpg",
    tipo: "JPG",
    tamanho: "890 KB",
    atualizadoEm: "2026-03-08",
    relacionadoA: "Ana Souza",
  },
];

export const atividades: Atividade[] = [
  {
    id: "at-1",
    texto: "Nova proposta de Carla Mendes para Quadra C/03",
    quando: "Há 2 horas",
    tipo: "proposta",
  },
  {
    id: "at-2",
    texto: "Lote B/03 reservado por Bruno Lima",
    quando: "Ontem",
    tipo: "reserva",
  },
  {
    id: "at-3",
    texto: "Parcela 1/120 paga — Bruno Lima",
    quando: "Há 3 dias",
    tipo: "pagamento",
  },
  {
    id: "at-4",
    texto: "Documento de identidade enviado por Ana Souza",
    quando: "Há 5 dias",
    tipo: "documento",
  },
];

export const vendasPorMes: VendaMes[] = [
  { mes: "Out", vendas: 4, receita: 420000 },
  { mes: "Nov", vendas: 6, receita: 610000 },
  { mes: "Dez", vendas: 5, receita: 540000 },
  { mes: "Jan", vendas: 8, receita: 820000 },
  { mes: "Fev", vendas: 7, receita: 730000 },
  { mes: "Mar", vendas: 9, receita: 950000 },
];

export const demoUser = {
  id: "demo-user",
  nome: "Consultor Demo",
  email: "demo@meulotefacil.com.br",
  papel: "admin" as const,
};
