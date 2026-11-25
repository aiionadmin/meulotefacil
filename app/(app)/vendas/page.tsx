"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { contratosMock, brl, sistemaKpis } from "@/lib/data/sistema";

const etapas = [
  "1. Selecionar lotes",
  "2. Comprador e promitentes",
  "3. Adicionais e recados",
  "4. Dados do lote",
  "5. Cópia de plano",
  "6. Plano de pagamento",
  "7. Comissão e finalização",
];

export default function VendasPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Vendas e contratos"
        description="Assistente em 7 etapas, planos em séries, reajuste, comissões, funil kanban e impressão por modelo."
        actions={
          <Button asChild size="sm">
            <Link href="/vendas">Iniciar venda</Link>
          </Button>
        }
      />
      <KpiGrid
        items={[
          {
            label: "Contratos",
            value: sistemaKpis.contratosTotal.toLocaleString("pt-BR"),
          },
          {
            label: "Ativos",
            value: sistemaKpis.contratosAtivos.toLocaleString("pt-BR"),
          },
          { label: "Compradores", value: sistemaKpis.compradores.toLocaleString("pt-BR") },
          { label: "Na amostra", value: contratosMock.length },
        ]}
      />
      <ModuleSection title="Assistente de venda">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {etapas.map((e) => (
            <Card key={e}>
              <CardContent className="py-4 text-sm font-medium text-ink">
                {e}
              </CardContent>
            </Card>
          ))}
        </div>
      </ModuleSection>
      <ModuleSection title="Contratos">
        <DataTable
          columns={[
            { key: "id", label: "Contrato" },
            { key: "comprador", label: "Comprador" },
            { key: "lote", label: "Lote" },
            { key: "valor", label: "Valor" },
            { key: "parcelas", label: "Parcelas" },
            { key: "saldo", label: "Saldo" },
            { key: "corretor", label: "Corretor" },
            { key: "status", label: "Status" },
          ]}
          rows={contratosMock.map((c) => ({
            id: <span className="font-medium">{c.id}</span>,
            comprador: c.comprador,
            lote: c.lote,
            valor: brl(c.valor),
            parcelas: c.parcelas,
            saldo: brl(c.saldo),
            corretor: c.corretor,
            status: (
              <StatusPill
                tone={
                  c.status === "Ativo" || c.status === "Quitado"
                    ? "ok"
                    : c.status === "Renegociado"
                      ? "warn"
                      : "info"
                }
              >
                {c.status}
              </StatusPill>
            ),
          }))}
        />
      </ModuleSection>
    </div>
  );
}
