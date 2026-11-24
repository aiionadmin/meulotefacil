import { STATS } from "@/lib/institutional";

export type HeroStepId = "terreno" | "infra" | "construcao" | "pronto";

export type HeroStep = {
  id: HeroStepId;
  /** Progresso 0–1 (inclusive start, exclusive end salvo o último) */
  start: number;
  end: number;
  marker: string;
  eyebrow: string;
  title: string;
  body: string;
  showCtas?: boolean;
  showStats?: boolean;
};

/**
 * Textos por progresso do scroll — copy REURB adaptada aos 4 estágios
 * do vídeo (terreno → ruas/lotes → construção → lar).
 * Troque os textos aqui sem tocar no ScrollHero.
 */
export const HERO_STEPS: HeroStep[] = [
  {
    id: "terreno",
    start: 0,
    end: 0.2,
    marker: "Terreno",
    eyebrow: "Regularização fundiária",
    title: "Do chão irregular ao patrimônio com escritura",
    body: "Cada núcleo começa como terra sem segurança jurídica. A Meu Lote Fácil transforma essa realidade desde 2005.",
  },
  {
    id: "infra",
    start: 0.22,
    end: 0.45,
    marker: "Infraestrutura",
    eyebrow: "Diagnóstico e projetos",
    title: "Ruas, lotes e o plano do bairro",
    body: "Mapeamos o perímetro, publicamos a planta e estruturamos os projetos técnicos exigidos pela lei.",
  },
  {
    id: "construcao",
    start: 0.47,
    end: 0.72,
    marker: "Construção",
    eyebrow: "Aprovação e CRF",
    title: "O bairro ganha forma — e a cidade, ordem",
    body: "Com a Certidão de Regularização Fundiária, o processo avança até o cartório. Famílias deixam a informalidade para trás.",
  },
  {
    id: "pronto",
    start: 0.75,
    end: 1,
    marker: "Pronto",
    eyebrow: "Registro em cartório",
    title: "Seu lote. Sua casa. Com escritura.",
    body: "Transformando vidas, realizando sonhos — do diagnóstico ao registro, com atendimento humano em Campinas e região.",
    showCtas: true,
    showStats: true,
  },
];

export const HERO_MARKERS = HERO_STEPS.map((s) => ({
  id: s.id,
  label: s.marker,
  at: (s.start + s.end) / 2,
}));

export const HERO_FRAME_CONFIG = {
  desktop: {
    count: 150,
    path: (i: number) =>
      `/hero-frames/frame_${String(i).padStart(4, "0")}.webp`,
    poster: "/hero-frames/poster.webp",
  },
  mobile: {
    count: 90,
    path: (i: number) =>
      `/hero-frames/mobile/frame_${String(i).padStart(4, "0")}.webp`,
    poster: "/hero-frames/mobile/frame_0001.webp",
  },
  lowBandwidth: {
    count: 30,
    /** Usa a sequência desktop amostrada (1 a cada N) */
    sampleEvery: 5,
  },
  preloadFirst: 20,
  lerp: 0.1,
} as const;

export const HERO_STATS_DISPLAY = [
  { label: "Concluídas", value: `+${STATS.concluidas / 1000} mil` },
  { label: "Em andamento", value: `+${STATS.emAndamento / 1000} mil` },
  { label: "Valorização", value: `+${STATS.valorizacao}%` },
  { label: "Desde", value: String(STATS.desde) },
] as const;

export function stepForProgress(p: number): HeroStep | null {
  const step = HERO_STEPS.find((s) => p >= s.start && p < s.end);
  if (step) return step;
  if (p >= 0.75) return HERO_STEPS[HERO_STEPS.length - 1];
  // gaps between steps: hold previous
  for (let i = HERO_STEPS.length - 1; i >= 0; i--) {
    if (p >= HERO_STEPS[i].start) return HERO_STEPS[i];
  }
  return HERO_STEPS[0];
}
