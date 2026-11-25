"use client";

import { useMemo } from "react";
import type { CronogramaItem } from "@/lib/domain/obras-types";
import { formatDateBR } from "@/lib/masks/br";
import { criticalPathIds } from "@/lib/domain/gantt-critical";

function parseIso(iso: string) {
  return new Date(`${iso}T12:00:00`).getTime();
}

function daysBetween(a: number, b: number) {
  return Math.max(1, Math.round((b - a) / 86400000));
}

export function GanttChart({
  items,
  empty = "Sem etapas no cronograma.",
}: {
  items: CronogramaItem[];
  empty?: string;
}) {
  const model = useMemo(() => {
    if (!items.length) return null;
    const starts = items.map((i) => parseIso(i.inicio));
    const ends = items.map((i) => parseIso(i.fim));
    const min = Math.min(...starts);
    const max = Math.max(...ends);
    const span = daysBetween(min, max);
    const critical = criticalPathIds(items);
    return { min, max, span, critical };
  }, [items]);

  if (!model || !items.length) {
    return (
      <p className="text-sm text-muted-foreground">{empty}</p>
    );
  }

  const today = Date.now();
  const todayPct = Math.min(
    100,
    Math.max(0, ((today - model.min) / (model.max - model.min)) * 100)
  );

  return (
    <div className="space-y-3">
      <div className="relative overflow-x-auto rounded-md border bg-[linear-gradient(180deg,rgba(15,81,50,0.04),transparent)] p-3">
        <div
          className="pointer-events-none absolute bottom-3 top-3 w-px bg-brand-orange/70"
          style={{ left: `calc(11rem + (100% - 11rem) * ${todayPct / 100})` }}
          title="Hoje"
        />
        <ul className="min-w-[520px] space-y-2">
          {items.map((item) => {
            const start = parseIso(item.inicio);
            const end = parseIso(item.fim);
            const left = ((start - model.min) / (model.max - model.min)) * 100;
            const width = Math.max(
              4,
              ((end - start) / (model.max - model.min)) * 100
            );
            const pred = item.predecessorId
              ? items.find((x) => x.id === item.predecessorId)
              : undefined;
            const isCrit = model.critical.has(item.id);
            return (
              <li
                key={item.id}
                className="grid grid-cols-[11rem_1fr] gap-3 items-center"
              >
                <div className="truncate text-sm">
                  <div className="font-medium text-ink">
                    {item.label}
                    {isCrit ? (
                      <span className="ml-1 text-[10px] font-semibold uppercase text-brand-orange">
                        crítico
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.duracaoDias}d · {formatDateBR(item.inicio)} →{" "}
                    {formatDateBR(item.fim)}
                    {pred ? ` · após ${pred.label}` : ""}
                  </div>
                </div>
                <div className="relative h-8 rounded bg-muted/60">
                  <div
                    className={`absolute top-1 bottom-1 rounded-sm shadow-sm transition-[width,left] ${
                      isCrit
                        ? "bg-brand-orange/90"
                        : "bg-brand-green/80"
                    }`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={`${item.label}: ${formatDateBR(item.inicio)} – ${formatDateBR(item.fim)}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
          Linha laranja vertical = hoje. Barras laranja = caminho crítico (
          {model.critical.size} etapa
          {model.critical.size === 1 ? "" : "s"}).
        </span>
        <button
          type="button"
          className="underline hover:text-brand-orange"
          onClick={() => {
            const rows = [
              "label,inicio,fim,duracaoDias,critico",
              ...items.map((i) =>
                [
                  `"${i.label.replace(/"/g, '""')}"`,
                  i.inicio,
                  i.fim,
                  i.duracaoDias,
                  model.critical.has(i.id) ? "sim" : "nao",
                ].join(",")
              ),
            ].join("\n");
            const blob = new Blob([rows], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "gantt-cronograma.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Exportar CSV
        </button>
      </div>
    </div>
  );
}
