"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useFluxo } from "@/lib/store/fluxo-store";
import { notify } from "@/components/app/ModuleToolkit";

const COLS = [
  { id: "documentos", label: "Documentos do cliente" },
  { id: "prefeitura", label: "Prefeitura" },
  { id: "cartorio", label: "Cartório" },
  { id: "registro", label: "Registro" },
  { id: "matricula", label: "Matrícula pronta" },
  { id: "entregue", label: "Entregue" },
];

export default function QuadroRegularizacaoPage() {
  const { state, avancarRegularizacao } = useFluxo();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: regularização e escritura"
        description="Fase 9 — processo por lote."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/processos">Processos</Link>
          </Button>
        }
      />
      <KanbanBoard
        columns={COLS}
        cards={state.regularization.map((r) => ({
          id: r.id,
          columnId: r.etapa,
          title: r.cliente,
          subtitle: `${r.empNome} · ${r.loteLabel}`,
          meta: r.responsavel,
          badge: r.prazo ? `prazo ${r.prazo}` : undefined,
        }))}
        onMove={(cardId) => {
          avancarRegularizacao(cardId);
          notify("Etapa avançada");
          return true;
        }}
      />
    </div>
  );
}
