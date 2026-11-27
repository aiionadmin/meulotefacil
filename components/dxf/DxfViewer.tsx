"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

type DxfViewerProps = {
  /** Caminho do HTML do viewer (public/). */
  src?: string;
  /** DXF estático relativo ao viewer (ex.: MIRASSOL.dxf). Ignorado se `file` estiver setado. */
  arquivo?: string | null;
  /** Upload local — aberto no viewer sem limite de tamanho (postMessage). */
  file?: File | null;
  className?: string;
  /** Altura do iframe (default 70vh). */
  height?: string | number;
  title?: string;
};

/**
 * Embed do visualizador DXF single-file (zoom/pan/camadas/medir).
 * O canvas vive em iframe para não conflitar com o CSS do app.
 */
export function DxfViewer({
  src = "/dxf/viewer.html",
  arquivo = null,
  file = null,
  className,
  height = "70vh",
  title = "Visualizador DXF",
}: DxfViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const staticArquivo = file ? null : arquivo || "MIRASSOL.dxf";

  const url = useMemo(() => {
    if (file || !staticArquivo) return src;
    const u = new URL(src, "http://local.invalid");
    u.searchParams.set("arquivo", staticArquivo);
    return `${u.pathname}${u.search}`;
  }, [src, staticArquivo, file]);

  useEffect(() => {
    if (!file) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cancelled = false;

    async function pushBuffer() {
      if (!file || cancelled) return;
      const buffer = await file.arrayBuffer();
      if (cancelled) return;
      iframe?.contentWindow?.postMessage(
        {
          type: "mlf-dxf-load",
          name: file.name,
          buffer,
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
  }, [file, url]);

  return (
    <iframe
      ref={iframeRef}
      key={
        file
          ? `file:${file.name}:${file.size}:${file.lastModified}`
          : `src:${url}`
      }
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
