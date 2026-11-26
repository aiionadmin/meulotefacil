"use client";

import { ModuleHeader, DataTable, StatusPill } from "@/components/app/ModulePage";
import { useCarteira } from "@/lib/store/carteira-store";

export default function PlanosPagamentoPage() {
  const { state } = useCarteira();
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Planos de pagamento"
        description="Cadastro e consulta de planos (entradas, prestações e moedas)."
      />
      <DataTable
        columns={[
          { key: "nome", label: "Nome" },
          { key: "entradas", label: "Entradas" },
          { key: "prestacoes", label: "Prestações" },
          { key: "moeda", label: "Moeda" },
          { key: "series", label: "Séries" },
          { key: "ativo", label: "Ativo" },
        ]}
        rows={state.paymentPlans.map((p) => ({
          nome: p.nome,
          entradas: String(p.entradas),
          prestacoes: String(p.prestacoes),
          moeda: `${p.moedaRef} / resíduo ${p.moedaResiduo}`,
          series: p.series,
          ativo: (
            <StatusPill tone={p.ativo ? "ok" : "neutral"}>
              {p.ativo ? "Sim" : "Não"}
            </StatusPill>
          ),
        }))}
        empty="Nenhum plano cadastrado."
      />
    </div>
  );
}
