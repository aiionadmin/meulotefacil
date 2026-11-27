"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import { BoardViews } from "@/components/kanban/BoardViews";
import { useCompras } from "@/lib/store/compras-store";
import { notify } from "@/components/app/ModuleToolkit";

const COLS = [
  { id: "rascunho", label: "Rascunho" },
  { id: "em_aprovacao", label: "Em aprovação" },
  { id: "a_atender", label: "A atender" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluída" },
  { id: "recusada", label: "Recusada" },
];

export default function QuadroComprasPage() {
  const { state, enviarSolicitacao, aprovarSolicitacao } = useCompras();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: compras"
        description="Parte 3 — solicitações por status (SC → Cotação → OC)."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/compras/solicitacoes">Lista SC</Link>
          </Button>
        }
      />
      <BoardViews
        storageKey="compras"
        columns={COLS}
        cards={state.solicitacoes.map((p) => ({
          id: p.id,
          columnId: p.status,
          title: p.numero,
          subtitle: p.descricao,
          meta: p.centro.label,
          badge: p.urgente ? "urgente" : undefined,
        }))}
        onMove={(cardId, to) => {
          if (to === "em_aprovacao") {
            if (!enviarSolicitacao(cardId)) {
              notify("Só rascunho com centro pode ir para aprovação");
              return false;
            }
            notify("Enviada");
            return true;
          }
          if (to === "a_atender") {
            if (!aprovarSolicitacao(cardId)) {
              notify("Só em aprovação pode ser aprovada");
              return false;
            }
            notify("Aprovada");
            return true;
          }
          notify("Use a lista SC para demais transições");
          return false;
        }}
      />
    </div>
  );
}
