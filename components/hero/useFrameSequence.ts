"use client";

import { useCallback, useEffect, useRef } from "react";
import { HERO_FRAME_CONFIG } from "./heroSteps";

export type FrameMode = "desktop" | "mobile" | "low";

type FrameCache = (HTMLImageElement | ImageBitmap | null)[];

function isSlowConnection() {
  if (typeof navigator === "undefined") return false;
  const c = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (!c) return false;
  if (c.saveData) return true;
  const t = c.effectiveType;
  return t === "slow-2g" || t === "2g" || t === "3g";
}

function resolveMode(): FrameMode {
  if (typeof window === "undefined") return "desktop";
  if (isSlowConnection()) return "low";
  if (window.matchMedia("(max-width: 768px)").matches) return "mobile";
  return "desktop";
}

function frameUrl(mode: FrameMode, index1: number) {
  if (mode === "mobile") return HERO_FRAME_CONFIG.mobile.path(index1);
  if (mode === "low") {
    const every = HERO_FRAME_CONFIG.lowBandwidth.sampleEvery;
    const mapped = Math.min(
      HERO_FRAME_CONFIG.desktop.count,
      Math.max(1, (index1 - 1) * every + 1)
    );
    return HERO_FRAME_CONFIG.desktop.path(mapped);
  }
  return HERO_FRAME_CONFIG.desktop.path(index1);
}

function frameCount(mode: FrameMode) {
  if (mode === "mobile") return HERO_FRAME_CONFIG.mobile.count;
  if (mode === "low") return HERO_FRAME_CONFIG.lowBandwidth.count;
  return HERO_FRAME_CONFIG.desktop.count;
}

async function loadImage(src: string, retries = 2): Promise<HTMLImageElement> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.decoding = "async";
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error(`frame failed: ${src}`));
        el.src = src;
      });
      return img;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 180 * (attempt + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  cw: number,
  ch: number,
  iw: number,
  ih: number
) {
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function nearestFrame(
  cache: FrameCache,
  idx: number
): HTMLImageElement | ImageBitmap | null {
  if (cache[idx]) return cache[idx];
  for (let d = 1; d < cache.length; d++) {
    const lo = idx - d;
    const hi = idx + d;
    if (lo >= 0 && cache[lo]) return cache[lo];
    if (hi < cache.length && cache[hi]) return cache[hi];
  }
  return null;
}

export type FrameSequenceApi = {
  setProgress: (p: number) => void;
  resize: () => void;
  mode: FrameMode;
  ready: boolean;
};

/**
 * Sequência de frames no canvas, sem setState por frame.
 * Prioriza o frame do progresso atual (scroll restore) e faz fallback
 * para o vizinho mais próximo quando o alvo ainda não chegou.
 */
export function useFrameSequence(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  opts?: {
    reducedMotion?: boolean;
    enabled?: boolean;
    onReady?: () => void;
    onFrameAvailable?: (index: number) => void;
  }
) {
  const cacheRef = useRef<FrameCache>([]);
  const modeRef = useRef<FrameMode>("desktop");
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef(0);
  const readyRef = useRef(false);
  const zoomRef = useRef(1);
  const dimRef = useRef(0);
  const pendingPriorityRef = useRef<Set<number>>(new Set());
  const loadingRef = useRef<Set<number>>(new Set());
  const loadOneRef = useRef<(index0: number) => Promise<void>>(async () => {});
  const apiRef = useRef<FrameSequenceApi | null>(null);
  const onReadyRef = useRef(opts?.onReady);
  const onFrameAvailableRef = useRef(opts?.onFrameAvailable);
  onReadyRef.current = opts?.onReady;
  onFrameAvailableRef.current = opts?.onFrameAvailable;

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const count = frameCount(modeRef.current);
    const idx = Math.min(
      count - 1,
      Math.max(0, Math.round(currentRef.current * (count - 1)))
    );
    const img = nearestFrame(cacheRef.current, idx);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    if (
      canvas.width !== Math.floor(w * dpr) ||
      canvas.height !== Math.floor(h * dpr)
    ) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#111614";
    ctx.fillRect(0, 0, w, h);

    if (img) {
      ctx.save();
      const z = zoomRef.current;
      ctx.translate(w / 2, h / 2);
      ctx.scale(z, z);
      ctx.translate(-w / 2, -h / 2);
      const iw =
        "naturalWidth" in img
          ? (img as HTMLImageElement).naturalWidth
          : (img as ImageBitmap).width;
      const ih =
        "naturalHeight" in img
          ? (img as HTMLImageElement).naturalHeight
          : (img as ImageBitmap).height;
      drawCover(ctx, img, w, h, iw || w, ih || h);
      ctx.restore();
    }

    if (dimRef.current > 0) {
      ctx.fillStyle = `rgba(17, 22, 20, ${dimRef.current})`;
      ctx.fillRect(0, 0, w, h);
    }
  }, [canvasRef]);

  const tick = useCallback(() => {
    const lerp = HERO_FRAME_CONFIG.lerp;
    currentRef.current += (targetRef.current - currentRef.current) * lerp;
    if (Math.abs(targetRef.current - currentRef.current) < 0.0005) {
      currentRef.current = targetRef.current;
    }
    paint();
    rafRef.current = requestAnimationFrame(tick);
  }, [paint]);

  useEffect(() => {
    if (opts?.enabled === false) return;

    const mode = opts?.reducedMotion ? "desktop" : resolveMode();
    modeRef.current = mode;
    const count = frameCount(mode);
    cacheRef.current = new Array(count).fill(null);
    readyRef.current = false;
    pendingPriorityRef.current.clear();
    loadingRef.current.clear();

    let cancelled = false;
    const idleIds: number[] = [];

    const storeFrame = (index0: number, img: HTMLImageElement) => {
      if (cancelled) return;
      cacheRef.current[index0] = img;
      onFrameAvailableRef.current?.(index0);
      paint();
    };

    const loadOne = async (index0: number) => {
      if (
        cancelled ||
        index0 < 0 ||
        index0 >= count ||
        cacheRef.current[index0] ||
        loadingRef.current.has(index0)
      ) {
        return;
      }
      loadingRef.current.add(index0);
      try {
        const img = await loadImage(frameUrl(mode, index0 + 1));
        storeFrame(index0, img);
      } catch {
        /* skip broken frame — paint uses nearest */
      } finally {
        loadingRef.current.delete(index0);
      }
    };
    loadOneRef.current = loadOne;

    const markReady = () => {
      if (cancelled || readyRef.current) return;
      readyRef.current = true;
      paint();
      onReadyRef.current?.();
    };

    const progressFromScroll = () => {
      const section = document.getElementById("hero-scroll");
      if (!section) return targetRef.current;
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return 0;
      const scrolled = Math.min(
        total,
        Math.max(0, -section.getBoundingClientRect().top)
      );
      return scrolled / total;
    };

    const preload = async () => {
      if (opts?.reducedMotion) {
        try {
          const img = await loadImage(frameUrl(mode, count));
          if (!cancelled) {
            cacheRef.current[count - 1] = img;
            currentRef.current = 1;
            targetRef.current = 1;
            markReady();
          }
        } catch {
          markReady();
        }
        return;
      }

      // Sync to current scroll (handles browser restore mid-hero)
      const bootP = progressFromScroll();
      targetRef.current = bootP;
      currentRef.current = bootP;
      const bootIdx = Math.min(
        count - 1,
        Math.max(0, Math.round(bootP * (count - 1)))
      );
      await loadOne(bootIdx);
      if (cancelled) return;
      markReady();

      const first = Math.min(HERO_FRAME_CONFIG.preloadFirst, count);
      const around = [
        bootIdx,
        ...Array.from({ length: 8 }, (_, i) => bootIdx - i - 1),
        ...Array.from({ length: 8 }, (_, i) => bootIdx + i + 1),
      ].filter((i) => i >= 0 && i < count);

      await Promise.all(around.map((i) => loadOne(i)));
      if (cancelled) return;

      // Head of sequence (smooth start after jump-to-top)
      await Promise.all(Array.from({ length: first }, (_, i) => loadOne(i)));
      if (cancelled) return;

      const loadRest = (start: number) => {
        if (cancelled || start >= count) return;

        // Drain priority queue first (scroll jumps)
        const priority = pendingPriorityRef.current;
        if (priority.size > 0) {
          const next = priority.values().next().value as number;
          priority.delete(next);
          void loadOne(next).then(() => loadRest(start));
          return;
        }

        if (cacheRef.current[start]) {
          loadRest(start + 1);
          return;
        }

        const run = () => {
          void loadOne(start).then(() => loadRest(start + 1));
        };
        if ("requestIdleCallback" in window) {
          const id = window.requestIdleCallback(run, { timeout: 900 });
          idleIds.push(id);
        } else {
          setTimeout(run, 12);
        }
      };
      loadRest(0);
    };

    void preload();
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => paint();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      idleIds.forEach((id) => {
        if ("cancelIdleCallback" in window) window.cancelIdleCallback(id);
      });
      window.removeEventListener("resize", onResize);
      cacheRef.current.forEach((img) => {
        if (img && "close" in img && typeof img.close === "function") {
          try {
            img.close();
          } catch {
            /* ImageBitmap */
          }
        }
      });
      cacheRef.current = [];
    };
  }, [opts?.enabled, opts?.reducedMotion, paint, tick]);

  const setProgress = useCallback((p: number) => {
    const next = Math.min(1, Math.max(0, p));
    targetRef.current = next;
    const count = frameCount(modeRef.current);
    if (count <= 0) return;
    const idx = Math.min(count - 1, Math.max(0, Math.round(next * (count - 1))));
    const want = [idx, idx - 1, idx + 1].filter((i) => i >= 0 && i < count);
    for (const i of want) {
      if (!cacheRef.current[i] && !loadingRef.current.has(i)) {
        pendingPriorityRef.current.add(i);
        void loadOneRef.current(i);
      }
    }
  }, []);

  const setExitEffects = useCallback((zoom: number, dim: number) => {
    zoomRef.current = zoom;
    dimRef.current = dim;
  }, []);

  apiRef.current = {
    setProgress,
    resize: paint,
    mode: modeRef.current,
    ready: readyRef.current,
  };

  return { setProgress, setExitEffects, modeRef, readyRef };
}
