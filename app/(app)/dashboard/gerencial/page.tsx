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
import { useObras } from "@/lib/store/obras-store";
import { useCompras } from "@/lib/store/compras-store";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import { useFluxo } from "@/lib/store/fluxo-store";

export default function DashboardGerencialPage() {
  const { state: cart } = useCarteira();
  const { state: obras } = useObras();
  const { state: compras } = useCompras();
  const { fluxoMensal, state: fin } = useFinanceiro();
  const { state: fluxo } = useFluxo();

  const leads = fluxo.leads.length;
  const convertidas = fluxo.proposals.filter(
    (p) => p.status === "convertida"
  ).length;
  const conversao =
    leads > 0 ? Math.round((convertidas / leads) * 1000) / 10 : 0;

  const inad = fin.recebimentos.filter((r) => r.status === "vencido");
  const abertoRec = fin.recebimentos.filter((r) => r.status !== "recebido");
  const inadPct =
    abertoRec.length > 0
      ? Math.round((inad.length / abertoRec.length) * 1000) / 10
      : 0;

  const fluxoGeral = fluxoMensal("geral");
  const fluxoEmpresa = fluxoMensal("empresa");
  const fluxoObra = fluxoMensal("obra");

  const comprasPorStatus = compras.solicitacoes.reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const vendasPorEmp = cart.developments.map((d) => ({
    nome: d.nome,
    vendidos: cart.lots.filter(
      (l) => l.developmentId === d.id && l.status === "vendido"
    ).length,
  }));

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Dashboard · Gerencial"
        description="Direção e Financeiro — conversão, inadimplência, fluxo e obras."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/operacional">Números gerais</Link>
          </Button>
        }
      />

      <KpiGrid
        items={[
          {
            label: "Conversão funil",
            value: `${conversao}%`,
            href: "/leads",
          },
          {
            label: "Inadimplência %",
            value: `${inadPct}%`,
            href: "/financeiro/recebimentos?status=vencido",
          },
          {
            label: "Inadimplência R$",
            value: formatBRL(inad.reduce((a, r) => a + r.valor, 0)),
            href: "/financeiro/recebimentos?status=vencido",
          },
          {
            label: "Títulos vencidos",
            value: inad.length,
            href: "/financeiro/recebimentos?status=vencido",
          },
        ]}
      />

      <ModuleSection title="Fluxo realizado (3 visões)">
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-md border p-3">
            <div className="text-muted-foreground">Geral</div>
            <div className="font-display text-xl">
              {formatBRL(fluxoGeral.saldo)}
            </div>
            <div className="text-xs text-muted-foreground">
              +{formatBRL(fluxoGeral.receitas)} / −
              {formatBRL(fluxoGeral.despesas)}
            </div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-muted-foreground">Empresa</div>
            <div className="font-display text-xl">
              {formatBRL(fluxoEmpresa.saldo)}
            </div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-muted-foreground">Obras</div>
            <div className="font-display text-xl">
              {formatBRL(fluxoObra.saldo)}
            </div>
          </div>
        </div>
      </ModuleSection>

      <ModuleSection title="Vendas por empreendimento">
        <ul className="space-y-1 text-sm">
          {vendasPorEmp.map((v) => (
            <li key={v.nome} className="flex justify-between border-b py-1">
              <Link
                href="/empreendimentos"
                className="hover:text-brand-orange"
              >
                {v.nome}
              </Link>
              <span>{v.vendidos} vendidos</span>
            </li>
          ))}
        </ul>
      </ModuleSection>

      <ModuleSection title="Obras · orçado × realizado × físico">
        <ul className="space-y-1 text-sm">
          {obras.obras.map((o) => (
            <li key={o.id} className="flex justify-between border-b py-1">
              <Link href={`/obras/${o.id}`} className="hover:text-brand-orange">
                {o.nome}
              </Link>
              <span>
                {formatBRL(o.orcado)} → {formatBRL(o.realizado)} ·{" "}
                {Math.round(o.fisicoPct)}%
              </span>
            </li>
          ))}
        </ul>
      </ModuleSection>

      <ModuleSection title="Compras por situação">
        <div className="flex flex-wrap gap-2 text-sm">
          {Object.entries(comprasPorStatus).map(([st, n]) => (
            <Link
              key={st}
              href={`/compras?status=${st}`}
              className="rounded-md bg-muted px-3 py-1.5 hover:text-brand-orange"
            >
              {st.replace(/_/g, " ")}: {n}
            </Link>
          ))}
        </div>
      </ModuleSection>
    </div>
  );
}
