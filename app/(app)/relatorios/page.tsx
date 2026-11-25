"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  ModuleSection,
} from "@/components/app/ModulePage";
import { FilterBar, notify } from "@/components/app/ModuleToolkit";
import { relatoriosCatalogo } from "@/lib/data/sistema";
import { useDemoStore } from "@/lib/store/demo-store";
import { cn } from "@/lib/utils";

export default function RelatoriosPage() {
  const { state, toggleFavoritoRelatorio, gerarRelatorio } = useDemoStore();
  const [q, setQ] = useState("");

  const catalogo = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return relatoriosCatalogo;
    return relatoriosCatalogo.filter((r) =>
      [r.grupo, r.nome, r.origem].join(" ").toLowerCase().includes(term)
    );
  }, [q]);

  const grupos = [...new Set(catalogo.map((r) => r.grupo))];

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Relatórios"
        description="Central de relatórios com filtros, favoritos e geração PDF/Excel (demo)."
      />
      <KpiGrid
        items={[
          { label: "Catálogo", value: relatoriosCatalogo.length },
          { label: "Favoritos", value: state.favoritosRelatorios.length },
          { label: "Gerados", value: state.relatoriosGerados.length },
          { label: "Grupos", value: grupos.length },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar relatório…" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {grupos.map((grupo) => (
          <Card key={grupo}>
            <CardHeader>
              <CardTitle className="text-base">{grupo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {catalogo
                .filter((r) => r.grupo === grupo)
                .map((r) => {
                  const fav = state.favoritosRelatorios.includes(r.nome);
                  return (
                    <div
                      key={r.nome}
                      className="flex items-center justify-between gap-2 border-b border-linha/50 pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{r.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Origem {r.origem}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="rounded p-1 hover:bg-paper-muted"
                          onClick={() => toggleFavoritoRelatorio(r.nome)}
                          aria-label="Favoritar"
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              fav
                                ? "fill-amber-400 text-amber-500"
                                : "text-muted-foreground"
                            )}
                          />
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            gerarRelatorio(r.nome);
                            notify("Relatório gerado", r.nome);
                          }}
                        >
                          Gerar
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        ))}
      </div>

      <ModuleSection title="Gerados nesta sessão">
        <DataTable
          empty="Nenhum relatório gerado ainda."
          columns={[
            { key: "nome", label: "Relatório" },
            { key: "quando", label: "Quando" },
          ]}
          rows={state.relatoriosGerados.map((r) => ({
            nome: <span className="font-medium">{r.nome}</span>,
            quando: r.quando,
          }))}
        />
      </ModuleSection>
    </div>
  );
}
