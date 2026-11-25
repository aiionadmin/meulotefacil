"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  DetailSheet,
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatDateBR } from "@/lib/masks/br";
import { useObras } from "@/lib/store/obras-store";
import { openRdoPrintWindow } from "@/lib/domain/rdo-pdf";
import type { Rdo } from "@/lib/domain/obras-types";

function weekday(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function RdoInner() {
  const search = useSearchParams();
  const obraQ = search.get("obra") ?? "";
  const { state, addRdo, updateRdoStatus, addRdoFoto, removeRdoFoto, nodesDaObra } =
    useObras();
  const [q, setQ] = useState("");
  const [obraFilter, setObraFilter] = useState(obraQ || "todos");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Rdo | null>(null);
  const [legenda, setLegenda] = useState("");
  const [form, setForm] = useState({
    obraId: obraQ || state.obras[0]?.id || "",
    data: new Date().toISOString().slice(0, 10),
    responsavel: "Eng. Paula",
    nodeId: "",
    fisicoAcumulado: 50,
  });

  const filtered = useMemo(() => {
    let list = state.rdos;
    if (obraFilter !== "todos") {
      list = list.filter((r) => r.obraId === obraFilter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((r) => {
        const obra = state.obras.find((o) => o.id === r.obraId);
        return [String(r.numero), r.data, r.responsavel, obra?.nome, r.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      });
    }
    return list;
  }, [state.rdos, state.obras, q, obraFilter]);

  const live = selected
    ? state.rdos.find((r) => r.id === selected.id) ?? selected
    : null;
  const liveObra = live
    ? state.obras.find((o) => o.id === live.obraId)
    : undefined;

  const itensObra = nodesDaObra(form.obraId).filter((n) => n.kind === "item");

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="RDO — Relatório diário de obras"
        description="Um RDO por obra e por dia. Aprovar atualiza a evolução física dos itens. PDF stub e fotos da câmera/arquivo."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/obras">Obras</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Novo RDO
            </Button>
          </>
        }
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar número, obra, responsável…">
        <select
          className={fieldControlClass + " max-w-[220px]"}
          value={obraFilter}
          onChange={(e) => setObraFilter(e.target.value)}
        >
          <option value="todos">Todas obras</option>
          {state.obras.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
      </FilterBar>

      <PaginatedTable
        columns={[
          { key: "n", label: "Nº" },
          { key: "data", label: "Data" },
          { key: "dia", label: "Dia" },
          { key: "obra", label: "Obra" },
          { key: "resp", label: "Responsável" },
          { key: "ef", label: "Efetivo" },
          { key: "fotos", label: "Fotos" },
          { key: "status", label: "Status" },
          { key: "acoes", label: "" },
        ]}
        rows={filtered.map((r) => {
          const obra = state.obras.find((o) => o.id === r.obraId);
          return {
            n: r.numero,
            data: formatDateBR(r.data),
            dia: weekday(r.data),
            obra: obra?.nome ?? "—",
            resp: r.responsavel,
            ef: r.efetivoTotal,
            fotos: (r.fotos ?? []).length,
            status: (
              <StatusPill
                tone={
                  r.status === "aprovado"
                    ? "ok"
                    : r.status === "devolvido"
                      ? "danger"
                      : "warn"
                }
              >
                {r.status}
              </StatusPill>
            ),
            acoes: (
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>
                  Abrir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openRdoPrintWindow(r, obra)}
                >
                  PDF
                </Button>
                {r.status === "rascunho" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      updateRdoStatus(r.id, "enviado");
                      notify("RDO enviado");
                    }}
                  >
                    Enviar
                  </Button>
                ) : null}
                {r.status === "enviado" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateRdoStatus(r.id, "aprovado");
                        notify("RDO aprovado · físico atualizado");
                      }}
                    >
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const motivo = window.prompt("Motivo da devolução *");
                        if (!motivo?.trim()) {
                          notify("Motivo obrigatório");
                          return;
                        }
                        updateRdoStatus(r.id, "devolvido", motivo.trim());
                        notify("RDO devolvido");
                      }}
                    >
                      Devolver
                    </Button>
                  </>
                ) : null}
              </div>
            ),
          };
        })}
      />

      <DetailSheet
        open={Boolean(live)}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
        title={live ? `RDO nº ${live.numero}` : "RDO"}
      >
        {live ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {liveObra?.nome ?? "—"} · {formatDateBR(live.data)} ·{" "}
              {live.responsavel} · {live.status}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openRdoPrintWindow(live, liveObra)}
              >
                Gerar PDF / imprimir
              </Button>
            </div>

            <ModuleSection title="Fotos do canteiro">
              <div className="mb-3 flex flex-wrap items-end gap-2">
                <Field label="Legenda">
                  <Input
                    value={legenda}
                    onChange={(e) => setLegenda(e.target.value)}
                    placeholder="Ex.: frente do trecho A"
                  />
                </Field>
                <Field label="Arquivo / câmera">
                  <Input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      try {
                        const dataUrl = await readFileAsDataUrl(file);
                        const ok = addRdoFoto(live.id, {
                          legenda,
                          dataUrl,
                        });
                        if (!ok) {
                          notify("Não foi possível anexar a foto");
                          return;
                        }
                        setLegenda("");
                        notify("Foto anexada");
                      } catch {
                        notify("Falha ao ler a imagem");
                      }
                    }}
                  />
                </Field>
              </div>
              {(live.fotos ?? []).length ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {(live.fotos ?? []).map((f) => (
                    <li key={f.id} className="rounded-md border p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.dataUrl}
                        alt={f.legenda}
                        className="h-32 w-full rounded object-cover"
                      />
                      <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate">{f.legenda}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            removeRdoFoto(live.id, f.id);
                            notify("Foto removida");
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma foto ainda. Use a câmera do celular ou um arquivo.
                </p>
              )}
            </ModuleSection>
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo RDO"
        onSubmit={() => {
          if (!form.obraId || !form.data || !form.responsavel) {
            notify("Obra, data e responsável obrigatórios");
            return;
          }
          const created = addRdo({
            obraId: form.obraId,
            data: form.data,
            responsavel: form.responsavel,
            atividades: form.nodeId
              ? [
                  {
                    nodeId: form.nodeId,
                    descricao: "Execução do dia",
                    situacao: "em_andamento",
                    quantidade: 1,
                    fisicoAcumulado: form.fisicoAcumulado,
                  },
                ]
              : [],
          });
          if (!created) {
            notify("Já existe RDO nesta data para a obra");
            return;
          }
          notify(`RDO nº ${created.numero} criado`);
          setOpen(false);
          setSelected(created);
        }}
      >
        <Field label="Obra *">
          <select
            className={fieldControlClass}
            value={form.obraId}
            onChange={(e) => setForm({ ...form, obraId: e.target.value })}
          >
            {state.obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data *">
          <Input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
          />
        </Field>
        <Field label="Responsável *">
          <Input
            value={form.responsavel}
            onChange={(e) =>
              setForm({ ...form, responsavel: e.target.value })
            }
          />
        </Field>
        <Field label="Atividade (item do orçamento)">
          <select
            className={fieldControlClass}
            value={form.nodeId}
            onChange={(e) => setForm({ ...form, nodeId: e.target.value })}
          >
            <option value="">Opcional</option>
            {itensObra.map((n) => (
              <option key={n.id} value={n.id}>
                {n.codigo} · {n.descricao}
              </option>
            ))}
          </select>
        </Field>
        <Field label="% físico acumulado">
          <Input
            type="number"
            value={form.fisicoAcumulado}
            onChange={(e) =>
              setForm({
                ...form,
                fisicoAcumulado: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}

export default function RdoPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
      <RdoInner />
    </Suspense>
  );
}
