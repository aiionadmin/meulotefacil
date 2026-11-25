"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useFluxo } from "@/lib/store/fluxo-store";
import { notify } from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";

const COLS = [
  { id: "a_vencer_5", label: "A vencer em 5 dias" },
  { id: "1_30", label: "1 a 30 dias" },
  { id: "31_90", label: "31 a 90 dias" },
  { id: "acordo", label: "Acordo" },
  { id: "juridico", label: "Jurídico" },
  { id: "retomada", label: "Retomada" },
];

export default function QuadroCobrancaPage() {
  const { state, proporAcordo } = useFluxo();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: cobrança"
        description="Fase 9 — faixas de atraso, acordo e jurídico."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/cobranca">Lista inadimplentes</Link>
          </Button>
        }
      />
      <KanbanBoard
        columns={COLS}
        cards={state.collection.map((c) => ({
          id: c.id,
          columnId: c.faixa,
          title: c.cliente,
          subtitle: `CTR ${c.contratoNumero} · ${c.empNome}`,
          badge: `${c.diasAtraso}d`,
          meta: formatBRL(c.valorAtualizado),
        }))}
        onMove={(cardId, to) => {
          if (to === "acordo") {
            proporAcordo(cardId, 0, 3);
            notify("Movido para acordo");
            return true;
          }
          notify("Use a lista para ações de cobrança nesta demo");
          return false;
        }}
      />
    </div>
  );
}
