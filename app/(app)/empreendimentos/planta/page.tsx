"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader, ModuleSection, StatusPill } from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { DxfViewer, type DxfPickEvent } from "@/components/dxf/DxfViewer";
import {
  labelsToLotRows,
  matchLotsFromPick,
  normalizeLotCode,
  type DxfTextLabel,
} from "@/lib/dxf/match-lote";
import { loadDxfBlob, saveDxfBlob } from "@/lib/persist/dxf-blob";
import { formatBRL } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import { useSystemSettings } from "@/lib/store/system-settings-store";
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
  const { state, changeLotStatus, setLotPlantaPoligono, updateDevelopment, importLots } =
    useCarteira();
  const { validadeReservaDias } = useSystemSettings();
  const [devId, setDevId] = useState(state.developments[0]?.id ?? "");
  const [selected, setSelected] = useState<Lot | null>(null);
  const [pickHint, setPickHint] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [polyDraft, setPolyDraft] = useState<{ x: number; y: number }[]>([]);
  const [modo, setModo] = useState<PlantaModo>("dxf");
  const [dxfSample, setDxfSample] = useState<string>("MIRASSOL.dxf");
  const [dxfFile, setDxfFile] = useState<File | null>(null);
  const [savedBuffer, setSavedBuffer] = useState<ArrayBuffer | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);
  const [labels, setLabels] = useState<DxfTextLabel[]>([]);
  const [saving, setSaving] = useState(false);

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
  const contractFor = (lot: Lot) =>
    state.contracts.find((c) => c.lotId === lot.id || c.id === lot.contractId);

  // Carrega planta salva do empreendimento (IndexedDB ou amostra)
  useEffect(() => {
    let cancelled = false;
    setDxfFile(null);
    setSavedBuffer(null);
    setSavedName(null);
    setLabels([]);
    setPickHint(null);

    const meta = emp?.plantaDxf;
    if (!meta) {
      setDxfSample("MIRASSOL.dxf");
      return;
    }
    if (meta.sampleId) {
      setDxfSample(meta.sampleId);
      return;
    }
    void (async () => {
      try {
        const row = await loadDxfBlob(devId);
        if (cancelled || !row) return;
        setSavedBuffer(row.buffer);
        setSavedName(row.name);
      } catch {
        /* sem blob — mantém amostra */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [devId, emp?.plantaDxf?.nome, emp?.plantaDxf?.sampleId, emp?.plantaDxf?.savedAt]);

  const onPick = useCallback(
    (ev: DxfPickEvent) => {
      const code = normalizeLotCode(ev.text);
      const matches = matchLotsFromPick(
        { ...ev, code },
        lots
      );
      if (matches.length === 1) {
        setSelected(matches[0]);
        setPickHint(null);
        notify("Lote na planta", `${matches[0].quadra}/${matches[0].lote}`);
        return;
      }
      if (matches.length > 1) {
        setSelected(matches[0]);
        setPickHint(
          `Vários lotes com nº ${code}: mostrando ${matches[0].quadra}/${matches[0].lote} (${matches.length} candidatos)`
        );
        return;
      }
      setSelected(null);
      setPickHint(
        `Rótulo DXF “${ev.text}” (${ev.layer}) sem lote cadastrado — use Gerar lotes do DXF`
      );
      notify("Sem cadastro", `Texto “${ev.text}” não mapeou a um lote`);
    },
    [lots]
  );

  const onLabels = useCallback((labs: DxfTextLabel[]) => {
    setLabels(labs);
  }, []);

  async function persistCurrentPlanta(opts?: { generateLots?: boolean }) {
    if (!emp) return;
    setSaving(true);
    try {
      let nome = dxfFile?.name || savedName || dxfSample;
      let sampleId: string | undefined;
      const labelCount = labels.length;

      if (dxfFile) {
        const buf = await dxfFile.arrayBuffer();
        await saveDxfBlob(devId, dxfFile.name, buf);
        setSavedBuffer(buf.slice(0));
        setSavedName(dxfFile.name);
        nome = dxfFile.name;
        sampleId = undefined;
      } else if (savedBuffer && savedName) {
        await saveDxfBlob(devId, savedName, savedBuffer);
        nome = savedName;
        sampleId = undefined;
      } else {
        // amostra pública — só meta
        sampleId = dxfSample;
        nome = dxfSample;
      }

      updateDevelopment(devId, {
        plantaDxf: {
          nome,
          sampleId,
          savedAt: new Date().toISOString(),
          labelCount,
        },
      });

      let genMsg = "";
      if (opts?.generateLots && labels.length) {
        const rows = labelsToLotRows(labels, {
          area: 250,
          precoVista: 120000,
        }).map((r) => ({
          ...r,
          situacao: "disponivel" as LotStatus,
        }));
        const res = importLots(devId, rows);
        genMsg = ` · lotes +${res.created}/≈${res.updated}`;
      }

      notify(
        "Planta salva no empreendimento",
        `${nome}${genMsg || ` · ${labelCount} rótulos`}`
      );
      setDxfFile(null);
    } catch (err) {
      notify(
        "Falha ao salvar planta",
        err instanceof Error ? err.message : "erro"
      );
    } finally {
      setSaving(false);
    }
  }

  const ficha = (
    <DetailSheet
      open={!!selected || !!pickHint}
      onOpenChange={(o) => {
        if (!o) {
          setSelected(null);
          setPickHint(null);
        }
      }}
      title={
        selected
          ? `Lote ${selected.quadra}/${selected.lote}`
          : pickHint
            ? "Seleção na planta"
            : ""
      }
    >
      {pickHint && !selected ? (
        <p className="text-sm text-muted-foreground">{pickHint}</p>
      ) : null}
      {selected ? (
        <div className="space-y-2">
          {pickHint ? (
            <p className="mb-2 text-xs text-amber-800">{pickHint}</p>
          ) : null}
          <DetailRow label="Código" value={`${selected.quadra}/${selected.lote}`} />
          <DetailRow label="Empreendimento" value={selected.empNome} />
          <DetailRow
            label="Status"
            value={<StatusPill tone="info">{selected.status}</StatusPill>}
          />
          <DetailRow label="Área" value={`${selected.area} m²`} />
          <DetailRow label="Valor" value={formatBRL(selected.valor)} />
          <DetailRow label="Valor m²" value={formatBRL(selected.valorM2)} />
          <DetailRow
            label="Matrícula"
            value={selected.matricula ?? emp?.matriculaNumero ?? "—"}
          />
          <DetailRow
            label="Comprador"
            value={
              selected.compradorNome ??
              contractFor(selected)?.compradorNome ??
              "—"
            }
          />
          <DetailRow
            label="Contrato"
            value={
              contractFor(selected)
                ? `${contractFor(selected)!.numero} · ${contractFor(selected)!.status}`
                : selected.contractId ?? "—"
            }
          />
          {emp?.cartorioNome ? (
            <DetailRow
              label="Cartório"
              value={`${emp.cartorioNome}${emp.cartorioCidade ? ` · ${emp.cartorioCidade}/${emp.cartorioUf ?? ""}` : ""}`}
            />
          ) : null}
          {emp?.certidaoNumero ? (
            <DetailRow
              label="Certidão"
              value={`${emp.certidaoNumero}${emp.certidaoData ? ` · ${emp.certidaoData}` : ""}`}
            />
          ) : null}
          <DetailRow
            label="Bloqueios"
            value={[
              selected.bloqueiaVenda ? "venda" : null,
              selected.bloqueiaFinanceiro ? "financeiro" : null,
            ]
              .filter(Boolean)
              .join(", ") || "—"}
          />
          {selected.status === "disponivel" ? (
            <Button
              size="sm"
              onClick={() => {
                changeLotStatus(
                  [selected.id],
                  "reservado",
                  "Reserva pela planta",
                  { validadeReservaDias }
                );
                notify(
                  "Reservado",
                  `Válido por ${validadeReservaDias} dia(s)`
                );
                setSelected(null);
              }}
            >
              Reservar
            </Button>
          ) : null}
          <Button size="sm" variant="outline" asChild>
            <Link href={`/vendas/nova?lotId=${selected.id}`}>Ir para venda</Link>
          </Button>
        </div>
      ) : null}
    </DetailSheet>
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Planta do loteamento"
        description="DXF interativo (zoom, pan, camadas, medir) e grade colorida por status. Clique no número do lote para abrir a ficha."
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
              <Link href="/empreendimentos/dxf-wizard">Wizard DXF → lotes</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/empreendimentos">Voltar à grade</Link>
            </Button>
          </div>
        }
      />

      {modo === "dxf" ? (
        <ModuleSection title={emp?.nome ? `DXF · ${emp.nome}` : "Visualizador DXF"}>
          <p className="mb-3 text-sm text-muted-foreground">
            Use <strong>Abrir DXF…</strong> no viewer (sem limite de MB). Clique no
            número do lote para ver status, área, valor e contrato. Salve a planta
            no empreendimento para reabrir depois.
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
                  {d.plantaDxf ? " · planta salva" : ""}
                </option>
              ))}
            </select>
            {DXF_SAMPLES.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={
                  !dxfFile && !savedBuffer && dxfSample === s.id
                    ? "default"
                    : "outline"
                }
                onClick={() => {
                  setDxfFile(null);
                  setSavedBuffer(null);
                  setSavedName(null);
                  setDxfSample(s.id);
                  notify("Amostra DXF", s.label);
                }}
              >
                {s.label}
              </Button>
            ))}
            <Button
              size="sm"
              variant="default"
              disabled={saving || !emp}
              onClick={() => void persistCurrentPlanta()}
            >
              {saving ? "Salvando…" : "Salvar planta no empreendimento"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={saving || !emp || labels.length === 0}
              onClick={() => void persistCurrentPlanta({ generateLots: true })}
            >
              Salvar + gerar lotes do DXF
            </Button>
            {emp?.plantaDxf ? (
              <span className="text-xs text-muted-foreground">
                Salva: {emp.plantaDxf.nome} ·{" "}
                {new Date(emp.plantaDxf.savedAt).toLocaleString("pt-BR")}
                {emp.plantaDxf.labelCount != null
                  ? ` · ${emp.plantaDxf.labelCount} rótulos`
                  : ""}
              </span>
            ) : null}
          </div>
          <DxfViewer
            arquivo={dxfFile || savedBuffer ? null : dxfSample}
            file={dxfFile}
            buffer={dxfFile ? null : savedBuffer}
            bufferName={savedName}
            height="72vh"
            title={`DXF · ${dxfFile?.name || savedName || dxfSample}`}
            onPick={onPick}
            onLabels={onLabels}
            onLoaded={({ name, buffer }) => {
              // Abrir DXF no viewer (ou amostra) → buffer disponível p/ salvar
              setSavedBuffer(buffer);
              setSavedName(name);
              if (/MIRASSOL|PARQUE_UNIS/i.test(name)) {
                setDxfSample(name);
              } else {
                setDxfFile(null);
              }
            }}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {labels.length
              ? `${labels.length} rótulos de lote detectados nas camadas Número/Identificação.`
              : "Aguardando rótulos do desenho…"}
          </p>
          {ficha}
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

      {ficha}
      </>
      ) : null}
    </div>
  );
}
