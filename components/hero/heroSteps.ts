import { STATS } from "@/lib/institutional";

/**
 * 5 bandas alinhadas ao vídeo do cliente (15s, 3D estilizado):
 * 1 paisagem → 2 topografia/terraplenagem → 3 vias/infra → 4 paisagismo/moradias → 5 bairro ao entardecer
 */
export type HeroStepId =
  | "paisagem"
  | "topografia"
  | "infra"
  | "moradias"
  | "bairro";

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
 * Textos por progresso do scroll, REURB + batida do vídeo do cliente.
 * Troque os textos aqui sem tocar no ScrollHero.
 */
export const HERO_STEPS: HeroStep[] = [
  {
    id: "paisagem",
    start: 0,
    end: 0.18,
    marker: "Terra",
    eyebrow: "Regularização fundiária",
    title: "Tudo começa com a terra",
    body: "Cada núcleo nasce como chão sem segurança jurídica. A Meu Lote Fácil transforma essa realidade desde 2005.",
  },
  {
    id: "topografia",
    start: 0.2,
    end: 0.38,
    marker: "Projeto",
    eyebrow: "Diagnóstico e topografia",
    title: "Levantamento antes do primeiro passo",
    body: "Mapeamos o perímetro, publicamos a planta e estruturamos os projetos técnicos exigidos pela lei.",
  },
  {
    id: "infra",
    start: 0.4,
    end: 0.58,
    marker: "Infra",
    eyebrow: "Vias e redes",
    title: "Ruas, drenagem e o plano do bairro",
    body: "Infraestrutura que ninguém vê, e todo mundo sente, abre caminho para a aprovação e a CRF.",
  },
  {
    id: "moradias",
    start: 0.6,
    end: 0.78,
    marker: "Moradias",
    eyebrow: "Lotes e construção",
    title: "Do lote demarcado à casa de verdade",
    body: "Com a Certidão de Regularização Fundiária, o processo avança até o cartório. Famílias deixam a informalidade para trás.",
  },
  {
    id: "bairro",
    start: 0.8,
    end: 1,
    marker: "Bairro",
    eyebrow: "Registro em cartório",
    title: "Seu lote. Sua casa. Com escritura.",
    body: "Transformando vidas, realizando sonhos, do diagnóstico ao registro, com atendimento humano em Campinas e região.",
    showCtas: true,
    showStats: true,
  },
];

export const HERO_MARKERS = HERO_STEPS.map((s) => ({
  id: s.id,
  label: s.marker,
  at: (s.start + s.end) / 2,
}));

/** Resolução Full HD do vídeo/frames do hero (obrigatória). */
export const HERO_FRAME_WIDTH = 1920;
export const HERO_FRAME_HEIGHT = 1080;

export const HERO_FRAME_CONFIG = {
  width: HERO_FRAME_WIDTH,
  height: HERO_FRAME_HEIGHT,
  desktop: {
    count: 240,
    path: (i: number) =>
      `/hero-frames/frame_${String(i).padStart(4, "0")}.webp`,
    poster: "/hero-frames/poster.webp",
  },
  mobile: {
    count: 144,
    path: (i: number) =>
      `/hero-frames/mobile/frame_${String(i).padStart(4, "0")}.webp`,
    poster: "/hero-frames/mobile/frame_0001.webp",
  },
  lowBandwidth: {
    count: 48,
    /** Usa a sequência desktop amostrada (1 a cada N) */
    sampleEvery: 5,
  },
  preloadFirst: 30,
  lerp: 0.12,
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
  if (p >= HERO_STEPS[HERO_STEPS.length - 1].start) {
    return HERO_STEPS[HERO_STEPS.length - 1];
  }
  // gaps between steps: hold previous
  for (let i = HERO_STEPS.length - 1; i >= 0; i--) {
    if (p >= HERO_STEPS[i].start) return HERO_STEPS[i];
  }
  return HERO_STEPS[0];
}
