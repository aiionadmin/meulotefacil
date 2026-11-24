/**
 * Configuração do hero "Da terra ao lar".
 *
 * TROCAR FRAMES:
 * 1. Gere o master com docs/video-hero-da-terra-ao-lar.md
 * 2. Rode: ./scripts/extract-frames.sh caminho/para/master.mp4
 * 3. Confirme paths abaixo (desktop 300 / mobile 180).
 */
export const HERO_CONFIG = {
  /** Altura da seção de scroll */
  heightVh: { desktop: 1200, mobile: 800 },
  scrub: 0.6,
  lerp: 0.12,
  preloadFirst: 30,
  batchSize: 20,
  maxDpr: 2,
  exit: {
    start: 0.96,
    zoomTo: 1.06,
    dimTo: 0.5,
  },
  desktop: {
    count: 300,
    /** frame index 1-based */
    path: (i: number) =>
      `/hero-frames/desktop/frame_${String(i).padStart(4, "0")}.webp`,
    poster: "/hero-frames/desktop/poster.webp",
  },
  mobile: {
    count: 180,
    path: (i: number) =>
      `/hero-frames/mobile/frame_${String(i).padStart(4, "0")}.webp`,
    poster: "/hero-frames/mobile/poster.webp",
  },
  /** saveData / 2g / 3g — 1 a cada 4 frames da sequência desktop */
  lowBandwidth: {
    sampleEvery: 4,
    count: 75, // 300/4
  },
} as const;

export type HeroFrameMode = "desktop" | "mobile" | "low";
