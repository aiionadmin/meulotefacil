"use client";

import dynamic from "next/dynamic";
import type { StatusLote } from "@/lib/data/types";

const LoteMap = dynamic(
  () => import("@/components/site/LoteMap").then((m) => m.LoteMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 animate-pulse rounded-2xl bg-muted" />
    ),
  }
);

export function LoteMapLazy({
  mode = "site",
  onStatusChange,
}: {
  mode?: "site" | "gestao";
  onStatusChange?: (id: string, status: StatusLote) => void;
}) {
  return <LoteMap mode={mode} onStatusChange={onStatusChange} />;
}
