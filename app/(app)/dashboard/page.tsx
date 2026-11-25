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
import { brl } from "@/lib/data/sistema";
import { useDemoStore } from "@/lib/store/demo-store";
import { useFase1 } from "@/lib/store/fase1-store";

export default function DashboardPage() {
  const { state } = useDemoStore();
  const { state: f1, currentUser } = useFase1();
  const abertoCarteira = state.parcelas
    .filter((p) => p.status !== "Paga")
    .reduce((a, p) => a + p.valor + p.encargos, 0);
  const nfeSem = state.fiscal.filter((n) => n.status === "Sem lançamento").length;
  const pessoasAtivas = f1.people.filter((p) => p.status !== "excluido").length;
  const notifUnread = f1.notifications.filter((n) => !n.lida).length;
  const tarefasAbertas = f1.tasks.filter((t) => t.status !== "concluida").length;

  return (
    <div className="space-y-8">
      <ModuleHeader
        title="Painel unificado"
        description={`Olá, ${currentUser?.nome?.split(" ")[0] ?? "equipe"}. Fase 1 (acesso, pessoas, arquivos) ativa · demais módulos em demo até as fases seguintes.`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/cadastros/pessoas">Pessoas</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/tarefas?novo=1">Nova tarefa</Link>
            </Button>
          </>
        }
      />

      <ModuleSection title="Fase 1 — Acesso e cadastros">
        <KpiGrid
          items={[
            {
              label: "Pessoas",
              value: pessoasAtivas,
              hint: `${f1.organization.nomeFantasia}`,
            },
            {
              label: "Usuários",
              value: f1.users.filter((u) => u.status === "ativo").length,
            },
            {
              label: "Notificações",
              value: notifUnread,
              hint: "não lidas",
            },
            {
              label: "Tarefas abertas",
              value: tarefasAbertas,
            },
          ]}
        />
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <DataTable
            columns={[
              { key: "titulo", label: "Notificação" },
              { key: "quando", label: "Quando" },
            ]}
            rows={f1.notifications.slice(0, 4).map((n) => ({
              titulo: (
                <span className={n.lida ? "text-muted-foreground" : "font-medium"}>
                  {n.titulo}
                </span>
              ),
              quando: n.createdAt,
            }))}
          />
          <DataTable
            columns={[
              { key: "titulo", label: "Tarefa" },
              { key: "status", label: "Status" },
              { key: "prazo", label: "Prazo" },
            ]}
            rows={f1.tasks.slice(0, 4).map((t) => ({
              titulo: t.titulo,
              status: (
                <StatusPill
                  tone={
                    t.status === "concluida"
                      ? "ok"
                      : t.status === "em_andamento"
                        ? "info"
                        : "warn"
                  }
                >
                  {t.status.replace("_", " ")}
                </StatusPill>
              ),
              prazo: t.prazo,
            }))}
          />
        </div>
      </ModuleSection>

      <ModuleSection title="Carteira (demo)">
        <KpiGrid
          items={[
            {
              label: "Empreendimentos",
              value: state.empreendimentos.length,
            },
            {
              label: "Lotes (amostra)",
              value: state.lotes.length,
              hint: `${state.lotes.filter((l) => l.status === "Disponível").length} disponíveis`,
            },
            {
              label: "Contratos",
              value: state.contratos.length,
              hint: `${state.contratos.filter((c) => c.status === "Ativo").length} ativos`,
            },
            {
              label: "A receber (amostra)",
              value: brl(abertoCarteira),
              hint: `${state.parcelas.filter((p) => p.status === "Vencida").length} vencidas`,
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
            rows={state.parcelas.slice(0, 6).map((p) => ({
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

        <ModuleSection title="Obras" actionHref="/obras" actionLabel="Ver obras">
          <div className="space-y-3">
            {state.obras.map((o) => (
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
            rows={state.pagar
              .filter((p) => p.status !== "Pago")
              .map((p) => ({
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
                  Compras em aprovação
                </CardTitle>
              </CardHeader>
              <CardContent className="font-display text-2xl">
                {
                  state.compras.filter((c) => c.status.includes("aprovação"))
                    .length
                }
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  NFe sem lançamento
                </CardTitle>
              </CardHeader>
              <CardContent className="font-display text-2xl">
                {nfeSem}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Usuários
                </CardTitle>
              </CardHeader>
              <CardContent className="font-display text-2xl">
                {state.usuarios.length}
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
            rows={state.tarefas.slice(0, 4).map((t) => ({
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
