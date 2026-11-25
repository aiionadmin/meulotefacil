"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import { BoardViews } from "@/components/kanban/BoardViews";
import { useOperacoes } from "@/lib/store/operacoes-store";
import { formatBRL } from "@/lib/masks/br";

const COLS = [
  { id: "em orçamento", label: "Em orçamento" },
  { id: "em andamento", label: "Em andamento" },
  { id: "paralisada", label: "Paralisada" },
  { id: "finalizada", label: "Finalizada" },
];

export default function QuadroObrasPage() {
  const { state } = useOperacoes();

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
      />
    </div>
  );
}
