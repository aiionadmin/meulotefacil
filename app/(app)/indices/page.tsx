"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import { ProcessList } from "@/components/app/ProcessList";
import { useCarteira } from "@/lib/store/carteira-store";
import { useSystemSettings } from "@/lib/store/system-settings-store";

export default function IndicesPage() {
  const { state } = useCarteira();
  const { indicePadrao } = useSystemSettings();
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Índices e cotações"
        description={`Padrão do sistema: ${indicePadrao}. Cotações por competência (C14/C16).`}
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/configuracoes/indices">Configurar índices</Link>
          </Button>
        }
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
