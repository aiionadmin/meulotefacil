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
import { formatDateBR } from "@/lib/masks/br";
import { statusLabel } from "@/lib/status/labels";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = state.regularization.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: regularização e escritura"
        description="Processo por lote."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/processos">Processos</Link>
          </Button>
        }
      />
      <BoardViews
        storageKey="regularizacao"
        columns={COLS}
        cards={state.regularization.map((r) => ({
          id: r.id,
          columnId: r.etapa,
          title: r.cliente,
          subtitle: `${r.empNome} · ${r.loteLabel}`,
          meta: r.responsavel,
          badge: r.prazo ? `prazo ${formatDateBR(r.prazo)}` : undefined,
        }))}
        onMove={(cardId) => {
          avancarRegularizacao(cardId);
          notify("Etapa avançada");
          return true;
        }}
        onOpen={setSelectedId}
      />
      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelectedId(null)}
        title={selected?.cliente ?? ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Empreendimento" value={selected.empNome} />
            <DetailRow label="Lote" value={selected.loteLabel} />
            <DetailRow label="Etapa" value={statusLabel(selected.etapa)} />
            <DetailRow label="Responsável" value={selected.responsavel} />
            <DetailRow
              label="Prazo"
              value={selected.prazo ? formatDateBR(selected.prazo) : "—"}
            />
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
