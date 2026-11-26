"use client";

import { ModuleHeader, StatusPill } from "@/components/app/ModulePage";
import { ProcessList } from "@/components/app/ProcessList";
import { useCarteira } from "@/lib/store/carteira-store";

export default function PlanosPagamentoPage() {
  const { state } = useCarteira();
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Planos de pagamento"
        description="Cadastro e consulta de planos — lista filtrável (C14/C16)."
      />
      <ProcessList
        storageKey="planos-pagamento"
        exportName="planos-pagamento"
        rows={state.paymentPlans}
        empty="Nenhum plano cadastrado."
        columns={[
          {
            key: "nome",
            label: "Nome",
            filter: { type: "text" },
            getValue: (p) => p.nome,
          },
          {
            key: "entradas",
            label: "Entradas",
            filter: { type: "range" },
            getValue: (p) => p.entradas,
          },
          {
            key: "prestacoes",
            label: "Prestações",
            filter: { type: "range" },
            getValue: (p) => p.prestacoes,
          },
          {
            key: "moeda",
            label: "Moeda",
            filter: { type: "text" },
            getValue: (p) => `${p.moedaRef} / resíduo ${p.moedaResiduo}`,
          },
          {
            key: "series",
            label: "Séries",
            filter: { type: "text" },
            getValue: (p) => p.series,
          },
          {
            key: "ativo",
            label: "Ativo",
            filter: {
              type: "status",
              options: [
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ],
            },
            getValue: (p) => (p.ativo ? "sim" : "nao"),
            render: (p) => (
              <StatusPill tone={p.ativo ? "ok" : "neutral"}>
                {p.ativo ? "Sim" : "Não"}
              </StatusPill>
            ),
          },
        ]}
      />
    </div>
  );
}
