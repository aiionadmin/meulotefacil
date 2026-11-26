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

const ORDER = COLS.map((c) => c.id);

export default function QuadroRegularizacaoPage() {
  const { state, avancarRegularizacao } = useFluxo();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = state.regularization.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: regularização e escritura"
        description="Só avança (C06/C22). Arraste para trás é bloqueado."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/processos">Processos</Link>
          </Button>
        }
      />
      <BoardViews
        storageKey="regularizacao"
        columns={COLS}
        cards={state.regularization
          .filter((r) => r.etapa !== "cancelado" && r.etapa !== "distrato")
          .map((r) => ({
            id: r.id,
            columnId: r.etapa,
            title: r.cliente,
            subtitle: `${r.empNome} · ${r.loteLabel}`,
            meta: r.responsavel,
            badge: r.prazo ? `prazo ${formatDateBR(r.prazo)}` : undefined,
          }))}
        onMove={(cardId, to) => {
          const current = state.regularization.find((r) => r.id === cardId);
          if (!current) return false;
          const from = ORDER.indexOf(current.etapa);
          const dest = ORDER.indexOf(to);
          if (dest < 0 || dest <= from) {
            notify("Bloqueado", "Regularização só avança");
            return false;
          }
          const ok = avancarRegularizacao(cardId, to);
          if (ok) notify("Etapa avançada");
          else notify("Não foi possível avançar");
          return ok;
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
            <Button
              size="sm"
              className="mt-3"
              onClick={() => {
                const ok = avancarRegularizacao(selected.id);
                if (ok) notify("Etapa avançada");
                else notify("Já na última etapa");
              }}
            >
              Avançar
            </Button>
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
