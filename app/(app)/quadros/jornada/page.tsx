"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  notify,
} from "@/components/app/ModuleToolkit";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { JORNADA_COLS } from "@/lib/domain/fluxo-seed";
import { useFluxo } from "@/lib/store/fluxo-store";
import type { JornadaColuna, Lead } from "@/lib/domain/fluxo-types";

export default function JornadaPage() {
  const { state, moveLead, marcarPerdido } = useFluxo();
  const [selected, setSelected] = useState<Lead | null>(null);

  const columns = JORNADA_COLS.map((c) => ({
    id: c.id,
    label: c.label,
    droppable: c.manual,
  }));

  const cards = useMemo(
    () =>
      state.leads
        .filter((l) => l.etapa !== "perdido" && l.etapa !== "retomado")
        .map((l) => ({
          id: l.id,
          columnId: l.etapa,
          title: l.nome,
          subtitle: l.empInteresse,
          badge: l.origem,
          meta: l.responsavel,
        })),
    [state.leads]
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Jornada do cliente"
        description="Fase 8 — arrastar só nas colunas 1–2 (e Perdido). Demais etapas mudam por evento do sistema."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/leads">Leads</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/vendas">Propostas</Link>
            </Button>
          </>
        }
      />

      <KanbanBoard
        columns={columns}
        cards={cards}
        onMove={(cardId, to) => {
          const ok = moveLead(cardId, to as JornadaColuna);
          if (!ok) {
            notify(
              "Movimento bloqueado",
              "Só colunas Novo contato e Em atendimento aceitam arraste manual"
            );
          } else {
            notify("Card movido");
          }
          return ok;
        }}
        onOpen={(id) => {
          const lead = state.leads.find((l) => l.id === id) ?? null;
          setSelected(lead);
        }}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.nome ?? ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Telefone" value={selected.telefone} />
            <DetailRow label="Origem" value={selected.origem} />
            <DetailRow label="Empreendimento" value={selected.empInteresse ?? "—"} />
            <DetailRow label="Etapa" value={selected.etapa} />
            <DetailRow label="Responsável" value={selected.responsavel} />
            <div className="flex flex-wrap gap-2 pt-3">
              {selected.etapa === "novo_contato" ||
              selected.etapa === "em_atendimento" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    moveLead(selected.id, "em_atendimento");
                    notify("Em atendimento");
                    setSelected(null);
                  }}
                >
                  Responder
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  marcarPerdido(selected.id, "Sem interesse");
                  notify("Marcado como perdido");
                  setSelected(null);
                }}
              >
                Perdido
              </Button>
            </div>
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
