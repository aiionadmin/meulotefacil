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
import { useOperacoes } from "@/lib/store/operacoes-store";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { statusLabel } from "@/lib/status/labels";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = state.purchases.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: compras"
        description="Solicitações por status."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/compras">Lista SC/OC</Link>
          </Button>
        }
      />
      <BoardViews
        storageKey="compras"
        columns={COLS}
        cards={state.purchases.map((p) => ({
          id: p.id,
          columnId: p.status,
          title: p.numero,
          subtitle: p.descricao,
          meta: formatBRL(p.valorEstimado),
          badge: p.urgente ? "Urgente" : undefined,
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
        onOpen={setSelectedId}
      />
      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelectedId(null)}
        title={selected?.numero ?? ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Descrição" value={selected.descricao} />
            <DetailRow label="Centro" value={selected.centroCusto} />
            <DetailRow
              label="Necessidade"
              value={formatDateBR(selected.necessidade)}
            />
            <DetailRow
              label="Estimado"
              value={formatBRL(selected.valorEstimado)}
            />
            <DetailRow label="Status" value={statusLabel(selected.status)} />
            <DetailRow
              label="Urgente"
              value={selected.urgente ? "Sim" : "Não"}
            />
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
