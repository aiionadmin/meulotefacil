"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import { BoardViews } from "@/components/kanban/BoardViews";
import { DetailRow, DetailSheet } from "@/components/app/ModuleToolkit";
import { useOperacoes } from "@/lib/store/operacoes-store";
import { formatBRL } from "@/lib/masks/br";
import { statusLabel } from "@/lib/status/labels";

const COLS = [
  { id: "em orçamento", label: "Em orçamento" },
  { id: "em andamento", label: "Em andamento" },
  { id: "paralisada", label: "Paralisada" },
  { id: "finalizada", label: "Finalizada" },
];

export default function QuadroObrasPage() {
  const { state } = useOperacoes();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = state.works.find((w) => w.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: obras"
        description="Visão por status da obra."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/obras">Gestão de custos</Link>
          </Button>
        }
      />
      <BoardViews
        storageKey="obras"
        columns={COLS.map((c) => ({ ...c, droppable: false }))}
        cards={state.works.map((w) => ({
          id: w.id,
          columnId: w.status,
          title: w.nome,
          subtitle: `${w.fisico}% físico`,
          meta: formatBRL(w.realizado),
        }))}
        onMove={() => false}
        onOpen={setSelectedId}
      />
      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelectedId(null)}
        title={selected?.nome ?? ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Status" value={statusLabel(selected.status)} />
            <DetailRow label="Físico" value={`${selected.fisico}%`} />
            <DetailRow label="Orçado" value={formatBRL(selected.orcado)} />
            <DetailRow
              label="Realizado"
              value={formatBRL(selected.realizado)}
            />
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
