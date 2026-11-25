"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import { obrasMock, brl } from "@/lib/data/sistema";

export default function ObrasPage() {
  const orcado = obrasMock.reduce((a, o) => a + o.orcado, 0);
  const realizado = obrasMock.reduce((a, o) => a + o.realizado, 0);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Obras, orçamento e custos"
        description="Catálogo de insumos/composições, árvore de orçamento, Gantt, cronograma físico-financeiro, curva S e orçado x realizado."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/obras">Insumos</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/obras">Novo orçamento</Link>
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Obras", value: obrasMock.length },
          { label: "Orçado", value: brl(orcado) },
          { label: "Realizado", value: brl(realizado) },
          { label: "Saldo", value: brl(orcado - realizado) },
        ]}
      />
      <DataTable
        columns={[
          { key: "nome", label: "Obra" },
          { key: "fisico", label: "Evolução física" },
          { key: "orcado", label: "Orçado" },
          { key: "realizado", label: "Realizado" },
          { key: "saldo", label: "Saldo" },
          { key: "status", label: "Status" },
        ]}
        rows={obrasMock.map((o) => ({
          nome: <span className="font-medium">{o.nome}</span>,
          fisico: `${o.fisico}%`,
          orcado: brl(o.orcado),
          realizado: brl(o.realizado),
          saldo: brl(o.saldo),
          status: (
            <StatusPill tone={o.fisico === 100 ? "ok" : "info"}>
              {o.status}
            </StatusPill>
          ),
        }))}
      />
    </div>
  );
}
