"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import { BoardViews } from "@/components/kanban/BoardViews";
import { useObras } from "@/lib/store/obras-store";
import { formatBRL } from "@/lib/masks/br";
import { notify } from "@/components/app/ModuleToolkit";
import type { ObraStatus } from "@/lib/domain/obras-types";

const COLS = [
  { id: "em_orcamento", label: "Em orçamento" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "paralisada", label: "Paralisada" },
  { id: "finalizada", label: "Finalizada" },
];

export default function QuadroObrasPage() {
  const { state, updateObra } = useObras();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: obras"
        description="Status da obra — mesmos dados de Minhas obras."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/obras">Minhas obras</Link>
          </Button>
        }
      />
      <BoardViews
        storageKey="obras-quadro"
        columns={COLS}
        cards={state.obras.map((w) => ({
          id: w.id,
          columnId: w.status,
          title: w.nome,
          subtitle: `${w.clienteNome} · ${w.fisicoPct}% físico`,
          meta: formatBRL(w.realizado),
          badge: w.codigo,
        }))}
        onMove={(id, to) => {
          updateObra(id, { status: to as ObraStatus });
          notify("Status da obra atualizado");
          return true;
        }}
        onOpen={(id) => {
          window.location.href = `/obras/${id}`;
        }}
      />
    </div>
  );
}
