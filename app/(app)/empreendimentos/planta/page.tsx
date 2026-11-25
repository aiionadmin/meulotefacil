"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader, StatusPill } from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import type { Lot, LotStatus } from "@/lib/domain/carteira-types";
import { cn } from "@/lib/utils";

const COLORS: Record<LotStatus, string> = {
  disponivel: "bg-emerald-600/90 hover:bg-emerald-600",
  reservado: "bg-amber-500/90 hover:bg-amber-500",
  vendido: "bg-sky-700/90 hover:bg-sky-700",
  quitado: "bg-teal-800/90 hover:bg-teal-800",
  escritura: "bg-indigo-700/90 hover:bg-indigo-700",
  bloqueado: "bg-rose-800/90 hover:bg-rose-800",
};

export default function PlantaPage() {
  const { state, changeLotStatus, addPlantPdf } = useCarteira();
  const [devId, setDevId] = useState(state.developments[0]?.id ?? "");
  const [selected, setSelected] = useState<Lot | null>(null);

  const lots = useMemo(
    () => state.lots.filter((l) => l.developmentId === devId),
    [state.lots, devId]
  );

  const byQuadra = useMemo(() => {
    const map = new Map<string, Lot[]>();
    for (const l of lots) {
      const arr = map.get(l.quadra) ?? [];
      arr.push(l);
      map.set(l.quadra, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.lote.localeCompare(b.lote, "pt-BR", { numeric: true }));
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [lots]);

  const emp = state.developments.find((d) => d.id === devId);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Planta do loteamento"
        description="PDF do projeto + lotes coloridos por situação. Marcação de polígonos na próxima iteração."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/empreendimentos">Voltar à grade</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <select
          className={fieldControlClass + " max-w-xs"}
          value={devId}
          onChange={(e) => setDevId(e.target.value)}
        >
          {state.developments
            .filter((d) => d.modalidade !== "regularizacao")
            .map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
        </select>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <span className="rounded-sm border border-border px-3 py-1.5">
            Upload PDF
          </span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file || !devId) return;
              const reader = new FileReader();
              reader.onload = () => {
                addPlantPdf({
                  developmentId: devId,
                  nomeArquivo: file.name,
                  dataUrl: String(reader.result ?? ""),
                  autor: "Admin Demo",
                });
                notify("PDF da planta anexado", file.name);
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>
        <div className="flex flex-wrap gap-2 text-xs">
          {(Object.keys(COLORS) as LotStatus[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm", COLORS[s])} />
              {s}
            </span>
          ))}
        </div>
      </div>

      {emp?.plantPdfs?.length ? (
        <div className="space-y-2 rounded-sm border border-border bg-card p-3 text-sm">
          <p className="font-medium">PDFs do projeto</p>
          <ul className="space-y-1 text-muted-foreground">
            {emp.plantPdfs.map((p) => (
              <li key={p.id}>
                v{p.versao} · {p.nomeArquivo}
                {p.dataUrl ? (
                  <>
                    {" · "}
                    <a
                      className="text-brand-orange underline"
                      href={p.dataUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      abrir
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-sm border border-border bg-[linear-gradient(135deg,#e8f0e4_0%,#d4e4d8_40%,#c5d5c8_100%)] p-6">
        <p className="mb-4 font-display text-lg text-ink">{emp?.nome}</p>
        <div className="space-y-6">
          {byQuadra.map(([quadra, itens]) => (
            <div key={quadra}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/70">
                Quadra {quadra}
              </p>
              <div className="flex flex-wrap gap-2">
                {itens.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={cn(
                      "flex h-14 w-14 flex-col items-center justify-center rounded-sm text-white shadow-sm transition",
                      COLORS[l.status]
                    )}
                    onClick={() => setSelected(l)}
                  >
                    <span className="text-[10px] opacity-80">{l.quadra}</span>
                    <span className="text-sm font-semibold">{l.lote}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `Lote ${selected.quadra}/${selected.lote}` : ""}
      >
        {selected ? (
          <div className="space-y-3">
            <StatusPill tone="info">{selected.status}</StatusPill>
            <DetailRow label="Área" value={`${selected.area} m²`} />
            <DetailRow label="Valor" value={formatBRL(selected.valor)} />
            <DetailRow label="Comprador" value={selected.compradorNome ?? "—"} />
            {selected.status === "disponivel" ? (
              <Button
                size="sm"
                onClick={() => {
                  changeLotStatus([selected.id], "reservado", "Reserva pela planta");
                  notify("Lote reservado");
                  setSelected(null);
                }}
              >
                Reservar
              </Button>
            ) : null}
            {selected.contractId ? (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/carteira?contrato=${selected.contractId}`}>
                  Abrir ficha
                </Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
