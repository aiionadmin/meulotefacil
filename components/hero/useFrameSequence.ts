"use client";

import { useCallback, useEffect, useRef } from "react";
import { HERO_CONFIG, type HeroFrameMode } from "./heroConfig";

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

function resolveMode(): HeroFrameMode {
  if (typeof window === "undefined") return "desktop";
  if (isSlowConnection()) return "low";
  if (window.matchMedia("(max-width: 768px)").matches) return "mobile";
  return "desktop";
}

function frameCount(mode: HeroFrameMode) {
  if (mode === "mobile") return HERO_CONFIG.mobile.count;
  if (mode === "low") return HERO_CONFIG.lowBandwidth.count;
  return HERO_CONFIG.desktop.count;
}

function frameUrl(mode: HeroFrameMode, index1: number) {
  if (mode === "mobile") return HERO_CONFIG.mobile.path(index1);
  if (mode === "low") {
    const every = HERO_CONFIG.lowBandwidth.sampleEvery;
    const mapped = Math.min(
      HERO_CONFIG.desktop.count,
      Math.max(1, (index1 - 1) * every + 1)
    );
    return HERO_CONFIG.desktop.path(mapped);
  }
  return HERO_CONFIG.desktop.path(index1);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

function nearestLoaded(cache: FrameCache, idx: number): number {
  if (cache[idx]) return idx;
  for (let d = 1; d < cache.length; d++) {
    if (idx - d >= 0 && cache[idx - d]) return idx - d;
    if (idx + d < cache.length && cache[idx + d]) return idx + d;
  }
  return -1;
}

/**
 * Sequência de frames no canvas — refs only, sem setState por frame.
 * Preload 1–30; resto em lotes de 20 via requestIdleCallback; prioriza próximos ao progresso.
 */
export function useFrameSequence(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  opts?: { reducedMotion?: boolean; enabled?: boolean }
) {
  const cacheRef = useRef<FrameCache>([]);
  const modeRef = useRef<HeroFrameMode>("desktop");
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef(0);
  const readyRef = useRef(false);
  const zoomRef = useRef(1);
  const dimRef = useRef(0);
  const loadingAroundRef = useRef(false);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const count = frameCount(modeRef.current);
    const ideal = Math.min(
      count - 1,
      Math.max(0, Math.round(currentRef.current * (count - 1)))
    );
    const idx = nearestLoaded(cacheRef.current, ideal);
    const dpr = Math.min(window.devicePixelRatio || 1, HERO_CONFIG.maxDpr);
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

    const img = idx >= 0 ? cacheRef.current[idx] : null;
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

  const prioritizeAround = useCallback(
    async (progress: number, mode: HeroFrameMode) => {
      if (loadingAroundRef.current) return;
      loadingAroundRef.current = true;
      const count = frameCount(mode);
      const center = Math.round(progress * (count - 1));
      const radius = HERO_CONFIG.batchSize;
      const jobs: Promise<void>[] = [];
      for (let i = center; i < Math.min(count, center + radius); i++) {
        if (cacheRef.current[i]) continue;
        jobs.push(
          loadImage(frameUrl(mode, i + 1))
            .then((img) => {
              cacheRef.current[i] = img;
            })
            .catch(() => undefined)
        );
      }
      await Promise.all(jobs);
      loadingAroundRef.current = false;
    },
    []
  );

  const tick = useCallback(() => {
    const lerp = HERO_CONFIG.lerp;
    currentRef.current += (targetRef.current - currentRef.current) * lerp;
    if (Math.abs(targetRef.current - currentRef.current) < 0.0004) {
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

    let cancelled = false;
    const idleIds: number[] = [];

    const scheduleIdle = (fn: () => void) => {
      if ("requestIdleCallback" in window) {
        const id = window.requestIdleCallback(fn, { timeout: 1500 });
        idleIds.push(id);
      } else {
        setTimeout(fn, 20);
      }
    };

    const preload = async () => {
      if (opts?.reducedMotion) {
        try {
          const img = await loadImage(frameUrl(mode, count));
          if (!cancelled) {
            cacheRef.current[count - 1] = img;
            currentRef.current = 1;
            targetRef.current = 1;
            readyRef.current = true;
            paint();
          }
        } catch {
          /* ignore */
        }
        return;
      }

      const first = Math.min(HERO_CONFIG.preloadFirst, count);
      await Promise.all(
        Array.from({ length: first }, async (_, i) => {
          try {
            const img = await loadImage(frameUrl(mode, i + 1));
            if (!cancelled) cacheRef.current[i] = img;
          } catch {
            /* skip */
          }
        })
      );
      if (cancelled) return;
      readyRef.current = true;
      paint();

      // Rest in batches of 20
      const loadBatch = (start: number) => {
        if (cancelled || start >= count) return;
        scheduleIdle(() => {
          void (async () => {
            const end = Math.min(count, start + HERO_CONFIG.batchSize);
            await Promise.all(
              Array.from({ length: end - start }, async (_, j) => {
                const i = start + j;
                if (cacheRef.current[i]) return;
                try {
                  const img = await loadImage(frameUrl(mode, i + 1));
                  if (!cancelled) cacheRef.current[i] = img;
                } catch {
                  /* ignore */
                }
              })
            );
            loadBatch(end);
          })();
        });
      };
      loadBatch(first);
    };

    void preload();
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => {
      modeRef.current = opts?.reducedMotion ? "desktop" : resolveMode();
      paint();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      idleIds.forEach((id) => {
        if ("cancelIdleCallback" in window) window.cancelIdleCallback(id);
      });
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      cacheRef.current.forEach((img) => {
        if (img && "close" in img && typeof img.close === "function") {
          try {
            img.close();
          } catch {
            /* */
          }
        }
      });
      cacheRef.current = [];
    };
  }, [opts?.enabled, opts?.reducedMotion, paint, tick]);

  const setProgress = useCallback(
    (p: number) => {
      targetRef.current = Math.min(1, Math.max(0, p));
      void prioritizeAround(targetRef.current, modeRef.current);
    },
    [prioritizeAround]
  );

  const setExitEffects = useCallback((zoom: number, dim: number) => {
    zoomRef.current = zoom;
    dimRef.current = dim;
  }, []);

  return { setProgress, setExitEffects, modeRef, readyRef };
}
