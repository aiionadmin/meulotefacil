"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader, ModuleSection, StatusPill } from "@/components/app/ModulePage";
import {
  AttachDropZone,
  DetailRow,
  DetailSheet,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { DxfViewer } from "@/components/dxf/DxfViewer";
import { formatBRL } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import type { Lot, LotStatus } from "@/lib/domain/carteira-types";
import { cn } from "@/lib/utils";

const DXF_SAMPLES = [
  { id: "MIRASSOL.dxf", label: "Mirassol (amostra)" },
  { id: "PARQUE_UNIS.dxf", label: "Parque Unis (amostra)" },
] as const;

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

type PlantaModo = "grade" | "dxf";

export default function PlantaPage() {
  const { state, changeLotStatus, setLotPlantaPoligono } = useCarteira();
  const [devId, setDevId] = useState(state.developments[0]?.id ?? "");
  const [selected, setSelected] = useState<Lot | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [polyDraft, setPolyDraft] = useState<{ x: number; y: number }[]>([]);
  const [modo, setModo] = useState<PlantaModo>("dxf");
  const [dxfSample, setDxfSample] = useState<string>("MIRASSOL.dxf");
  const [dxfFile, setDxfFile] = useState<File | null>(null);

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
        description="DXF interativo (zoom, pan, camadas, medir) e grade colorida por status."
        actions={
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-sm border border-linha p-0.5">
              <Button
                size="sm"
                variant={modo === "dxf" ? "default" : "ghost"}
                className="h-8"
                onClick={() => setModo("dxf")}
              >
                DXF
              </Button>
              <Button
                size="sm"
                variant={modo === "grade" ? "default" : "ghost"}
                className="h-8"
                onClick={() => setModo("grade")}
              >
                Grade / PDF
              </Button>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/empreendimentos">Voltar à grade</Link>
            </Button>
          </div>
        }
      />

      {modo === "dxf" ? (
        <ModuleSection title={emp?.nome ? `DXF · ${emp.nome}` : "Visualizador DXF"}>
          <p className="mb-3 text-sm text-muted-foreground">
            Planta interativa só em <strong>.dxf</strong> — sem limite de MB.
            Controles: roda = zoom, arrastar = mover, F = enquadrar, Medir,
            camadas. Leitura só no navegador.
          </p>
          <div className="mb-4 flex flex-wrap items-center gap-2">
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
            {DXF_SAMPLES.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={
                  !dxfFile && dxfSample === s.id ? "default" : "outline"
                }
                onClick={() => {
                  setDxfFile(null);
                  setDxfSample(s.id);
                  notify("Amostra DXF", s.label);
                }}
              >
                {s.label}
              </Button>
            ))}
            {dxfFile ? (
              <span className="text-xs text-muted-foreground">
                Upload: {dxfFile.name} (
                {(dxfFile.size / (1024 * 1024)).toFixed(1)} MB)
              </span>
            ) : null}
          </div>
          <div className="mb-4 max-w-xl">
            <AttachDropZone
              accept=".dxf,.DXF"
              multiple={false}
              maxBytes={null}
              label="Arraste a planta DXF ou clique para enviar"
              hint="Somente .dxf · sem limite de tamanho"
              onFiles={(files) => {
                const f = files[0];
                if (!f) return;
                if (!/\.dxf$/i.test(f.name)) {
                  notify("Arquivo inválido", "Envie apenas .dxf");
                  return;
                }
                setDxfFile(f);
                notify(
                  "Planta DXF carregada",
                  `${f.name} · ${(f.size / (1024 * 1024)).toFixed(1)} MB`
                );
              }}
            />
          </div>
          <DxfViewer
            arquivo={dxfFile ? undefined : dxfSample}
            file={dxfFile}
            height="72vh"
            title={
              dxfFile
                ? `DXF · ${dxfFile.name}`
                : `DXF · ${dxfSample}`
            }
          />
        </ModuleSection>
      ) : null}

      {modo === "grade" ? (
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
      ) : null}

      {modo === "grade" ? (
      <>
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
            ? "Modo edição — clique na área para pontos; selecione o lote e salve o polígono"
            : "Consulta — lote colorido pelo status"}
        </p>
        {editMode ? (
          <div
            className="relative mb-4 h-48 cursor-crosshair rounded-sm border border-dashed border-ink/30 bg-white/40"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.round(
                ((e.clientX - rect.left) / rect.width) * 1000
              );
              const y = Math.round(
                ((e.clientY - rect.top) / rect.height) * 1000
              );
              setPolyDraft((p) => [...p, { x, y }]);
            }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
            >
              {polyDraft.length >= 2 ? (
                <polyline
                  points={polyDraft.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="rgba(34,120,80,0.25)"
                  stroke="#1a5c3a"
                  strokeWidth="8"
                />
              ) : null}
              {polyDraft.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="12" fill="#1a5c3a" />
              ))}
            </svg>
            <p className="pointer-events-none absolute bottom-2 left-2 text-[10px] text-ink/60">
              {polyDraft.length} ponto(s) · clique para adicionar
            </p>
          </div>
        ) : null}
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
                      COLORS[l.status],
                      (l.plantaPoligono?.length ?? 0) >= 3 &&
                        "ring-2 ring-white/80"
                    )}
                    onClick={() => {
                      setSelected(l);
                      if (editMode && polyDraft.length >= 3) {
                        setLotPlantaPoligono(l.id, polyDraft);
                        notify(
                          "Polígono salvo",
                          `Lote ${l.quadra}/${l.lote} · ${polyDraft.length} vértices`
                        );
                        setPolyDraft([]);
                      } else if (editMode) {
                        notify(
                          "Desenhe o polígono",
                          "Mínimo 3 pontos na área acima, depois clique no lote"
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
        {editMode ? (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPolyDraft([])}
            >
              Limpar pontos
            </Button>
          </div>
        ) : null}
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
              label="Polígono"
              value={
                (selected.plantaPoligono?.length ?? 0) >= 3
                  ? `${selected.plantaPoligono!.length} vértices`
                  : "—"
              }
            />
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
      </>
      ) : null}
    </div>
  );
}
