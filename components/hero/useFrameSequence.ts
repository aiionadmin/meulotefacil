"use client";

import { useCallback, useEffect, useRef } from "react";
import { HERO_FRAME_CONFIG } from "./heroSteps";

export type FrameMode = "desktop" | "mobile" | "low";

type FrameCache = (HTMLImageElement | ImageBitmap | null)[];

function isSlowConnection() {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
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
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export type FrameSequenceApi = {
  setProgress: (p: number) => void;
  resize: () => void;
  mode: FrameMode;
  ready: boolean;
};

/**
 * Sequência de frames no canvas — sem setState por frame.
 * Pré-carrega os primeiros N; resto via requestIdleCallback.
 */
export function useFrameSequence(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  opts?: {
    reducedMotion?: boolean;
    enabled?: boolean;
    onReady?: () => void;
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
  const apiRef = useRef<FrameSequenceApi | null>(null);
  const onReadyRef = useRef(opts?.onReady);
  onReadyRef.current = opts?.onReady;

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
    const img = cacheRef.current[idx];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
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

    let cancelled = false;
    const idleIds: number[] = [];

    const preload = async () => {
      const first = Math.min(HERO_FRAME_CONFIG.preloadFirst, count);
      // Prefer last frame when reduced motion
      const markReady = () => {
        if (cancelled || readyRef.current) return;
        readyRef.current = true;
        paint();
        onReadyRef.current?.();
      };

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

      await Promise.all(
        Array.from({ length: first }, async (_, i) => {
          try {
            const img = await loadImage(frameUrl(mode, i + 1));
            if (!cancelled) cacheRef.current[i] = img;
          } catch {
            /* skip broken frame */
          }
        })
      );

      if (cancelled) return;
      markReady();

      const loadRest = (start: number) => {
        if (cancelled || start >= count) return;
        const run = () => {
          void (async () => {
            try {
              const img = await loadImage(frameUrl(mode, start + 1));
              if (!cancelled) cacheRef.current[start] = img;
            } catch {
              /* ignore */
            }
            loadRest(start + 1);
          })();
        };
        if ("requestIdleCallback" in window) {
          const id = window.requestIdleCallback(run, { timeout: 1200 });
          idleIds.push(id);
        } else {
          setTimeout(run, 16);
        }
      };
      loadRest(first);
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
    targetRef.current = Math.min(1, Math.max(0, p));
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
