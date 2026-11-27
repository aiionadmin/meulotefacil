"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader, StatusPill } from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import { FilterBar } from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useObras } from "@/lib/store/obras-store";
import { BoardViews } from "@/components/kanban/BoardViews";
import type { PropostaStatus } from "@/lib/domain/obras-types";

const FUNIL: { id: PropostaStatus; label: string }[] = [
  { id: "contato_inicial", label: "Contato inicial" },
  { id: "em_elaboracao", label: "Em elaboração" },
  { id: "em_revisao", label: "Em revisão" },
  { id: "enviada", label: "Enviada" },
  { id: "aprovada", label: "Aprovada" },
  { id: "perdida", label: "Perdida" },
];

export default function OrcamentosPage() {
  const { state, totaisDaObra, updateObra } = useObras();
  const [q, setQ] = useState("");
  const [view, setView] = useState<"lista" | "funil">("lista");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.obras;
    return state.obras.filter((o) =>
      [o.codigo, o.nome, o.clienteNome, o.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.obras, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Orçamentos"
        description="Lista e funil por status da obra — custo, BDI e preço."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={view === "lista" ? "default" : "outline"}
              onClick={() => setView("lista")}
            >
              Lista
            </Button>
            <Button
              size="sm"
              variant={view === "funil" ? "default" : "outline"}
              onClick={() => setView("funil")}
            >
              Funil
            </Button>
          </div>
        }
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar obra…" />

      {view === "lista" ? (
        <PaginatedTable
          columns={[
            { key: "cod", label: "Código" },
            { key: "obra", label: "Obra" },
            { key: "cli", label: "Cliente" },
            { key: "stObra", label: "Status obra" },
            { key: "stProp", label: "Status proposta" },
            { key: "custo", label: "Custo" },
            { key: "preco", label: "Preço" },
            { key: "acao", label: "" },
          ]}
          rows={filtered.map((o) => {
            const tot = totaisDaObra(o.id);
            return {
              cod: o.codigo,
              obra: o.nome,
              cli: o.clienteNome,
              stObra: (
                <StatusPill tone="info">
                  {o.status.replace(/_/g, " ")}
                </StatusPill>
              ),
              stProp: (
                <StatusPill tone="warn">
                  {(o.propostaStatus ?? "em_elaboracao").replace(/_/g, " ")}
                </StatusPill>
              ),
              custo: formatBRL(tot.custo || o.orcado),
              preco: formatBRL(tot.preco),
              acao: (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/obras/${o.id}`}>Abrir</Link>
                </Button>
              ),
            };
          })}
        />
      ) : (
        <BoardViews
          storageKey="obras-funil-propostas"
          columns={FUNIL}
          cards={filtered.map((o) => {
            const tot = totaisDaObra(o.id);
            return {
              id: o.id,
              columnId: o.propostaStatus ?? "em_elaboracao",
              title: o.nome,
              subtitle: o.clienteNome,
              badge: formatBRL(tot.preco || o.orcado),
              meta: o.responsavelObra,
            };
          })}
          onMove={(id, to) => {
            updateObra(id, { propostaStatus: to as PropostaStatus });
            return true;
          }}
          onOpen={(id) => {
            window.location.href = `/obras/${id}`;
          }}
        />
      )}

    </div>
  );
}
