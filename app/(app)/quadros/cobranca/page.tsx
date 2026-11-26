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
import { useFluxo } from "@/lib/store/fluxo-store";
import { useClientCard } from "@/lib/client/client-card-context";
import { formatBRL } from "@/lib/masks/br";
import { faixaAtrasoLabel } from "@/lib/cobranca/faixas";
import type { CollectionCase } from "@/lib/domain/fluxo-types";

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
  const { openClient } = useClientCard();
  const [selected, setSelected] = useState<CollectionCase | null>(null);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: cobrança"
        description="Faixas de atraso, acordo e jurídico."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/cobranca">Lista inadimplentes</Link>
          </Button>
        }
      />
      <BoardViews
        storageKey="cobranca"
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
          notify("Use a lista de cobrança para as demais ações");
          return false;
        }}
        onOpen={(id) => {
          const c = state.collection.find((x) => x.id === id);
          if (c) openClient({ nome: c.cliente, collectionCaseId: c.id, tab: "cobranca" });
          setSelected(state.collection.find((c) => c.id === id) ?? null);
        }}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.cliente ?? ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Contrato" value={selected.contratoNumero} />
            <DetailRow label="Empreendimento" value={selected.empNome} />
            <DetailRow label="Dias" value={String(selected.diasAtraso)} />
            <DetailRow
              label="Valor original"
              value={formatBRL(selected.valorOriginal ?? selected.valorAtualizado)}
            />
            <DetailRow
              label="Valor atualizado"
              value={formatBRL(selected.valorAtualizado)}
            />
            <DetailRow label="Faixa" value={faixaAtrasoLabel(selected.faixa)} />
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
