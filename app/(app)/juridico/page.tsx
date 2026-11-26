"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFluxo } from "@/lib/store/fluxo-store";
import type { Lawsuit } from "@/lib/domain/fluxo-types";
import { notify } from "@/components/app/ModuleToolkit";

const COLS = [
  { id: "ativo", label: "Ativo" },
  { id: "suspenso", label: "Suspenso" },
  { id: "encerrado", label: "Encerrado" },
];

export default function JuridicoPage() {
  const { state } = useFluxo();

  const toCard = useCallback(
    (l: Lawsuit) => ({
      id: l.id,
      columnId: l.situacao,
      title: l.cliente,
      subtitle: l.tipo,
      badge: formatBRL(l.valorCausa),
      meta: l.advogado,
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Processos judiciais"
        description="Ações, prazos e advogado — Kanban | Lista (C19)."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/cobranca">Voltar à cobrança</Link>
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Processos", value: state.lawsuits.length },
          {
            label: "Ativos",
            value: state.lawsuits.filter((l) => l.situacao === "ativo").length,
          },
        ]}
      />
      <ProcessBoard
        storageKey="juridico"
        columns={COLS}
        rows={state.lawsuits}
        toCard={toCard}
        columnTotals={(_, items) =>
          items.reduce((a, l) => a + l.valorCausa, 0)
        }
        onMove={() => {
          notify("Altere situação na ficha do processo");
          return false;
        }}
        exportName="processos-judiciais"
        listColumns={[
          {
            key: "cliente",
            label: "Cliente",
            filter: { type: "text" },
            getValue: (l) => l.cliente,
          },
          {
            key: "ctr",
            label: "Contrato",
            filter: { type: "text" },
            getValue: (l) => l.contratoNumero,
          },
          {
            key: "tipo",
            label: "Tipo",
            filter: { type: "text" },
            getValue: (l) => l.tipo,
          },
          {
            key: "numero",
            label: "Nº processo",
            filter: { type: "text" },
            getValue: (l) => l.numero,
          },
          {
            key: "valor",
            label: "Causa",
            filter: { type: "range" },
            getValue: (l) => l.valorCausa,
            render: (l) => formatBRL(l.valorCausa),
          },
          {
            key: "prazo",
            label: "Prazo",
            filter: { type: "period" },
            getValue: (l) => l.proximoPrazo ?? "",
            render: (l) =>
              l.proximoPrazo ? formatDateBR(l.proximoPrazo) : "—",
          },
          {
            key: "status",
            label: "Situação",
            filter: {
              type: "status",
              options: COLS.map((c) => ({ value: c.id, label: c.label })),
            },
            getValue: (l) => l.situacao,
            render: (l) => <StatusPill tone="warn">{l.situacao}</StatusPill>,
          },
        ]}
      />
    </div>
  );
}
