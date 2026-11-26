"use client";

import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
  KpiGrid,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
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
        description="H12 — previsto, liberado e pago por corretor; liberar e pagar."
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
      <DataTable
        columns={[
          { key: "corretor", label: "Corretor" },
          { key: "venda", label: "Venda" },
          { key: "previsto", label: "Previsto" },
          { key: "liberado", label: "Liberado" },
          { key: "pago", label: "Pago" },
          { key: "status", label: "Status" },
          { key: "acao", label: "" },
        ]}
        rows={state.comissoes.map((c) => ({
          corretor: c.corretorNome,
          venda: c.vendaRef,
          previsto: formatBRL(c.valorPrevisto),
          liberado: formatBRL(c.valorLiberado),
          pago: formatBRL(c.valorPago),
          status: (
            <StatusPill tone={c.status === "paga" ? "ok" : "info"}>
              {statusLabel(c.status)}
            </StatusPill>
          ),
          acao:
            c.status === "paga" ? (
              "—"
            ) : (
              <div className="flex flex-wrap gap-1">
                {c.status === "prevista" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
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
                  onClick={() => {
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
        }))}
        empty="Sem comissões."
      />
    </div>
  );
}
