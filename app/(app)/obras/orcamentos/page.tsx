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

const FUNIL = [
  { id: "em_orcamento", label: "Em orçamento" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "paralisada", label: "Paralisada" },
  { id: "finalizada", label: "Finalizada" },
];

export default function OrcamentosPage() {
  const { state, totaisDaObra } = useObras();
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
            { key: "st", label: "Status" },
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
              st: (
                <StatusPill tone="info">
                  {o.status.replace(/_/g, " ")}
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
          storageKey="obras-funil"
          columns={FUNIL.map((c) => ({ ...c, droppable: false }))}
          cards={filtered.map((o) => {
            const tot = totaisDaObra(o.id);
            return {
              id: o.id,
              columnId: o.status,
              title: o.nome,
              subtitle: o.clienteNome,
              badge: formatBRL(tot.preco || o.orcado),
              meta: o.responsavelObra,
            };
          })}
          onMove={() => false}
          onOpen={(id) => {
            window.location.href = `/obras/${id}`;
          }}
        />
      )}

    </div>
  );
}
