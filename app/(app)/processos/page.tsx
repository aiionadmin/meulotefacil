"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { processos, statusProcessoLabel } from "@/lib/data/processos";
import { faseLabel } from "@/lib/data/nucleos";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  FilterBar,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import type { Processo, StatusProcesso } from "@/lib/data/processos";

const STATUS_COLS: { id: StatusProcesso; label: string }[] = [
  { id: "diagnostico", label: statusProcessoLabel.diagnostico },
  { id: "projetos", label: statusProcessoLabel.projetos },
  { id: "aprovacao_crf", label: statusProcessoLabel.aprovacao_crf },
  { id: "registro", label: statusProcessoLabel.registro },
  { id: "concluido", label: statusProcessoLabel.concluido },
];

export default function ProcessosPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(processos);
  const [selected, setSelected] = useState<Processo | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((p) =>
      [p.protocolo, p.nucleoNome, p.moradorNome, p.cidade]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [q, rows]);

  const toCard = useCallback(
    (p: Processo) => ({
      id: p.id,
      columnId: p.status,
      title: p.protocolo,
      subtitle: p.moradorNome,
      badge: p.docsPendentes ? `${p.docsPendentes} docs` : "Em dia",
      meta: p.nucleoNome,
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Processos REURB"
        description="Kanban | Lista por fase (C19) — protocolos e documentos pendentes."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/protocolo">Consultar protocolo</Link>
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Processos", value: rows.length },
          {
            label: "Com docs pendentes",
            value: rows.filter((p) => p.docsPendentes > 0).length,
          },
          {
            label: "Núcleos",
            value: new Set(rows.map((p) => p.nucleoNome)).size,
          },
          { label: "Filtrados", value: filtered.length },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar protocolo…" />
      <ProcessBoard
        storageKey="processos-reurb"
        columns={STATUS_COLS}
        rows={filtered}
        toCard={toCard}
        onOpen={(id) => setSelected(rows.find((p) => p.id === id) ?? null)}
        onMove={(id, to) => {
          setRows((list) =>
            list.map((p) =>
              p.id === id
                ? {
                    ...p,
                    status: to as StatusProcesso,
                    atualizadoEm: new Date().toISOString().slice(0, 10),
                  }
                : p
            )
          );
          return true;
        }}
        exportName="processos-reurb"
        listColumns={[
          {
            key: "protocolo",
            label: "Protocolo",
            filter: { type: "text" },
            getValue: (p) => p.protocolo,
          },
          {
            key: "nucleo",
            label: "Núcleo",
            filter: { type: "text" },
            getValue: (p) => p.nucleoNome,
          },
          {
            key: "morador",
            label: "Morador",
            filter: { type: "text" },
            getValue: (p) => p.moradorNome,
          },
          {
            key: "fase",
            label: "Fase",
            filter: { type: "text" },
            getValue: (p) => faseLabel[p.fase],
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: STATUS_COLS.map((c) => ({
                value: c.id,
                label: c.label,
              })),
            },
            getValue: (p) => p.status,
            render: (p) => (
              <StatusPill tone="info">
                {statusProcessoLabel[p.status]}
              </StatusPill>
            ),
          },
          {
            key: "docs",
            label: "Docs",
            filter: { type: "range" },
            getValue: (p) => p.docsPendentes,
            render: (p) =>
              p.docsPendentes > 0 ? (
                <span className="text-brand-accent-strong">
                  {p.docsPendentes} pendente(s)
                </span>
              ) : (
                <span className="text-emerald-700">Em dia</span>
              ),
          },
        ]}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.protocolo ?? ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Núcleo" value={selected.nucleoNome} />
            <DetailRow label="Morador" value={selected.moradorNome} />
            <DetailRow label="Cidade" value={selected.cidade} />
            <DetailRow label="Fase" value={faseLabel[selected.fase]} />
            <DetailRow
              label="Status"
              value={statusProcessoLabel[selected.status]}
            />
            <DetailRow
              label="Docs pendentes"
              value={String(selected.docsPendentes)}
            />
            <Button size="sm" variant="outline" asChild>
              <Link href="/documentos">Documentos do morador</Link>
            </Button>
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
