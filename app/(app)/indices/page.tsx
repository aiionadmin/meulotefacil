"use client";

import { ModuleHeader } from "@/components/app/ModulePage";
import { ProcessList } from "@/components/app/ProcessList";
import { useCarteira } from "@/lib/store/carteira-store";

export default function IndicesPage() {
  const { state } = useCarteira();
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Índices e cotações"
        description="Moedas de referência por competência — lista filtrável (C14/C16)."
      />
      <ProcessList
        storageKey="indices"
        exportName="indices"
        rows={state.indices}
        empty="Sem cotações."
        columns={[
          {
            key: "indice",
            label: "Índice",
            filter: { type: "text" },
            getValue: (i) => i.indice,
          },
          {
            key: "comp",
            label: "Competência",
            filter: { type: "period" },
            getValue: (i) => i.competencia,
          },
          {
            key: "fator",
            label: "Fator",
            filter: { type: "range" },
            getValue: (i) => i.fator,
            render: (i) => i.fator.toFixed(4),
          },
        ]}
      />
    </div>
  );
}
