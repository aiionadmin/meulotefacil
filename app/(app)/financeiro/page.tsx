"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  financeiroPagar,
  financeiroReceber,
  contasBancarias,
  brl,
  sistemaKpis,
} from "@/lib/data/sistema";

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Financeiro"
        description="Contas a pagar e receber, apropriação por centro de custo, conciliação OFX, transferências, fluxo de caixa e DRE. Parcelas de lote geram o recebível."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/financeiro">Novo pagamento</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/financeiro">Novo recebimento</Link>
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Pagamentos abertos", value: sistemaKpis.pagamentosAbertos },
          { label: "Recebimentos abertos", value: sistemaKpis.recebimentosAbertos },
          { label: "Pré-lançamentos", value: sistemaKpis.preLancamentos },
          {
            label: "Saldo contas (amostra)",
            value: brl(contasBancarias.reduce((a, c) => a + c.saldo, 0)),
          },
        ]}
      />
      <ModuleSection title="Contas bancárias e caixa">
        <DataTable
          columns={[
            { key: "nome", label: "Conta" },
            { key: "banco", label: "Banco" },
            { key: "agencia", label: "Agência" },
            { key: "tipo", label: "Tipo" },
            { key: "saldo", label: "Saldo" },
          ]}
          rows={contasBancarias.map((c) => ({
            nome: <span className="font-medium">{c.nome}</span>,
            banco: c.banco,
            agencia: c.agencia,
            tipo: c.tipo,
            saldo: brl(c.saldo),
          }))}
        />
      </ModuleSection>
      <div className="grid gap-6 xl:grid-cols-2">
        <ModuleSection title="Contas a pagar">
          <DataTable
            columns={[
              { key: "favorecido", label: "Favorecido" },
              { key: "vencimento", label: "Venc." },
              { key: "valor", label: "Valor" },
              { key: "status", label: "Status" },
            ]}
            rows={financeiroPagar.map((p) => ({
              favorecido: p.favorecido,
              vencimento: p.vencimento,
              valor: brl(p.valor),
              status: (
                <StatusPill tone={p.status === "Vencido" ? "danger" : "warn"}>
                  {p.status}
                </StatusPill>
              ),
            }))}
          />
        </ModuleSection>
        <ModuleSection title="Contas a receber">
          <DataTable
            columns={[
              { key: "origem", label: "Origem" },
              { key: "cliente", label: "Cliente" },
              { key: "vencimento", label: "Venc." },
              { key: "valor", label: "Valor" },
            ]}
            rows={financeiroReceber.map((r) => ({
              origem: r.origem,
              cliente: r.cliente,
              vencimento: r.vencimento,
              valor: brl(r.valor),
            }))}
          />
        </ModuleSection>
      </div>
    </div>
  );
}
