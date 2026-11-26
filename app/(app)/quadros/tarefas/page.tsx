"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import { BoardViews } from "@/components/kanban/BoardViews";
import {
  DetailRow,
  DetailSheet,
  notify,
} from "@/components/app/ModuleToolkit";
import { useFase1 } from "@/lib/store/fase1-store";
import { statusLabel } from "@/lib/status/labels";

const COLS = [
  { id: "a_fazer", label: "A fazer" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluída" },
];

export default function QuadroTarefasPage() {
  const { state, moveTask } = useFase1();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = state.tasks.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: tarefas"
        description="Mesmas tarefas do menu Início, em colunas."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/tarefas">Minhas tarefas</Link>
          </Button>
        }
      />
      <BoardViews
        storageKey="tarefas"
        columns={COLS}
        cards={state.tasks.map((t) => ({
          id: t.id,
          columnId: t.status,
          title: t.titulo,
          subtitle: t.responsavelNome,
          badge: statusLabel(t.prioridade),
          meta: t.prazo,
        }))}
        onMove={(cardId, to) => {
          moveTask(cardId, to as "a_fazer" | "em_andamento" | "concluida");
          notify("Tarefa movida");
          return true;
        }}
        onOpen={setSelectedId}
      />
      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelectedId(null)}
        title={selected?.titulo ?? ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Status" value={statusLabel(selected.status)} />
            <DetailRow
              label="Prioridade"
              value={statusLabel(selected.prioridade)}
            />
            <DetailRow
              label="Responsável"
              value={selected.responsavelNome ?? "—"}
            />
            <DetailRow label="Prazo" value={selected.prazo ?? "—"} />
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
