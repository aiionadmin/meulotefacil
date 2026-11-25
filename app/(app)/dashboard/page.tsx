"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  sistemaKpis,
  brl,
  parcelasCarteira,
  obrasMock,
  financeiroPagar,
  tarefasMock,
} from "@/lib/data/sistema";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <ModuleHeader
        title="Painel unificado"
        description="Carteira (LoteWin), obras e financeiro (Mais Controle) e regularização fundiária em um só lugar."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/carteira">Abrir carteira</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/vendas">Nova venda</Link>
            </Button>
          </>
        }
      />

      <ModuleSection title="Carteira">
        <KpiGrid
          items={[
            {
              label: "Empreendimentos",
              value: sistemaKpis.empreendimentos,
            },
            {
              label: "Lotes / vendidos",
              value: `${sistemaKpis.lotes.toLocaleString("pt-BR")} / ${sistemaKpis.lotesVendidos.toLocaleString("pt-BR")}`,
            },
            {
              label: "Contratos ativos",
              value: sistemaKpis.contratosAtivos.toLocaleString("pt-BR"),
              hint: `${sistemaKpis.contratosTotal.toLocaleString("pt-BR")} no total`,
            },
            {
              label: "A receber",
              value: brl(sistemaKpis.carteiraReceber),
              hint: `${sistemaKpis.inadimplentes} inadimplentes · ${sistemaKpis.vencimentos30d} venc. 30d`,
            },
          ]}
        />
      </ModuleSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <ModuleSection
          title="Últimos / próximos vencimentos"
          actionHref="/carteira"
          actionLabel="Ver carteira"
        >
          <DataTable
            columns={[
              { key: "comprador", label: "Comprador" },
              { key: "n", label: "Parcela" },
              { key: "vencimento", label: "Vencimento" },
              { key: "valor", label: "Valor" },
              { key: "status", label: "Status" },
            ]}
            rows={parcelasCarteira.map((p) => ({
              comprador: p.comprador,
              n: p.n,
              vencimento: p.vencimento,
              valor: brl(p.valor + p.encargos),
              status: (
                <StatusPill
                  tone={
                    p.status === "Paga"
                      ? "ok"
                      : p.status === "Vencida"
                        ? "danger"
                        : "warn"
                  }
                >
                  {p.status}
                </StatusPill>
              ),
            }))}
          />
        </ModuleSection>

        <ModuleSection
          title="Obras"
          actionHref="/obras"
          actionLabel="Ver obras"
        >
          <div className="space-y-3">
            {obrasMock.map((o) => (
              <Card key={o.id}>
                <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-ink">{o.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      Orçado {brl(o.orcado)} · Realizado {brl(o.realizado)} ·
                      Saldo {brl(o.saldo)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill tone={o.fisico === 100 ? "ok" : "info"}>
                      {o.status}
                    </StatusPill>
                    <span className="font-display text-lg text-ink">
                      {o.fisico}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ModuleSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ModuleSection
          title="Pagamentos em aberto"
          actionHref="/financeiro"
          actionLabel="Abrir financeiro"
        >
          <DataTable
            columns={[
              { key: "favorecido", label: "Favorecido" },
              { key: "vencimento", label: "Vencimento" },
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

        <ModuleSection title="Alertas e tarefas">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Pré-lançamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="font-display text-2xl">
                {sistemaKpis.preLancamentos}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  NFe sem lançamento
                </CardTitle>
              </CardHeader>
              <CardContent className="font-display text-2xl">
                {sistemaKpis.nfeSemLancamento}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Usuários
                </CardTitle>
              </CardHeader>
              <CardContent className="font-display text-2xl">
                {sistemaKpis.usuarios}
              </CardContent>
            </Card>
          </div>
          <DataTable
            columns={[
              { key: "titulo", label: "Tarefa" },
              { key: "responsavel", label: "Responsável" },
              { key: "prazo", label: "Prazo" },
              { key: "status", label: "Status" },
            ]}
            rows={tarefasMock.slice(0, 4).map((t) => ({
              titulo: t.titulo,
              responsavel: t.responsavel,
              prazo: t.prazo,
              status: <StatusPill tone="info">{t.status}</StatusPill>,
            }))}
          />
        </ModuleSection>
      </div>
    </div>
  );
}
