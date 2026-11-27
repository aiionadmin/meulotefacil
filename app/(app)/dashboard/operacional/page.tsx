"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  ModuleSection,
  DataTable,
} from "@/components/app/ModulePage";
import { fieldControlClass } from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import {
  aReceberContratos,
  aReceberFinanceiroTitulos,
  emAtrasoFinanceiroTitulos,
} from "@/lib/indicators/receivables";
import { agingPorConta } from "@/lib/financeiro/aging-faixas";
import { useEmpresa } from "@/lib/empresa/context";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { useObras } from "@/lib/store/obras-store";
import { useCompras } from "@/lib/store/compras-store";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import { useParte5 } from "@/lib/store/parte5-store";
import { useFluxo } from "@/lib/store/fluxo-store";
import type { ObraStatus } from "@/lib/domain/obras-types";

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
  const { state: fin, fluxoMensal } = useFinanceiro();
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

  const [obraTab, setObraTab] = useState<
    "em_andamento" | "paralisada" | "finalizada"
  >("em_andamento");
  const [centroFiltro, setCentroFiltro] = useState("todos");

  const obrasGestao = useMemo(() => {
    const map: Record<"em_andamento" | "paralisada" | "finalizada", ObraStatus> =
      {
        em_andamento: "em_andamento",
        paralisada: "paralisada",
        finalizada: "finalizada",
      };
    return obras.obras.filter((o) => o.status === map[obraTab]);
  }, [obras.obras, obraTab]);

  const agingPag = useMemo(
    () =>
      agingPorConta(
        fin.pagamentos.map((p) => ({
          contaId: p.contaId,
          vencimento: p.vencimento,
          valor: p.valor - p.valorPago,
          aberto: p.status !== "pago",
        })),
        fin.contas.map((c) => ({ id: c.id, nome: c.nome }))
      ),
    [fin.pagamentos, fin.contas]
  );

  const agingRec = useMemo(
    () =>
      agingPorConta(
        fin.recebimentos.map((r) => ({
          contaId: r.contaId,
          vencimento: r.vencimento,
          valor: r.valor - r.valorRecebido,
          aberto: r.status !== "recebido",
        })),
        fin.contas.map((c) => ({ id: c.id, nome: c.nome }))
      ),
    [fin.recebimentos, fin.contas]
  );

  const prePend = fin.preLancamentos.filter((p) => p.status === "pendente");
  const preRec = fin.preLancamentos.filter((p) => p.status === "recusado");
  const nfsSemVinculo = fin.notas.filter((n) => !n.lancada);
  const fluxoVisao =
    centroFiltro === "empresa"
      ? "empresa"
      : centroFiltro === "obra"
        ? "obra"
        : "geral";
  const fluxoResumo = fluxoMensal(fluxoVisao);

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

      <ModuleSection title="Gestão de obras">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {(
            [
              ["em_andamento", "Em andamento"],
              ["paralisada", "Paralisada"],
              ["finalizada", "Finalizada"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setObraTab(id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                obraTab === id
                  ? "bg-brand-green text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <DataTable
          columns={[
            { key: "obra", label: "Obra" },
            { key: "cli", label: "Cliente" },
            { key: "fis", label: "Físico %" },
            { key: "orc", label: "Orçado" },
            { key: "rea", label: "Realizado" },
            { key: "sal", label: "Saldo" },
          ]}
          rows={obrasGestao.map((o) => {
            const pct =
              o.orcado > 0
                ? Math.round((o.realizado / o.orcado) * 1000) / 10
                : 0;
            return {
              obra: (
                <Link
                  href={`/obras/${o.id}`}
                  className="font-medium hover:text-brand-orange"
                >
                  {o.nome}
                </Link>
              ),
              cli: o.clienteNome,
              fis: `${o.fisicoPct}%`,
              orc: formatBRL(o.orcado),
              rea: `${formatBRL(o.realizado)} (${pct}%)`,
              sal: formatBRL(o.orcado - o.realizado),
            };
          })}
        />
      </ModuleSection>

      <ModuleSection title="Pagamentos em aberto por conta">
        <DataTable
          columns={[
            { key: "cta", label: "Conta" },
            { key: "v90", label: "Venc. 90d" },
            { key: "hoje", label: "Hoje" },
            { key: "d7", label: "7 dias" },
            { key: "d30", label: "30 dias" },
          ]}
          rows={agingPag.map((a) => ({
            cta: a.contaNome,
            v90: `${a.faixas[0].qtd} · ${formatBRL(a.faixas[0].valor)}`,
            hoje: `${a.faixas[1].qtd} · ${formatBRL(a.faixas[1].valor)}`,
            d7: `${a.faixas[2].qtd} · ${formatBRL(a.faixas[2].valor)}`,
            d30: `${a.faixas[3].qtd} · ${formatBRL(a.faixas[3].valor)}`,
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Recebimentos em aberto por conta">
        <DataTable
          columns={[
            { key: "cta", label: "Conta" },
            { key: "v90", label: "Venc. 90d" },
            { key: "hoje", label: "Hoje" },
            { key: "d7", label: "7 dias" },
            { key: "d30", label: "30 dias" },
          ]}
          rows={agingRec.map((a) => ({
            cta: a.contaNome,
            v90: `${a.faixas[0].qtd} · ${formatBRL(a.faixas[0].valor)}`,
            hoje: `${a.faixas[1].qtd} · ${formatBRL(a.faixas[1].valor)}`,
            d7: `${a.faixas[2].qtd} · ${formatBRL(a.faixas[2].valor)}`,
            d30: `${a.faixas[3].qtd} · ${formatBRL(a.faixas[3].valor)}`,
          }))}
        />
      </ModuleSection>

      <KpiGrid
        items={[
          {
            label: "Pré-lançamentos pendentes",
            value: prePend.length,
            hint: formatBRL(prePend.reduce((a, p) => a + p.valor, 0)),
          },
          {
            label: "Pré-lançamentos recusados",
            value: preRec.length,
          },
          {
            label: "NFs sem vínculo",
            value: nfsSemVinculo.length,
            hint: formatBRL(
              nfsSemVinculo.reduce((a, n) => a + n.valor, 0)
            ),
          },
        ]}
      />

      <ModuleSection title="Fluxo de caixa (resumo)">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <select
            className={fieldControlClass + " max-w-[200px]"}
            value={centroFiltro}
            onChange={(e) => setCentroFiltro(e.target.value)}
          >
            <option value="todos">Centro: Geral</option>
            <option value="empresa">Centro: Empresa</option>
            <option value="obra">Centro: Obras</option>
          </select>
          <Button size="sm" variant="outline" asChild>
            <Link href="/financeiro/fluxo-de-caixa">Abrir fluxo</Link>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-md border border-linha p-3">
            <div className="text-muted-foreground">Receitas</div>
            <div className="mt-1 font-semibold text-brand-green">
              {formatBRL(fluxoResumo.receitas)}
            </div>
          </div>
          <div className="rounded-md border border-linha p-3">
            <div className="text-muted-foreground">Despesas</div>
            <div className="mt-1 font-semibold">
              {formatBRL(fluxoResumo.despesas)}
            </div>
          </div>
          <div className="rounded-md border border-linha p-3">
            <div className="text-muted-foreground">Saldo</div>
            <div className="mt-1 font-semibold">
              {formatBRL(fluxoResumo.saldo)}
            </div>
          </div>
        </div>
      </ModuleSection>

      <p className="text-xs text-muted-foreground">
        Atalhos:{" "}
        <Link className="underline" href="/demandas">
          Demandas
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/pagamentos">
          Pagamentos
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/recebimentos">
          Recebimentos
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/pre-lancamentos">
          Pré-lançamentos
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/notas-fiscais">
          Notas
        </Link>
        {" · "}
        <Link className="underline" href="/obras">
          Obras
        </Link>
      </p>
    </div>
  );
}
