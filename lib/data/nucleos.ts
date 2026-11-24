export type Modalidade = "REURB-S" | "REURB-E" | "REURB-S e E";
export type TipoNucleo =
  | "Loteamento"
  | "Condomínio de lotes"
  | "Conjunto habitacional";
export type StatusNucleo = "concluido" | "em_registro" | "em_andamento";
export type FaseProcesso =
  | "diagnostico"
  | "planta"
  | "projetos"
  | "aprovacao_crf"
  | "registro";

export type Nucleo = {
  id: string;
  slug: string;
  nome: string;
  cidade: string;
  estado: string;
  modalidade: Modalidade;
  tipo: TipoNucleo;
  lotes: number;
  lotesAprox?: boolean;
  status: StatusNucleo;
  fase?: FaseProcesso;
  faseLabel?: string;
  aprovacao?: string;
  imagem: string;
};

function slugify(nome: string, cidade: string) {
  return `${nome}-${cidade}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const img = (n: number) => `/placeholders/empreendimento-${((n % 3) + 1)}.svg`;

export const nucleos: Nucleo[] = [
  // Concluídas / em registro
  {
    id: "n-lisa",
    slug: slugify("jardim-lisa-ii-parte-1a-fase", "campinas"),
    nome: "Jardim Lisa II Parte (1ª fase)",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 105,
    lotesAprox: true,
    status: "em_registro",
    fase: "registro",
    faseLabel: "CRF 04 de 20/02/2026; em registro no 3º RI",
    aprovacao: "CRF 04 de 20/02/2026",
    imagem: img(1),
  },
  {
    id: "n-universal",
    slug: slugify("vila-universal-1a-fase", "campinas"),
    nome: "Vila Universal (1ª fase)",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 226,
    status: "em_registro",
    fase: "registro",
    faseLabel: "CRF 41 de 18/12/2025; em registro no 2º RI",
    aprovacao: "CRF 41 de 18/12/2025",
    imagem: img(2),
  },
  {
    id: "n-portal",
    slug: slugify("portal-da-mata-i", "campinas"),
    nome: "Portal da Mata I",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-E",
    tipo: "Condomínio de lotes",
    lotes: 41,
    status: "concluido",
    fase: "registro",
    faseLabel: "CRF 29 de 26/09/2025; matrícula 108.214, 2º RI",
    aprovacao: "CRF 29 de 26/09/2025",
    imagem: img(3),
  },
  {
    id: "n-paula",
    slug: slugify("vila-paula", "campinas"),
    nome: "Vila Paula",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 200,
    status: "concluido",
    fase: "registro",
    faseLabel: "CRF 23 de 29/04/2025; matrícula 166.494, 2º RI",
    aprovacao: "CRF 23 de 29/04/2025",
    imagem: img(1),
  },
  {
    id: "n-diva2",
    slug: slugify("vila-diva-2a-fase", "campinas"),
    nome: "Vila Diva (2ª fase)",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 79,
    status: "concluido",
    fase: "registro",
    faseLabel: "CRF 06 de 31/07/2024; matrícula 284.069, 3º RI",
    aprovacao: "CRF 06 de 31/07/2024",
    imagem: img(2),
  },
  {
    id: "n-uruguai",
    slug: slugify("jardim-uruguai", "campinas"),
    nome: "Jardim Uruguai",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 1148,
    status: "concluido",
    fase: "registro",
    faseLabel: "CRF 08 de 12/09/2023; matrícula 278.474, 3º RI",
    aprovacao: "CRF 08 de 12/09/2023",
    imagem: img(3),
  },
  {
    id: "n-diva1",
    slug: slugify("vila-diva-1a-fase", "campinas"),
    nome: "Vila Diva (1ª fase)",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 55,
    status: "concluido",
    fase: "registro",
    faseLabel: "CRF 01 de 03/01/2023; matrícula 269.214, 3º RI",
    aprovacao: "CRF 01 de 03/01/2023",
    imagem: img(1),
  },
  {
    id: "n-nova-america",
    slug: slugify("nova-america", "hortolandia"),
    nome: "Nova América",
    cidade: "Hortolândia",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 1700,
    lotesAprox: true,
    status: "concluido",
    fase: "registro",
    imagem: img(2),
  },
  {
    id: "n-vila-america",
    slug: slugify("vila-america", "hortolandia"),
    nome: "Vila América",
    cidade: "Hortolândia",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 450,
    lotesAprox: true,
    status: "concluido",
    fase: "registro",
    imagem: img(3),
  },
  {
    id: "n-recanto-aguas",
    slug: slugify("recanto-das-aguas", "valinhos"),
    nome: "Recanto das Águas",
    cidade: "Valinhos",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 33,
    status: "concluido",
    fase: "registro",
    imagem: img(1),
  },
  // Em andamento
  {
    id: "n-parque-real",
    slug: slugify("parque-real", "campinas"),
    nome: "Parque Real",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-E",
    tipo: "Loteamento",
    lotes: 11,
    lotesAprox: true,
    status: "em_andamento",
    fase: "aprovacao_crf",
    faseLabel: "Aprovação final; planta publicada 03/11/2025",
    imagem: img(2),
  },
  {
    id: "n-santos-dumont",
    slug: slugify("chacaras-santos-dumont-1a-fase", "campinas"),
    nome: "Chácaras Santos Dumont (1ª fase)",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-E",
    tipo: "Loteamento",
    lotes: 74,
    lotesAprox: true,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos; planta publicada 09/03/2026",
    imagem: img(3),
  },
  {
    id: "n-mafhuz",
    slug: slugify("jardim-mafhuz-1a-fase", "campinas"),
    nome: "Jardim Mafhuz (1ª fase)",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 72,
    lotesAprox: true,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos; planta publicada 10/03/2026",
    imagem: img(1),
  },
  {
    id: "n-kairos",
    slug: slugify("kairos", "campinas"),
    nome: "Kairos",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 432,
    lotesAprox: true,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos; planta publicada 23/02/2026",
    imagem: img(2),
  },
  {
    id: "n-diva3",
    slug: slugify("vila-diva-3a-fase", "campinas"),
    nome: "Vila Diva (3ª fase)",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 348,
    lotesAprox: true,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos; planta publicada 05/09/2025",
    imagem: img(3),
  },
  {
    id: "n-aero",
    slug: slugify("jardim-aero-continental", "campinas"),
    nome: "Jardim Aero Continental",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 6,
    lotesAprox: true,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos; planta publicada 02/03/2026",
    imagem: img(1),
  },
  {
    id: "n-gleba",
    slug: slugify("gleba-12c", "campinas"),
    nome: "Gleba 12C",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-E",
    tipo: "Loteamento",
    lotes: 28,
    lotesAprox: true,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos",
    imagem: img(2),
  },
  {
    id: "n-leblon",
    slug: slugify("jardim-recreio-leblon-1a-fase", "campinas"),
    nome: "Jardim Recreio Leblon (1ª fase)",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-E",
    tipo: "Loteamento",
    lotes: 36,
    lotesAprox: true,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos",
    imagem: img(3),
  },
  {
    id: "n-pacaembu",
    slug: slugify("pacaembu", "campinas"),
    nome: "Pacaembú",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 24,
    lotesAprox: true,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos",
    imagem: img(1),
  },
  {
    id: "n-passaros",
    slug: slugify("recanto-dos-passaros-i", "campinas"),
    nome: "Recanto dos Pássaros I",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Loteamento",
    lotes: 70,
    lotesAprox: true,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos",
    imagem: img(2),
  },
  {
    id: "n-arco",
    slug: slugify("arco-verde", "campinas"),
    nome: "Arco Verde",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-E",
    tipo: "Condomínio de lotes",
    lotes: 26,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos",
    imagem: img(3),
  },
  {
    id: "n-bartolomeu",
    slug: slugify("bartolomeu-bueno", "campinas"),
    nome: "Bartolomeu Bueno",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Conjunto habitacional",
    lotes: 352,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos",
    imagem: img(1),
  },
  {
    id: "n-raposo",
    slug: slugify("raposo-tavares", "campinas"),
    nome: "Raposo Tavares",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Conjunto habitacional",
    lotes: 256,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos",
    imagem: img(2),
  },
  {
    id: "n-paschoal",
    slug: slugify("paschoal-moreira-cabral", "campinas"),
    nome: "Paschoal Moreira Cabral",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Conjunto habitacional",
    lotes: 320,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos",
    imagem: img(3),
  },
  {
    id: "n-jorge",
    slug: slugify("jorge-velho", "campinas"),
    nome: "Jorge Velho",
    cidade: "Campinas",
    estado: "SP",
    modalidade: "REURB-S",
    tipo: "Conjunto habitacional",
    lotes: 336,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos",
    imagem: img(1),
  },
  {
    id: "n-prainha",
    slug: slugify("camping-da-prainha", "amparo"),
    nome: "Camping da Prainha",
    cidade: "Amparo",
    estado: "SP",
    modalidade: "REURB-E",
    tipo: "Condomínio de lotes",
    lotes: 57,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos",
    imagem: img(2),
  },
  {
    id: "n-serra-negra",
    slug: slugify("parque-turistico-serra-negra", "amparo"),
    nome: "Parque Turístico Serra Negra",
    cidade: "Amparo",
    estado: "SP",
    modalidade: "REURB-S e E",
    tipo: "Loteamento",
    lotes: 1400,
    lotesAprox: true,
    status: "em_andamento",
    fase: "projetos",
    faseLabel: "Projetos",
    imagem: img(3),
  },
];

export const statusNucleoLabel: Record<StatusNucleo, string> = {
  concluido: "Concluído",
  em_registro: "Em registro",
  em_andamento: "Em andamento",
};

export const faseLabel: Record<FaseProcesso, string> = {
  diagnostico: "Diagnóstico",
  planta: "Planta de perímetro",
  projetos: "Projetos e estudos",
  aprovacao_crf: "Aprovação / CRF",
  registro: "Registro em cartório",
};

export function getNucleoBySlug(slug: string) {
  return nucleos.find((n) => n.slug === slug);
}

export function searchNucleos(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return nucleos.filter(
    (n) =>
      n.nome.toLowerCase().includes(q) ||
      n.cidade.toLowerCase().includes(q) ||
      n.modalidade.toLowerCase().includes(q)
  );
}

export function nucleosByCidade() {
  const map = new Map<string, Nucleo[]>();
  for (const n of nucleos) {
    const list = map.get(n.cidade) ?? [];
    list.push(n);
    map.set(n.cidade, list);
  }
  return map;
}

export function lotesLabel(n: Nucleo) {
  const prefix = n.lotesAprox ? "~" : "";
  return `${prefix}${n.lotes.toLocaleString("pt-BR")} ${
    n.tipo === "Condomínio de lotes" || n.tipo === "Conjunto habitacional"
      ? n.tipo === "Condomínio de lotes"
        ? "unidades"
        : "unidades"
      : "lotes"
  }`;
}
