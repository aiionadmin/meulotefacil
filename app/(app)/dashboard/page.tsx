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
import { formatBRL } from "@/lib/masks/br";
import { useDemoStore } from "@/lib/store/demo-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { useCarteira } from "@/lib/store/carteira-store";

export default function DashboardPage() {
  const { state } = useDemoStore();
  const { state: f1, currentUser } = useFase1();
  const { state: cart, saldoDevedor } = useCarteira();
  const abertoCarteira = cart.installments
    .filter((p) => p.status !== "paga" && p.status !== "cancelada")
    .reduce(
      (a, p) =>
        a + p.valor + p.juros + p.multa + p.correcao + p.despesaBancaria - p.desconto,
      0
    );
  const nfeSem = state.fiscal.filter((n) => n.status === "Sem lançamento").length;
  const pessoasAtivas = f1.people.filter((p) => p.status !== "excluido").length;
  const notifUnread = f1.notifications.filter((n) => !n.lida).length;
  const tarefasAbertas = f1.tasks.filter((t) => t.status !== "concluida").length;
  const lotesDisp = cart.lots.filter((l) => l.status === "disponivel").length;

  return (
    <div className="space-y-8">
      <ModuleHeader
        title="Painel unificado"
        description={`Olá, ${currentUser?.nome?.split(" ")[0] ?? "equipe"}. Fases 1–4 ativas (acesso, estoque, carteira, boletos).`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/empreendimentos">Lotes</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/contratos">Nova venda</Link>
            </Button>
          </>
        }
      />

      <ModuleSection title="Carteira e estoque (Fases 2–4)">
        <KpiGrid
          items={[
            {
              label: "Empreendimentos",
              value: cart.developments.length,
            },
            {
              label: "Lotes disponíveis",
              value: lotesDisp,
              hint: `${cart.lots.length} no total`,
            },
            {
              label: "Contratos ativos",
              value: cart.contracts.filter((c) => c.status === "ativo").length,
            },
            {
              label: "A receber",
              value: formatBRL(abertoCarteira),
              hint: `caixa ${formatBRL(cart.caixaSaldo)}`,
            },
          ]}
        />
      </ModuleSection>

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

      <ModuleSection title="Saldo por contrato">
        <DataTable
          columns={[
            { key: "numero", label: "Contrato" },
            { key: "cliente", label: "Cliente" },
            { key: "lote", label: "Lote" },
            { key: "saldo", label: "Saldo" },
          ]}
          rows={cart.contracts
            .filter((c) => c.status === "ativo")
            .map((c) => ({
              numero: c.numero,
              cliente: c.compradorNome,
              lote: `${c.quadra}/${c.lote}`,
              saldo: formatBRL(saldoDevedor(c.id)),
            }))}
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
            rows={cart.installments.slice(0, 6).map((p) => ({
              comprador: p.compradorNome,
              n: `${p.tipo} ${p.n}`,
              vencimento: p.vencimento,
              valor: formatBRL(p.valor + p.juros + p.multa),
              status: (
                <StatusPill
                  tone={
                    p.status === "paga"
                      ? "ok"
                      : p.status === "vencida"
                        ? "danger"
                        : "warn"
                  }
                >
                  {p.status.replace("_", " ")}
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
