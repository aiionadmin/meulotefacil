import type { Empreendimento } from "./types";

export const empreendimentos: Empreendimento[] = [
  {
    id: "emp-1",
    slug: "residencial-horizonte",
    nome: "Residencial Horizonte",
    cidade: "Indaiatuba",
    estado: "SP",
    metragemDesde: 200,
    parcelaDesde: 890,
    status: "lancamento",
    descricao:
      "Loteamento planejado com vias amplas, área verde e infraestrutura completa. Ideal para construir do seu jeito, com parcelas que cabem no bolso.",
    imagem: "/placeholders/empreendimento-1.svg",
    totalLotes: 120,
    lotesDisponiveis: 84,
  },
  {
    id: "emp-2",
    slug: "jardim-das-colinas",
    nome: "Jardim das Colinas",
    cidade: "Itu",
    estado: "SP",
    metragemDesde: 250,
    parcelaDesde: 1120,
    status: "ultimas_unidades",
    descricao:
      "Terrenos generosos em região consolidada, com documentação regularizada e fácil acesso às principais vias.",
    imagem: "/placeholders/empreendimento-2.svg",
    totalLotes: 64,
    lotesDisponiveis: 9,
  },
  {
    id: "emp-3",
    slug: "parque-aurora",
    nome: "Parque Aurora",
    cidade: "Salto",
    estado: "SP",
    metragemDesde: 180,
    parcelaDesde: 740,
    status: "lancamento",
    descricao:
      "Oportunidade para quem busca o primeiro lote próprio com entrada facilitada e acompanhamento em cada etapa.",
    imagem: "/placeholders/empreendimento-3.svg",
    totalLotes: 96,
    lotesDisponiveis: 61,
  },
];

export function getEmpreendimentoBySlug(slug: string) {
  return empreendimentos.find((e) => e.slug === slug);
}

export function totalLotesDisponiveis() {
  return empreendimentos.reduce((acc, e) => acc + e.lotesDisponiveis, 0);
}
