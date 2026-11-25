"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { FilterBar, notify } from "@/components/app/ModuleToolkit";
import { useFluxo } from "@/lib/store/fluxo-store";
import { cn } from "@/lib/utils";

export default function RelatoriosPage() {
  const { state, toggleReportFavorite, runReport } = useFluxo();
  const [q, setQ] = useState("");
  const [grupo, setGrupo] = useState("todos");

  const grupos = useMemo(
    () => ["todos", ...new Set(state.reports.map((r) => r.grupo))],
    [state.reports]
  );

  const filtered = useMemo(() => {
    let list = state.reports;
    if (grupo !== "todos") list = list.filter((r) => r.grupo === grupo);
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((r) =>
        [r.grupo, r.nome].join(" ").toLowerCase().includes(term)
      );
    }
    return list;
  }, [state.reports, q, grupo]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Central de relatórios"
        description="favoritos, execução em tela e histórico recente."
      />

      <KpiGrid
        items={[
          { label: "Relatórios", value: state.reports.length },
          {
            label: "Favoritos",
            value: state.reports.filter((r) => r.favorito).length,
          },
          { label: "Executados", value: state.reportRuns.length },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar relatório…">
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={grupo}
          onChange={(e) => setGrupo(e.target.value)}
        >
          {grupos.map((g) => (
            <option key={g} value={g}>
              {g === "todos" ? "Todos os grupos" : g}
            </option>
          ))}
        </select>
      </FilterBar>

      <DataTable
        columns={[
          { key: "fav", label: "" },
          { key: "grupo", label: "Grupo" },
          { key: "nome", label: "Relatório" },
          { key: "acao", label: "" },
        ]}
        rows={filtered.map((r) => ({
          fav: (
            <button
              type="button"
              aria-label="Favorito"
              onClick={() => toggleReportFavorite(r.id)}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  r.favorito
                    ? "fill-brand-orange text-brand-orange"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ),
          grupo: r.grupo,
          nome: r.nome,
          acao: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                runReport(r.id);
                notify("Relatório gerado", r.nome);
              }}
            >
              Executar
            </Button>
          ),
        }))}
      />

      <ModuleSection title="Últimas execuções">
        <DataTable
          columns={[
            { key: "nome", label: "Relatório" },
            { key: "quando", label: "Quando" },
            { key: "saida", label: "Saída" },
          ]}
          rows={state.reportRuns.map((r) => ({
            nome: r.nome,
            quando: r.quando,
            saida: <StatusPill tone="ok">tela</StatusPill>,
          }))}
        />
      </ModuleSection>
    </div>
  );
}
