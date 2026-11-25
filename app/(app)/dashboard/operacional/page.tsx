"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  ModuleSection,
} from "@/components/app/ModulePage";
import { formatBRL } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { useObras } from "@/lib/store/obras-store";
import { useCompras } from "@/lib/store/compras-store";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import { useParte5 } from "@/lib/store/parte5-store";
import { useFluxo } from "@/lib/store/fluxo-store";

function daysFromToday(iso: string) {
  const t = new Date(iso + "T12:00:00").getTime();
  const n = new Date();
  n.setHours(12, 0, 0, 0);
  return Math.round((t - n.getTime()) / 86400000);
}

export default function DashboardOperacionalPage() {
  const { state: cart } = useCarteira();
  const { state: f1 } = useFase1();
  const { state: obras } = useObras();
  const { state: compras } = useCompras();
  const { state: fin } = useFinanceiro();
  const { state: p5 } = useParte5();
  const { state: fluxo } = useFluxo();

  const lotesPorStatus = cart.lots.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  const contratosAtivos = cart.contracts.filter(
    (c) => c.status === "ativo"
  ).length;

  const aReceber = fin.recebimentos
    .filter((r) => r.status !== "recebido")
    .reduce((a, r) => a + (r.valor - r.valorRecebido), 0);

  const venc7 = fin.recebimentos.filter(
    (r) =>
      r.status !== "recebido" &&
      daysFromToday(r.vencimento) >= 0 &&
      daysFromToday(r.vencimento) <= 7
  ).length;
  const venc30 = fin.recebimentos.filter(
    (r) =>
      r.status !== "recebido" &&
      daysFromToday(r.vencimento) >= 0 &&
      daysFromToday(r.vencimento) <= 30
  ).length;

  const inad = fin.recebimentos.filter((r) => r.status === "vencido");
  const demandasAbertas = p5.demandas.filter(
    (d) => d.status !== "concluida" && d.status !== "cancelada"
  ).length;

  const pagarFaixas = {
    vencidos: fin.pagamentos.filter((p) => p.status === "vencido").length,
    aberto: fin.pagamentos.filter(
      (p) => p.status === "em_aberto" || p.status === "parcial"
    ).length,
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Dashboard · Números gerais"
        description="Operacional — cada número abre a lista de origem com o filtro correspondente."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/gerencial">Gerencial</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard">Painel legado</Link>
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          {
            label: "Empreendimentos",
            value: cart.developments.length,
            href: "/empreendimentos",
          },
          {
            label: "Clientes ativos",
            value: f1.people.filter(
              (p) => p.papeis.includes("cliente") && p.status !== "excluido"
            ).length,
            href: "/cadastros/clientes",
          },
          {
            label: "Contratos ativos",
            value: contratosAtivos,
            href: "/contratos",
          },
          {
            label: "Demandas abertas",
            value: demandasAbertas,
            href: "/demandas?status=aberta",
          },
        ]}
      />

      <ModuleSection title="Lotes por situação">
        <div className="flex flex-wrap gap-3 text-sm">
          {Object.entries(lotesPorStatus).map(([st, n]) => (
            <Link
              key={st}
              href={`/empreendimentos?status=${st}`}
              className="rounded-md bg-muted px-3 py-2 hover:text-brand-orange"
            >
              {st.replace(/_/g, " ")}: <strong>{n}</strong>
            </Link>
          ))}
        </div>
      </ModuleSection>

      <KpiGrid
        items={[
          {
            label: "Leads (funil)",
            value: fluxo.leads.length,
            href: "/leads",
          },
          {
            label: "Propostas abertas",
            value: fluxo.proposals.filter(
              (p) => p.status === "aberta" || p.status === "reservada"
            ).length,
            href: "/vendas",
          },
          {
            label: "A receber",
            value: formatBRL(aReceber),
            href: "/financeiro/recebimentos?status=aberto",
          },
          {
            label: "Venc. 7 / 30 dias",
            value: `${venc7} / ${venc30}`,
            href: "/financeiro/recebimentos?status=aberto",
          },
        ]}
      />

      <KpiGrid
        items={[
          {
            label: "Inadimplência",
            value: formatBRL(inad.reduce((a, r) => a + r.valor, 0)),
            hint: `${inad.length} títulos`,
            href: "/financeiro/recebimentos?status=vencido",
          },
          {
            label: "Obras em andamento",
            value: obras.obras.filter((o) => o.status === "em_andamento")
              .length,
            href: "/obras?status=em_andamento",
          },
          {
            label: "SC em aprovação",
            value: compras.solicitacoes.filter(
              (s) => s.status === "em_aprovacao"
            ).length,
            href: "/compras?status=em_aprovacao",
          },
          {
            label: "Pagar venc. / aberto",
            value: `${pagarFaixas.vencidos} / ${pagarFaixas.aberto}`,
            href: "/financeiro?sit=vencidos",
          },
        ]}
      />
    </div>
  );
}
