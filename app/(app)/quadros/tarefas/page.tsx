"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useFase1 } from "@/lib/store/fase1-store";
import { notify } from "@/components/app/ModuleToolkit";

const COLS = [
  { id: "a_fazer", label: "A fazer" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluída" },
];

export default function QuadroTarefasPage() {
  const { state, moveTask } = useFase1();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: tarefas"
        description="Mesmas tarefas do menu Início, em colunas."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/tarefas">Lista / kanban clássico</Link>
          </Button>
        }
      />
      <KanbanBoard
        columns={COLS}
        cards={state.tasks.map((t) => ({
          id: t.id,
          columnId: t.status,
          title: t.titulo,
          subtitle: t.responsavelNome,
          badge: t.prioridade,
          meta: t.prazo,
        }))}
        onMove={(cardId, to) => {
          moveTask(cardId, to as "a_fazer" | "em_andamento" | "concluida");
          notify("Tarefa movida");
          return true;
        }}
      />
    </div>
  );
}
