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
import { notify } from "@/components/app/ModuleToolkit";
import { downloadExcel, printList } from "@/lib/export/list-export";
import {
  buildFluxoMatriz,
  type Granularidade,
} from "@/lib/financeiro/fluxo-matriz";
import { formatBRL } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";

type Visao = "geral" | "empresa" | "obra";

export default function FluxoCaixaPage() {
  const { state, fluxoMensal } = useFinanceiro();
  const [visao, setVisao] = useState<Visao>("geral");
  const [gran, setGran] = useState<Granularidade>("mensal");
  const fluxo = fluxoMensal(visao);
  const saldoContas = state.contas.reduce((a, c) => a + c.saldo, 0);

  const matriz = useMemo(
    () =>
      buildFluxoMatriz({
        planos: state.planos,
        categorias: state.categorias,
        pagamentos: state.pagamentos,
        recebimentos: state.recebimentos,
        saldoInicial: saldoContas,
        visao,
        granularidade: gran,
      }),
    [state, saldoContas, visao, gran]
  );

  const exportar = () => {
    const headers = [
      "Plano",
      "Tipo",
      ...matriz.periodos.flatMap((p) => [`${p} real.`, `${p} prev.`]),
      "Total real.",
      "Total prev.",
    ];
    const rows = matriz.linhas.map((l) => [
      l.planoNome,
      l.fluxo,
      ...matriz.periodos.flatMap((p) => {
        const c = l.porPeriodo[p] ?? { realizado: 0, previsto: 0 };
        return [c.realizado, c.previsto];
      }),
      l.totalRealizado,
      l.totalPrevisto,
    ]);
    downloadExcel("fluxo-caixa", headers, rows);
    notify("Excel exportado");
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Fluxo de Caixa"
        description="G16 — matriz plano × período, realizado e previsto, saldo inicial."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/resultados">Resultados</Link>
            </Button>
            <Button size="sm" variant="outline" onClick={exportar}>
              Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const headers = [
                  "Plano",
                  "Tipo",
                  ...matriz.periodos.flatMap((p) => [`${p} real.`, `${p} prev.`]),
                  "Total real.",
                  "Total prev.",
                ];
                const rows = matriz.linhas.map((l) => [
                  l.planoNome,
                  l.fluxo,
                  ...matriz.periodos.flatMap((p) => {
                    const c = l.porPeriodo[p] ?? { realizado: 0, previsto: 0 };
                    return [c.realizado, c.previsto];
                  }),
                  l.totalRealizado,
                  l.totalPrevisto,
                ]);
                void printList("Fluxo de caixa", headers, rows, {
                  filename: "fluxo-caixa",
                });
                notify("Impressão gerada");
              }}
            >
              Imprimir
            </Button>
          </>
        }
      />
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["geral", "Geral"],
            ["empresa", "Empresa"],
            ["obra", "Obras"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setVisao(id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              visao === id
                ? "bg-brand-green text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="mx-1 text-muted-foreground">·</span>
        {(
          [
            ["diario", "Diário"],
            ["semanal", "Semanal"],
            ["mensal", "Mensal"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setGran(id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              gran === id
                ? "bg-brand-orange text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <KpiGrid
        items={[
          { label: "Saldo inicial", value: formatBRL(matriz.saldoInicial) },
          { label: "Receitas (pagos)", value: formatBRL(fluxo.receitas) },
          { label: "Despesas (pagas)", value: formatBRL(fluxo.despesas) },
          { label: "Saldo período", value: formatBRL(fluxo.saldo) },
        ]}
      />
      <ModuleSection title="Matriz plano × período">
        {matriz.linhas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sem movimentos nesta visão.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={[
                { key: "plano", label: "Plano" },
                { key: "tipo", label: "Tipo" },
                ...matriz.periodos.map((p) => ({
                  key: p,
                  label: p,
                })),
                { key: "tr", label: "Σ real." },
                { key: "tp", label: "Σ prev." },
              ]}
              rows={matriz.linhas.map((l) => {
                const cells: Record<string, string> = {
                  plano: l.planoNome,
                  tipo: l.fluxo === "receitas" ? "Receita" : "Despesa",
                  tr: formatBRL(l.totalRealizado),
                  tp: formatBRL(l.totalPrevisto),
                };
                for (const p of matriz.periodos) {
                  const c = l.porPeriodo[p] ?? { realizado: 0, previsto: 0 };
                  cells[p] = `${formatBRL(c.realizado)} / ${formatBRL(c.previsto)}`;
                }
                return cells;
              })}
            />
          </div>
        )}
      </ModuleSection>
      <ModuleSection title="Saldo acumulado">
        {matriz.saldos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem períodos.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {matriz.saldos.map((s) => (
              <li
                key={s.periodo}
                className="flex justify-between border-b py-1.5"
              >
                <span>{s.periodo}</span>
                <span className="font-medium">{formatBRL(s.saldo)}</span>
              </li>
            ))}
          </ul>
        )}
      </ModuleSection>
    </div>
  );
}
