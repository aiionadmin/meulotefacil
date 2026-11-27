"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import type { DxfTextLabel } from "@/lib/dxf/match-lote";

export type DxfPickEvent = {
  text: string;
  layer: string;
  x: number;
  y: number;
};

type DxfViewerProps = {
  /** Caminho do HTML do viewer (public/). */
  src?: string;
  /** DXF estático relativo ao viewer (ex.: MIRASSOL.dxf). Ignorado se `file` estiver setado. */
  arquivo?: string | null;
  /** Upload local — aberto no viewer sem limite de tamanho (postMessage). */
  file?: File | null;
  /** ArrayBuffer já persistido (IndexedDB) — prioridade após `file`. */
  buffer?: ArrayBuffer | null;
  bufferName?: string | null;
  className?: string;
  /** Altura do iframe (default 70vh). */
  height?: string | number;
  title?: string;
  onPick?: (ev: DxfPickEvent) => void;
  onLabels?: (labels: DxfTextLabel[], name: string) => void;
  /** Disparado quando o viewer abre um DXF (Abrir DXF / drop / amostra). */
  onLoaded?: (info: { name: string; buffer: ArrayBuffer }) => void;
};

/**
 * Embed do visualizador DXF single-file (zoom/pan/camadas/medir).
 * O canvas vive em iframe para não conflitar com o CSS do app.
 * Clique em rótulo de lote → `onPick` (postMessage `mlf-dxf-pick`).
 */
export function DxfViewer({
  src = "/dxf/viewer.html",
  arquivo = null,
  file = null,
  buffer = null,
  bufferName = null,
  className,
  height = "70vh",
  title = "Visualizador DXF",
  onPick,
  onLabels,
  onLoaded,
}: DxfViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onPickRef = useRef(onPick);
  const onLabelsRef = useRef(onLabels);
  const onLoadedRef = useRef(onLoaded);
  onPickRef.current = onPick;
  onLabelsRef.current = onLabels;
  onLoadedRef.current = onLoaded;

  const staticArquivo = file || buffer ? null : arquivo || "MIRASSOL.dxf";

  const url = useMemo(() => {
    if (file || buffer || !staticArquivo) return src;
    const u = new URL(src, "http://local.invalid");
    u.searchParams.set("arquivo", staticArquivo);
    return `${u.pathname}${u.search}`;
  }, [src, staticArquivo, file, buffer]);

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      const d = ev.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "mlf-dxf-pick" && onPickRef.current) {
        onPickRef.current({
          text: String(d.text ?? ""),
          layer: String(d.layer ?? ""),
          x: Number(d.x) || 0,
          y: Number(d.y) || 0,
        });
      }
      if (d.type === "mlf-dxf-labels" && onLabelsRef.current) {
        const labels = Array.isArray(d.labels) ? (d.labels as DxfTextLabel[]) : [];
        onLabelsRef.current(labels, String(d.name ?? ""));
      }
      if (d.type === "mlf-dxf-loaded" && onLoadedRef.current && d.buffer) {
        const buf =
          d.buffer instanceof ArrayBuffer
            ? d.buffer
            : (d.buffer as { buffer?: ArrayBuffer }).buffer;
        if (buf) {
          onLoadedRef.current({
            name: String(d.name ?? "planta.dxf"),
            buffer: buf,
          });
        }
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const payload = file
      ? { name: file.name, getBuffer: () => file.arrayBuffer() }
      : buffer
        ? {
            name: bufferName || "planta.dxf",
            getBuffer: async () => buffer.slice(0),
          }
        : null;
    if (!payload) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cancelled = false;

    async function pushBuffer() {
      if (!payload || cancelled) return;
      const buf = await payload.getBuffer();
      if (cancelled) return;
      iframe?.contentWindow?.postMessage(
        {
          type: "mlf-dxf-load",
          name: payload.name,
          buffer: buf,
        },
        "*"
      );
    }

    function onLoad() {
      void pushBuffer();
    }

    iframe.addEventListener("load", onLoad);
    try {
      if (iframe.contentDocument?.readyState === "complete") {
        void pushBuffer();
      }
    } catch {
      /* wait for load */
    }

    return () => {
      cancelled = true;
      iframe.removeEventListener("load", onLoad);
    };
  }, [file, buffer, bufferName, url]);

  const key = file
    ? `file:${file.name}:${file.size}:${file.lastModified}`
    : buffer
      ? `buf:${bufferName}:${buffer.byteLength}`
      : `src:${url}`;

  return (
    <iframe
      ref={iframeRef}
      key={key}
      title={title}
      src={url}
      className={cn(
        "w-full overflow-hidden rounded-sm border border-linha bg-paper shadow-sm",
        className
      )}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        minHeight: 420,
      }}
      allow="fullscreen"
    />
  );
}
