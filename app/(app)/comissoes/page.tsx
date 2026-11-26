"use client";

import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  StatusPill,
  KpiGrid,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { downloadExcel, printList } from "@/lib/export/list-export";
import { useCarteira } from "@/lib/store/carteira-store";
import { formatBRL } from "@/lib/masks/br";
import { statusLabel } from "@/lib/status/labels";

export default function ComissoesPage() {
  const { state, liberarComissao, pagarComissao } = useCarteira();
  const previsto = state.comissoes.reduce((s, c) => s + c.valorPrevisto, 0);
  const liberado = state.comissoes.reduce((s, c) => s + c.valorLiberado, 0);
  const pago = state.comissoes.reduce((s, c) => s + c.valorPago, 0);
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Comissões"
        description="H12 — previsto, liberado e pago; lista com ações em lote (C15)."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadExcel(
                  "comissoes",
                  [
                    "Corretor",
                    "Venda",
                    "Previsto",
                    "Liberado",
                    "Pago",
                    "Status",
                  ],
                  state.comissoes.map((c) => [
                    c.corretorNome,
                    c.vendaRef,
                    c.valorPrevisto,
                    c.valorLiberado,
                    c.valorPago,
                    c.status,
                  ])
                );
                notify("Excel exportado");
              }}
            >
              Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => printList("Comissões")}
            >
              Imprimir
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Previsto", value: formatBRL(previsto) },
          { label: "Liberado", value: formatBRL(liberado) },
          { label: "Pago", value: formatBRL(pago) },
        ]}
      />
      <ProcessList
        storageKey="comissoes"
        exportName="comissoes"
        rows={state.comissoes}
        empty="Sem comissões."
        bulkActions={[
          {
            label: "Liberar seleção",
            onClick: (ids) => {
              let n = 0;
              for (const id of ids) {
                if (liberarComissao(id)) n += 1;
              }
              notify(n ? `${n} liberada(s)` : "Nenhuma prevista");
            },
          },
          {
            label: "Pagar seleção",
            onClick: (ids) => {
              let n = 0;
              for (const id of ids) {
                if (pagarComissao(id)) n += 1;
              }
              notify(n ? `${n} paga(s)` : "Nenhuma pendente");
            },
          },
        ]}
        columns={[
          {
            key: "corretor",
            label: "Corretor",
            filter: { type: "text" },
            getValue: (c) => c.corretorNome,
          },
          {
            key: "venda",
            label: "Venda",
            filter: { type: "text" },
            getValue: (c) => c.vendaRef,
          },
          {
            key: "previsto",
            label: "Previsto",
            filter: { type: "range" },
            getValue: (c) => c.valorPrevisto,
            render: (c) => formatBRL(c.valorPrevisto),
          },
          {
            key: "liberado",
            label: "Liberado",
            filter: { type: "range" },
            getValue: (c) => c.valorLiberado,
            render: (c) => formatBRL(c.valorLiberado),
          },
          {
            key: "pago",
            label: "Pago",
            filter: { type: "range" },
            getValue: (c) => c.valorPago,
            render: (c) => formatBRL(c.valorPago),
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: [
                { value: "prevista", label: "Prevista" },
                { value: "liberada", label: "Liberada" },
                { value: "paga", label: "Paga" },
              ],
            },
            getValue: (c) => c.status,
            render: (c) => (
              <StatusPill tone={c.status === "paga" ? "ok" : "info"}>
                {statusLabel(c.status)}
              </StatusPill>
            ),
          },
          {
            key: "acao",
            label: "",
            getValue: () => "",
            render: (c) =>
              c.status === "paga" ? (
                "—"
              ) : (
                <div className="flex flex-wrap gap-1">
                  {c.status === "prevista" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!liberarComissao(c.id)) {
                          notify("Não foi possível liberar");
                          return;
                        }
                        notify("Comissão liberada", c.corretorNome);
                      }}
                    >
                      Liberar
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!pagarComissao(c.id)) {
                        notify("Não foi possível pagar");
                        return;
                      }
                      notify("Comissão paga", c.corretorNome);
                    }}
                  >
                    Pagar
                  </Button>
                </div>
              ),
          },
        ]}
      />
    </div>
  );
}
