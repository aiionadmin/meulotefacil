"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader, StatusPill } from "@/components/app/ModulePage";
import { useCarteira } from "@/lib/store/carteira-store";
import type { JourneyCard } from "@/lib/domain/carteira-types";

const COLS: { id: JourneyCard["coluna"]; label: string }[] = [
  { id: "novo_contato", label: "Novo contato" },
  { id: "em_atendimento", label: "Em atendimento" },
  { id: "proposta_reserva", label: "Proposta e reserva" },
  { id: "contrato", label: "Contrato" },
  { id: "carteira_em_dia", label: "Carteira em dia" },
  { id: "cobranca", label: "Cobrança" },
  { id: "escritura", label: "Escritura" },
  { id: "quitado", label: "Quitado" },
  { id: "retomado", label: "Retomado" },
];

export default function JornadaPage() {
  const { state } = useCarteira();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Jornada do cliente"
        description="Cards nascem na Fase 3 com o contrato; Kanban completo (dnd) entra na Fase 8."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/contratos">Ver contratos</Link>
          </Button>
        }
      />

      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLS.map((col) => {
          const cards = state.cards.filter((c) => c.coluna === col.id);
          return (
            <div
              key={col.id}
              className="w-56 shrink-0 rounded-sm border border-border bg-card/60 p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {col.label}
                </p>
                <StatusPill tone="neutral">{cards.length}</StatusPill>
              </div>
              <div className="space-y-2">
                {cards.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-sm border border-border bg-background p-2.5 text-sm"
                  >
                    <p className="font-medium">{c.pessoaNome}</p>
                    <p className="text-xs text-muted-foreground">{c.empNome}</p>
                    {c.contractId ? (
                      <Link
                        href={`/carteira?contrato=${c.contractId}`}
                        className="mt-1 inline-block text-xs text-brand-orange hover:underline"
                      >
                        Abrir ficha
                      </Link>
                    ) : null}
                  </div>
                ))}
                {!cards.length ? (
                  <p className="text-xs text-muted-foreground">Vazio</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
