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
        description="Cards só avançam. Atraso vira selo no card — cobrança fica no quadro próprio. Saídas: Perdido (com motivo)."
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
          const ok = moveLead(cardId, to as JornadaColuna);
          if (!ok) {
            notify(
              "Movimento bloqueado",
              "O card só pode avançar. Voltar exige perfil Administrador com motivo."
            );
          } else {
            notify("Card avançou");
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
                onClick={() => {
                  const idx = JORNADA_COLS.findIndex(
                    (c) => c.id === selected.etapa
                  );
                  const next = JORNADA_COLS[idx + 1];
                  if (!next) {
                    notify("Já está na última etapa");
                    return;
                  }
                  const ok = moveLead(selected.id, next.id);
                  if (ok) {
                    notify("Avançou", next.label);
                    setSelected({ ...selected, etapa: next.id });
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
