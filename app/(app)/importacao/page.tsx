"use client";

import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useOperacoes } from "@/lib/store/operacoes-store";
import { LOTEWIN_PANEL_2026_11_24 } from "@/lib/domain/operacoes-seed";

export default function ImportacaoPage() {
  const { state, runImportEntity, runImportAllDemo } = useOperacoes();

  const ok = state.importQueue.filter((e) => e.status === "ok").length;
  const parcial = state.importQueue.filter((e) => e.status === "parcial").length;
  const confOk = state.conference.filter((c) => c.actual === c.expected).length;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Importação e conferência"
        description="fila idempotente (legacy_id) e conferência vs painel LoteWin 24/11/2026. Fila de conferência."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                runImportAllDemo();
                notify("Importação demo concluída", "conferência atualizada");
              }}
            >
              Simular importação completa
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Entidades", value: state.importQueue.length },
          { label: "OK", value: ok },
          { label: "Parcial", value: parcial },
          {
            label: "Conferência",
            value: `${confOk}/${state.conference.length}`,
          },
        ]}
      />

      {state.lastImportAt ? (
        <p className="text-xs text-muted-foreground">
          Última simulação: {state.lastImportAt}
        </p>
      ) : null}

      <ModuleSection title="Fila de importação ()">
        <DataTable
          columns={[
            { key: "ordem", label: "#" },
            { key: "entidade", label: "Entidade" },
            { key: "sistema", label: "Origem" },
            { key: "esperado", label: "Esperado" },
            { key: "importado", label: "Importado" },
            { key: "status", label: "Status" },
            { key: "acao", label: "" },
          ]}
          rows={state.importQueue.map((e) => ({
            ordem: e.ordem,
            entidade: e.entidade,
            sistema: e.legacySystem,
            esperado: e.expected.toLocaleString("pt-BR"),
            importado: e.imported.toLocaleString("pt-BR"),
            status: (
              <StatusPill
                tone={
                  e.status === "ok"
                    ? "ok"
                    : e.status === "parcial"
                      ? "warn"
                      : e.status === "divergente"
                        ? "danger"
                        : "neutral"
                }
              >
                {e.status}
              </StatusPill>
            ),
            acao: (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  runImportEntity(e.id);
                  notify(`Importou ${e.entidade}`);
                }}
              >
                Rodar
              </Button>
            ),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Conferência painel LoteWin (24/11/2026)">
        <p className="mb-3 text-sm text-muted-foreground">
          Alvo: {LOTEWIN_PANEL_2026_11_24.empreendimentos} empreendimentos ·{" "}
          {LOTEWIN_PANEL_2026_11_24.lotes.toLocaleString("pt-BR")} lotes · a
          receber {formatBRL(LOTEWIN_PANEL_2026_11_24.aReceber)}.
        </p>
        <DataTable
          columns={[
            { key: "label", label: "Métrica" },
            { key: "esperado", label: "Esperado" },
            { key: "atual", label: "Atual no sistema" },
            { key: "delta", label: "Diferença" },
            { key: "status", label: "Status" },
          ]}
          rows={state.conference.map((c) => {
            const delta = c.actual - c.expected;
            const match = c.actual === c.expected;
            const fmt = (n: number) =>
              c.unit === "money"
                ? formatBRL(n)
                : n.toLocaleString("pt-BR");
            return {
              label: c.label,
              esperado: fmt(c.expected),
              atual: fmt(c.actual),
              delta: fmt(delta),
              status: (
                <StatusPill tone={match ? "ok" : "warn"}>
                  {match ? "bate" : "divergente"}
                </StatusPill>
              ),
            };
          })}
        />
      </ModuleSection>
    </div>
  );
}
