"use client";

import { ModuleHeader, DataTable } from "@/components/app/ModulePage";
import { useCarteira } from "@/lib/store/carteira-store";

export default function IndicesPage() {
  const { state } = useCarteira();
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Índices e cotações"
        description="Moedas de referência por competência para reajuste e resíduos."
      />
      <DataTable
        columns={[
          { key: "indice", label: "Índice" },
          { key: "comp", label: "Competência" },
          { key: "fator", label: "Fator" },
        ]}
        rows={state.indices.map((i) => ({
          indice: i.indice,
          comp: i.competencia,
          fator: i.fator.toFixed(4),
        }))}
        empty="Sem cotações."
      />
    </div>
  );
}
