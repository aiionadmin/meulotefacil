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

export type NucleoVideo = {
  label: string;
  href: string;
};

/**
 * Núcleo operacional = bairro (REURB e loteamento).
 * Empreendimentos referenciam `nucleoId` / `bairro` em `Development`.
 */
export type Nucleo = {
  id: string;
  slug: string;
  nome: string;
  /** Alias explícito: núcleo é o bairro. */
  bairro?: string;
  cidade: string;
  estado: string;
  modalidade: Modalidade;
  tipo: TipoNucleo;
  lotes: number;
  lotesAprox?: boolean;
  /** Área total, ex.: "24.461,57 m²" */
  area?: string;
  status: StatusNucleo;
  fase?: FaseProcesso;
  faseLabel?: string;
  /** Ex.: CRF nº 23, de 29/04/2025 */
  aprovacao?: string;
  /** Publicação no Diário Oficial */
  diarioOficial?: string;
  /** Matrícula / cartório */
  matricula?: string;
  /** Texto completo no estilo do site de referência */
  resumo?: string;
  /** PDF da CRF em /public/docs/crf/ */
  crfPdf?: string;
  videos?: NucleoVideo[];
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
    aprovacao: "CRF nº 04, de 20/02/2026",
    diarioOficial: "Diário Oficial do Município de Campinas em 25/02/2026",
    resumo:
      "Classificação: REURB-S. Modalidade: Loteamento. Extensão: 105 lotes (aproximadamente). Aprovado através da CRF nº 04, de 20/02/2026, publicada no Diário Oficial do Município de Campinas em 25/02/2026, em fase de registro imobiliário junto ao 3º RI de Campinas.",
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
    area: "33.307,10 m²",
    status: "em_registro",
    fase: "registro",
    faseLabel: "CRF 41 de 18/12/2025; em registro no 2º RI",
    aprovacao: "CRF nº 41, de 18/12/2025",
    diarioOficial: "Diário Oficial do Município de Campinas em 19/12/2025",
    resumo:
      "Classificação: REURB-S. Modalidade: Loteamento. Extensão: 226 lotes – 33.307,10 m². Aprovado através da CRF nº 41, de 18/12/2025, publicada no Diário Oficial do Município de Campinas em 19/12/2025, em fase de registro imobiliário junto ao 2º RI de Campinas.",
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
    area: "32.726,82 m²",
    status: "concluido",
    fase: "registro",
    faseLabel: "CRF 29 de 26/09/2025; matrícula 108.214, 2º RI",
    aprovacao: "CRF nº 29, de 26/09/2025",
    diarioOficial: "Diário Oficial do Município de Campinas em 17/12/2025",
    matricula: "Matrícula nº 108.214 – 2º RI de Campinas",
    resumo:
      "Classificação: REURB-E. Modalidade: Condomínio de lotes. Extensão: 41 unidades imobiliárias – 32.726,82 m². Aprovado através da CRF nº 29, de 26/09/2025, publicada no Diário Oficial do Município de Campinas em 17/12/2025, e registrado sob Matrícula nº 108.214 – 2º RI de Campinas.",
    crfPdf: "/docs/crf/CRF-PORTAL-DA-MATA.pdf",
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
    area: "24.461,57 m²",
    status: "concluido",
    fase: "registro",
    faseLabel: "CRF 23 de 29/04/2025; matrícula 166.494, 2º RI",
    aprovacao: "CRF nº 23, de 29/04/2025",
    diarioOficial: "Diário Oficial do Município de Campinas em 30/06/2025",
    matricula: "Matrícula nº 166.494 – 2º RI de Campinas",
    resumo:
      "Classificação: REURB-S. Modalidade: Loteamento. Extensão: 200 lotes – 24.461,57 m². Aprovado através da CRF nº 23, de 29/04/2025, publicada no Diário Oficial do Município de Campinas em 30/06/2025 e registrado sob Matrícula nº 166.494 – 2º RI de Campinas.",
    crfPdf: "/docs/crf/CRF-VILA-PAULA.pdf",
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
    area: "18.534,00 m²",
    status: "concluido",
    fase: "registro",
    faseLabel: "CRF 06 de 31/07/2024; matrícula 284.069, 3º RI",
    aprovacao: "CRF nº 06, de 31/07/2024",
    diarioOficial: "Diário Oficial do Município de Campinas em 01/08/2024",
    matricula: "Matrícula nº 284.069 – 3º RI de Campinas",
    resumo:
      "Classificação: REURB-S. Modalidade: Loteamento. Extensão: 79 lotes – 18.534,00 m². Aprovado através da CRF nº 06, de 31/07/2024, publicada no Diário Oficial do Município de Campinas em 01/08/2024 e registrado sob Matrícula nº 284.069 – 3º RI de Campinas.",
    crfPdf: "/docs/crf/CRF-VILA-DIVA-2a-Fase.pdf",
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
    area: "336.021,94 m²",
    status: "concluido",
    fase: "registro",
    faseLabel: "CRF 08 de 12/09/2023; matrícula 278.474, 3º RI",
    aprovacao: "CRF nº 08, de 12/09/2023",
    diarioOficial: "Diário Oficial do Município de Campinas em 13/09/2023",
    matricula: "Matrícula nº 278.474 – 3º RI de Campinas",
    resumo:
      "Classificação: REURB-S. Modalidade: Loteamento. Extensão: 1.148 lotes – 336.021,94 m². Aprovado através da CRF nº 08, de 12/09/2023, publicada no Diário Oficial do Município de Campinas em 13/09/2023 e registrado sob Matrícula nº 278.474 – 3º RI de Campinas.",
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
    area: "18.564,61 m²",
    status: "concluido",
    fase: "registro",
    faseLabel: "CRF 01 de 03/01/2023; matrícula 269.214, 3º RI",
    aprovacao: "CRF nº 01, de 03/01/2023",
    diarioOficial: "Diário Oficial do Município de Campinas em 04/01/2023",
    matricula: "Matrícula nº 269.214 – 3º RI de Campinas",
    resumo:
      "Classificação: REURB-S. Modalidade: Loteamento. Extensão: 55 lotes – 18.564,61 m². Aprovado através da CRF nº 01, de 03/01/2023, publicada no Diário Oficial do Município de Campinas em 04/01/2023 e registrado sob Matrícula nº 269.214 – 3º RI de Campinas.",
    crfPdf: "/docs/crf/CRF-VILA-DIVA-1a-Fase.pdf",
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
    resumo:
      "Classificação: REURB-S. Modalidade: Loteamento. Extensão: 06 lotes (aproximadamente). Projeto em fase de desenvolvimento, com planta de perímetro já aprovada e publicada no Diário Oficial de Campinas em 02/03/2026.",
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
      ? "unidades"
      : "lotes"
  }`;
}

export function nucleosConcluidosOuRegistro() {
  return nucleos.filter(
    (n) => n.status === "concluido" || n.status === "em_registro"
  );
}

export function nucleosEmAndamento() {
  return nucleos.filter((n) => n.status === "em_andamento");
}

export function nucleoExtensaoLabel(n: Nucleo) {
  const base = lotesLabel(n);
  return n.area ? `${base} – ${n.area}` : base;
}
