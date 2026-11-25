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
import { BoardViews } from "@/components/kanban/BoardViews";
import { neighborStep } from "@/lib/domain/kanban-forward";
import { JORNADA_COLS } from "@/lib/domain/fluxo-seed";
import { useFluxo } from "@/lib/store/fluxo-store";
import type { JornadaColuna, Lead } from "@/lib/domain/fluxo-types";

export default function JornadaPage() {
  const { state, moveLead, marcarPerdido } = useFluxo();
  const [selected, setSelected] = useState<Lead | null>(null);

  const columns = JORNADA_COLS.map((c) => ({
    id: c.id,
    label: c.label,
    droppable: true,
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
          badge: l.temperatura
            ? `${l.temperatura}${l.score != null ? ` · ${l.score}` : ""}`
            : l.origem,
          badges: l.badges,
          meta: l.responsavel,
        })),
    [state.leads]
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Jornada do cliente"
        description="Arraste para avançar ou voltar de etapa. Atraso vira selo no card — cobrança fica no quadro próprio. Saídas: Perdido (com motivo)."
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

      <BoardViews
        storageKey="jornada"
        columns={columns}
        cards={cards}
        onMove={(cardId, to) => {
          const lead = state.leads.find((l) => l.id === cardId);
          const ok = moveLead(cardId, to as JornadaColuna);
          if (!ok) {
            notify("Movimento bloqueado", "Coluna inválida para este card.");
          } else {
            const deIdx = JORNADA_COLS.findIndex((c) => c.id === lead?.etapa);
            const paraIdx = JORNADA_COLS.findIndex((c) => c.id === to);
            notify(
              paraIdx < deIdx ? "Card voltou" : "Card avançou",
              JORNADA_COLS.find((c) => c.id === to)?.label
            );
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
            <DetailRow
              label="Empreendimento"
              value={selected.empInteresse ?? "—"}
            />
            <DetailRow
              label="Score"
              value={
                selected.score != null
                  ? `${selected.score} · ${selected.temperatura ?? "—"}`
                  : "—"
              }
            />
            <DetailRow label="Etapa" value={selected.etapa} />
            <DetailRow label="Responsável" value={selected.responsavel} />
            {selected.badges?.length ? (
              <DetailRow label="Selos" value={selected.badges.join(", ")} />
            ) : null}
            <div className="flex flex-wrap gap-2 pt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const prev = neighborStep(
                    JORNADA_COLS.map((c) => c.id),
                    selected.etapa,
                    "voltar"
                  );
                  if (!prev) {
                    notify("Já está na primeira etapa");
                    return;
                  }
                  const ok = moveLead(selected.id, prev as JornadaColuna);
                  if (ok) {
                    const label =
                      JORNADA_COLS.find((c) => c.id === prev)?.label ?? prev;
                    notify("Voltou", label);
                    setSelected({
                      ...selected,
                      etapa: prev as JornadaColuna,
                    });
                  } else notify("Movimento bloqueado");
                }}
              >
                Voltar etapa
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const next = neighborStep(
                    JORNADA_COLS.map((c) => c.id),
                    selected.etapa,
                    "avancar"
                  );
                  if (!next) {
                    notify("Já está na última etapa");
                    return;
                  }
                  const ok = moveLead(selected.id, next as JornadaColuna);
                  if (ok) {
                    const label =
                      JORNADA_COLS.find((c) => c.id === next)?.label ?? next;
                    notify("Avançou", label);
                    setSelected({
                      ...selected,
                      etapa: next as JornadaColuna,
                    });
                  } else notify("Movimento bloqueado");
                }}
              >
                Avançar etapa
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const motivo = window.prompt("Motivo da perda *");
                  if (!motivo?.trim()) {
                    notify("Motivo obrigatório");
                    return;
                  }
                  marcarPerdido(selected.id, motivo.trim());
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
