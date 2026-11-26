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
  advogado: "bg-rose-800/90 hover:bg-rose-800",
  caucionado: "bg-rose-700/90 hover:bg-rose-700",
  invadido: "bg-rose-900/90 hover:bg-rose-900",
  juridico: "bg-orange-800/90 hover:bg-orange-800",
};

export default function PlantaPage() {
  const { state, changeLotStatus } = useCarteira();
  const [devId, setDevId] = useState(state.developments[0]?.id ?? "");
  const [selected, setSelected] = useState<Lot | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [editMode, setEditMode] = useState(false);

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
        description="C05 — PDF com zoom, grade colorida por status e ficha ao clicar."
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
          {state.developments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (pdfUrl) URL.revokeObjectURL(pdfUrl);
              const url = URL.createObjectURL(f);
              setPdfUrl(url);
              setPdfName(f.name);
              notify("PDF/planta carregado", `${f.name} · folha 1 · v1`);
            }}
          />
          <span className="rounded-sm border border-border bg-card px-3 py-1.5 hover:bg-paper-muted">
            Upload PDF do projeto
          </span>
        </label>
        <Button
          size="sm"
          variant={editMode ? "default" : "outline"}
          onClick={() => {
            setEditMode((v) => !v);
            notify(
              editMode ? "Consulta" : "Edição de áreas",
              editMode
                ? "Clique no lote para abrir a ficha"
                : "Selecione o lote na grade para vincular a área"
            );
          }}
        >
          {editMode ? "Sair da edição" : "Editar áreas"}
        </Button>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          >
            −
          </Button>
          <span className="w-12 text-center text-xs">{Math.round(zoom * 100)}%</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
          >
            +
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {(Object.keys(COLORS) as LotStatus[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm", COLORS[s])} />
              {s}
            </span>
          ))}
        </div>
      </div>

      {pdfUrl ? (
        <div className="overflow-auto rounded-sm border border-border bg-muted/30 p-2">
          <p className="mb-2 text-xs text-muted-foreground">
            {pdfName} · arraste a barra para navegar · zoom {Math.round(zoom * 100)}%
          </p>
          {pdfName.toLowerCase().endsWith(".pdf") ? (
            <iframe
              title="Planta PDF"
              src={pdfUrl}
              className="h-[480px] w-full rounded-sm border border-border bg-white"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%`, height: `${480 / zoom}px` }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pdfUrl}
              alt="Planta"
              className="max-w-none rounded-sm border border-border"
              style={{ width: `${zoom * 100}%` }}
            />
          )}
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-sm border border-border bg-[linear-gradient(135deg,#e8f0e4_0%,#d4e4d8_40%,#c5d5c8_100%)] p-6">
        <p className="mb-1 font-display text-lg text-ink">{emp?.nome}</p>
        <p className="mb-4 text-xs text-muted-foreground">
          {editMode
            ? "Modo edição — clique no lote para marcar área"
            : "Consulta — lote colorido pelo status"}
        </p>
        <div className="space-y-4" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
          {byQuadra.map(([quadra, items]) => (
            <div key={quadra}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/70">
                Quadra {quadra}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={cn(
                      "min-w-[3.25rem] rounded-sm px-2 py-2 text-center text-xs font-semibold text-white shadow-sm",
                      COLORS[l.status]
                    )}
                    onClick={() => {
                      setSelected(l);
                      if (editMode) {
                        notify(
                          "Área vinculada",
                          `Lote ${l.quadra}/${l.lote} ligado ao polígono (sessão)`
                        );
                      }
                    }}
                  >
                    {l.lote}
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
        title={
          selected
            ? `Lote ${selected.quadra}/${selected.lote}`
            : ""
        }
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Empreendimento" value={selected.empNome} />
            <DetailRow
              label="Status"
              value={<StatusPill tone="info">{selected.status}</StatusPill>}
            />
            <DetailRow label="Área" value={`${selected.area} m²`} />
            <DetailRow label="Valor" value={formatBRL(selected.valor)} />
            <DetailRow
              label="Comprador"
              value={selected.compradorNome ?? "—"}
            />
            {selected.status === "disponivel" ? (
              <Button
                size="sm"
                onClick={() => {
                  changeLotStatus(
                    [selected.id],
                    "reservado",
                    "Reserva pela planta"
                  );
                  notify("Reservado");
                  setSelected(null);
                }}
              >
                Reservar
              </Button>
            ) : null}
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
