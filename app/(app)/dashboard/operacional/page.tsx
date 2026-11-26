"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  ModuleSection,
} from "@/components/app/ModulePage";
import { formatBRL } from "@/lib/masks/br";
import {
  aReceberContratos,
  aReceberFinanceiroTitulos,
  emAtrasoFinanceiroTitulos,
} from "@/lib/indicators/receivables";
import { useEmpresa } from "@/lib/empresa/context";
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
  const { selectedId, filterByEmpresa, filterByDevelopmentEmpresa } =
    useEmpresa();

  const developments = useMemo(
    () => filterByEmpresa(cart.developments),
    [filterByEmpresa, cart.developments]
  );
  const lots = useMemo(
    () => filterByDevelopmentEmpresa(cart.lots, cart.developments),
    [filterByDevelopmentEmpresa, cart.lots, cart.developments]
  );
  const contracts = useMemo(
    () => filterByDevelopmentEmpresa(cart.contracts, cart.developments),
    [filterByDevelopmentEmpresa, cart.contracts, cart.developments]
  );
  const installments = useMemo(
    () =>
      filterByDevelopmentEmpresa(
        cart.installments.map((i) => {
          const c = cart.contracts.find((x) => x.id === i.contractId);
          return { ...i, developmentId: c?.developmentId };
        }),
        cart.developments
      ),
    [
      filterByDevelopmentEmpresa,
      cart.installments,
      cart.contracts,
      cart.developments,
    ]
  );

  const lotesPorStatus = lots.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  const contratosAtivos = contracts.filter((c) => c.status === "ativo").length;

  const aReceber = aReceberFinanceiroTitulos(fin.recebimentos);
  const emAtrasoFin = emAtrasoFinanceiroTitulos(fin.recebimentos);
  const aReceberCtr = aReceberContratos(installments);

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
        description={`Operacional — filtro empresa: ${selectedId === "todas" ? "Todas" : selectedId.slice(0, 8)}…`}
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
            value: developments.length,
            hint: "Abrir lista",
          },
          {
            label: "Clientes ativos",
            value: f1.people.filter(
              (p) => p.papeis.includes("cliente") && p.status !== "excluido"
            ).length,
          },
          { label: "Contratos ativos", value: contratosAtivos },
          { label: "Demandas abertas", value: demandasAbertas },
        ]}
      />

      <ModuleSection title="Lotes por situação">
        <div className="flex flex-wrap gap-3 text-sm">
          {Object.entries(lotesPorStatus).map(([st, n]) => (
            <Link
              key={st}
              href="/empreendimentos"
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
          },
          {
            label: "Propostas abertas",
            value: fluxo.proposals.filter(
              (p) => p.status === "aberta" || p.status === "reservada"
            ).length,
          },
          {
            label: "A receber financeiro",
            value: formatBRL(aReceber),
          },
          {
            label: "A receber de contratos",
            value: formatBRL(aReceberCtr),
          },
        ]}
      />

      <KpiGrid
        items={[
          {
            label: "Venc. 7 / 30 dias",
            value: `${venc7} / ${venc30}`,
          },
          {
            label: "Em atraso (financeiro)",
            value: formatBRL(emAtrasoFin),
            hint: `${inad.length} títulos`,
          },
          {
            label: "Obras em andamento",
            value: obras.obras.filter((o) => o.status === "em_andamento")
              .length,
          },
          {
            label: "SC em aprovação",
            value: compras.solicitacoes.filter(
              (s) => s.status === "em_aprovacao"
            ).length,
          },
          {
            label: "Pagar venc. / aberto",
            value: `${pagarFaixas.vencidos} / ${pagarFaixas.aberto}`,
          },
        ]}
      />

      <p className="text-xs text-muted-foreground">
        Atalhos:{" "}
        <Link className="underline" href="/demandas">
          Demandas
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro">
          Pagamentos
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/recebimentos">
          Recebimentos
        </Link>
        {" · "}
        <Link className="underline" href="/obras">
          Obras
        </Link>
        {" · "}
        <Link className="underline" href="/compras">
          Compras
        </Link>
      </p>
    </div>
  );
}
