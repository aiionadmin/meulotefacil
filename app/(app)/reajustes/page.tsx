"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { reajustesMock, operacoesContrato } from "@/lib/data/sistema";

export default function ReajustesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Reajuste e operações sobre o contrato"
        description="Índices, correção anual em lote (com desfazer), resíduos, adiantamento, transferência, renegociação, troca e retomada de lote."
        actions={
          <Button asChild size="sm">
            <Link href="/reajustes">Aplicar reajuste</Link>
          </Button>
        }
      />
      <ModuleSection title="Reajustes">
        <DataTable
          columns={[
            { key: "periodo", label: "Período" },
            { key: "indice", label: "Índice" },
            { key: "fator", label: "Fator" },
            { key: "contratos", label: "Contratos" },
            { key: "status", label: "Status" },
          ]}
          rows={reajustesMock.map((r) => ({
            periodo: r.periodo,
            indice: r.indice,
            fator: r.fator,
            contratos: r.contratos,
            status: <StatusPill tone="ok">{r.status}</StatusPill>,
          }))}
        />
      </ModuleSection>
      <ModuleSection title="Operações">
        <DataTable
          columns={[
            { key: "tipo", label: "Operação" },
            { key: "contrato", label: "Contrato" },
            { key: "quando", label: "Data" },
            { key: "detalhe", label: "Detalhe" },
          ]}
          rows={operacoesContrato.map((o) => ({
            tipo: <span className="font-medium">{o.tipo}</span>,
            contrato: o.contrato,
            quando: o.quando,
            detalhe: o.detalhe,
          }))}
        />
      </ModuleSection>
    </div>
  );
}
