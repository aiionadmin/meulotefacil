"use client";

import { ModuleHeader, DataTable, StatusPill, KpiGrid } from "@/components/app/ModulePage";
import { useCarteira } from "@/lib/store/carteira-store";
import { formatBRL } from "@/lib/masks/br";
import { statusLabel } from "@/lib/status/labels";

export default function ComissoesPage() {
  const { state } = useCarteira();
  const previsto = state.comissoes.reduce((s, c) => s + c.valorPrevisto, 0);
  const liberado = state.comissoes.reduce((s, c) => s + c.valorLiberado, 0);
  const pago = state.comissoes.reduce((s, c) => s + c.valorPago, 0);
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Comissões"
        description="Previsto, liberado e pago por corretor e venda."
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
        }))}
        empty="Sem comissões."
      />
    </div>
  );
}
