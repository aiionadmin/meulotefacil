/**
 * 12 etapas do hero "Da terra ao lar".
 * TROCAR TEXTOS / CONTADORES: edite este arquivo.
 * CTAs finais alinhados à marca REURB (WhatsApp + Ver regularizações).
 */
export type HeroStage = {
  id: number;
  start: number;
  end: number;
  kicker: string;
  title: string;
  subtitle: string;
  showCtas?: boolean;
  showStats?: boolean;
};

export const HERO_STAGES: HeroStage[] = [
  {
    id: 1,
    start: 0,
    end: 0.083,
    kicker: "Terra virgem",
    title: "Tudo começa com a terra.",
    subtitle: "Um pedaço de chão cheio de possibilidades.",
  },
  {
    id: 2,
    start: 0.083,
    end: 0.166,
    kicker: "Topografia e projeto",
    title: "Planejamento antes do primeiro passo.",
    subtitle: "Levantamento topográfico e projeto aprovado.",
  },
  {
    id: 3,
    start: 0.166,
    end: 0.25,
    kicker: "Limpeza do terreno",
    title: "Preparar sem destruir.",
    subtitle: "Área de preservação protegida desde o início.",
  },
  {
    id: 4,
    start: 0.25,
    end: 0.333,
    kicker: "Terraplenagem",
    title: "A engenharia molda o terreno.",
    subtitle: "Platôs e ruas desenhados seguindo o relevo.",
  },
  {
    id: 5,
    start: 0.333,
    end: 0.416,
    kicker: "Drenagem e redes",
    title: "O que ninguém vê, todo mundo sente.",
    subtitle: "Água, esgoto e drenagem pluvial completos.",
  },
  {
    id: 6,
    start: 0.416,
    end: 0.5,
    kicker: "Guias e calçadas",
    title: "As ruas ganham forma.",
    subtitle: "Guias, sarjetas e calçadas em todo o loteamento.",
  },
  {
    id: 7,
    start: 0.5,
    end: 0.583,
    kicker: "Pavimentação",
    title: "Asfalto em cada rua.",
    subtitle: "Infraestrutura completa, pronta para receber você.",
  },
  {
    id: 8,
    start: 0.583,
    end: 0.666,
    kicker: "Energia e iluminação",
    title: "Luz em cada esquina.",
    subtitle: "Rede elétrica, iluminação LED e fibra óptica.",
  },
  {
    id: 9,
    start: 0.666,
    end: 0.75,
    kicker: "Portaria e lazer",
    title: "Segurança e lazer no mesmo lugar.",
    subtitle: "Portaria, muro perimetral e clube completo.",
  },
  {
    id: 10,
    start: 0.75,
    end: 0.833,
    kicker: "Lotes prontos",
    title: "Seu lote, pronto para construir.",
    subtitle: "Paisagismo concluído e lotes demarcados.",
  },
  {
    id: 11,
    start: 0.833,
    end: 0.916,
    kicker: "Casas subindo",
    title: "Cada parede levanta um sonho.",
    subtitle: "Projetos que viram endereço.",
  },
  {
    id: 12,
    start: 0.916,
    end: 1,
    kicker: "O bairro vivo",
    title: "Seu lar começa aqui.",
    subtitle:
      "Em Campinas e região, a escritura transforma o lote em patrimônio.",
    showCtas: true,
    showStats: true,
  },
];

/** Contadores na etapa final — números reais do site (REURB). */
export const HERO_FINAL_STATS = [
  { label: "Regularizações concluídas", value: "+7 mil" },
  { label: "Em andamento", value: "+15 mil" },
  { label: "Valorização patrimonial", value: "+150%" },
  { label: "Desde", value: "2005" },
] as const;

export function stageForProgress(p: number): HeroStage {
  const clamped = Math.min(1, Math.max(0, p));
  for (const s of HERO_STAGES) {
    if (clamped >= s.start && clamped < s.end) return s;
  }
  return HERO_STAGES[HERO_STAGES.length - 1];
}

export function stageIndexForProgress(p: number): number {
  return stageForProgress(p).id - 1;
}
