"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { comprasMock } from "@/lib/data/sistema";

const fluxo = [
  "1. Solicitação",
  "2. Cotação",
  "3. Ordem de compra",
  "4. Lançamento financeiro",
];

export default function ComprasPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Compras"
        description="Fluxo Solicitação → Cotação → Ordem → Financeiro, com alçada, mapa comparativo, WhatsApp e vínculo ao orçamento."
        actions={
          <Button asChild size="sm">
            <Link href="/compras">Nova solicitação</Link>
          </Button>
        }
      />
      <ModuleSection title="Fluxo">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {fluxo.map((f) => (
            <Card key={f}>
              <CardContent className="py-4 text-sm font-medium">{f}</CardContent>
            </Card>
          ))}
        </div>
      </ModuleSection>
      <DataTable
        columns={[
          { key: "id", label: "Código" },
          { key: "tipo", label: "Tipo" },
          { key: "centro", label: "Centro de custo" },
          { key: "itens", label: "Itens" },
          { key: "urgencia", label: "Urgência" },
          { key: "status", label: "Status" },
        ]}
        rows={comprasMock.map((c) => ({
          id: <span className="font-medium">{c.id}</span>,
          tipo: c.tipo,
          centro: c.centro,
          itens: c.itens,
          urgencia: c.urgencia,
          status: (
            <StatusPill
              tone={
                c.status.includes("Aprov")
                  ? "ok"
                  : c.status.includes("parcial")
                    ? "warn"
                    : "info"
              }
            >
              {c.status}
            </StatusPill>
          ),
        }))}
      />
    </div>
  );
}
