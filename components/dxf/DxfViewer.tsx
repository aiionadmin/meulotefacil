"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type DxfViewerProps = {
  /** Caminho do HTML do viewer (public/). */
  src?: string;
  /** DXF relativo ao viewer (ex.: MIRASSOL.dxf) ou absoluto /dxf/... */
  arquivo?: string;
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
  arquivo = "MIRASSOL.dxf",
  className,
  height = "70vh",
  title = "Visualizador DXF",
}: DxfViewerProps) {
  const url = useMemo(() => {
    if (!arquivo) return src;
    const u = new URL(src, "http://local.invalid");
    u.searchParams.set("arquivo", arquivo);
    return `${u.pathname}${u.search}`;
  }, [src, arquivo]);

  return (
    <iframe
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
