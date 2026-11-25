"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useOperacoes } from "@/lib/store/operacoes-store";
import { notify } from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";

const COLS = [
  { id: "rascunho", label: "Rascunho" },
  { id: "em_aprovacao", label: "Em aprovação" },
  { id: "a_atender", label: "A atender" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluída" },
  { id: "recusada", label: "Recusada" },
];

export default function QuadroComprasPage() {
  const { state, avancarPurchase, aprovarPurchase } = useOperacoes();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: compras"
        description="Fase 7/8 — solicitações por status."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/compras">Lista SC/OC</Link>
          </Button>
        }
      />
      <KanbanBoard
        columns={COLS}
        cards={state.purchases.map((p) => ({
          id: p.id,
          columnId: p.status,
          title: p.numero,
          subtitle: p.descricao,
          meta: formatBRL(p.valorEstimado),
          badge: p.urgente ? "urgente" : undefined,
        }))}
        onMove={(cardId, to) => {
          if (to === "a_atender") {
            aprovarPurchase(cardId);
            notify("Aprovada");
            return true;
          }
          avancarPurchase(cardId);
          notify("Fluxo avançado");
          return true;
        }}
      />
    </div>
  );
}
