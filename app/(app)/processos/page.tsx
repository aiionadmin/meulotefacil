"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { processos, statusProcessoLabel } from "@/lib/data/processos";
import { faseLabel } from "@/lib/data/nucleos";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  FilterBar,
} from "@/components/app/ModuleToolkit";

export default function ProcessosPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<(typeof processos)[number] | null>(
    null
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return processos;
    return processos.filter((p) =>
      [p.protocolo, p.nucleoNome, p.moradorNome, p.cidade]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Processos REURB"
        description="Acompanhamento de protocolos, fases e documentos pendentes por núcleo."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/protocolo">Consultar protocolo</Link>
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Processos", value: processos.length },
          {
            label: "Com docs pendentes",
            value: processos.filter((p) => p.docsPendentes > 0).length,
          },
          {
            label: "Núcleos",
            value: new Set(processos.map((p) => p.nucleoNome)).size,
          },
          { label: "Filtrados", value: filtered.length },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar protocolo…" />
      <DataTable
        onRowClick={(i) => setSelected(filtered[i])}
        columns={[
          { key: "protocolo", label: "Protocolo" },
          { key: "nucleo", label: "Núcleo" },
          { key: "morador", label: "Morador" },
          { key: "fase", label: "Fase" },
          { key: "status", label: "Status" },
          { key: "docs", label: "Docs" },
        ]}
        rows={filtered.map((p) => ({
          protocolo: <span className="font-medium">{p.protocolo}</span>,
          nucleo: (
            <span>
              {p.nucleoNome}
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {p.cidade}
              </span>
            </span>
          ),
          morador: p.moradorNome,
          fase: faseLabel[p.fase],
          status: (
            <StatusPill tone="info">
              {statusProcessoLabel[p.status]}
            </StatusPill>
          ),
          docs:
            p.docsPendentes > 0 ? (
              <span className="text-brand-accent-strong">
                {p.docsPendentes} pendente(s)
              </span>
            ) : (
              <span className="text-emerald-700">Em dia</span>
            ),
        }))}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.protocolo ?? "Processo"}
        footer={
          selected ? (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/documentos">Ver documentos</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/protocolo">Abrir consulta</Link>
              </Button>
            </>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="Núcleo" value={selected.nucleoNome} />
            <DetailRow label="Morador" value={selected.moradorNome} />
            <DetailRow label="Fase" value={faseLabel[selected.fase]} />
            <DetailRow
              label="Status"
              value={statusProcessoLabel[selected.status]}
            />
            <DetailRow label="Atualizado" value={selected.atualizadoEm} />
            <DetailRow
              label="Docs pendentes"
              value={selected.docsPendentes}
            />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
