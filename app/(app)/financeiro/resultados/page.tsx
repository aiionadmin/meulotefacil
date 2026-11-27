"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  ModuleSection,
  DataTable,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { downloadExcel, printList } from "@/lib/export/list-export";
import {
  buildResultadosMensais,
  type Regime,
} from "@/lib/financeiro/fluxo-matriz";
import { formatBRL } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";

type Visao = "geral" | "empresa" | "obra";

export default function ResultadosPage() {
  const { state, resultadosPorGrupo } = useFinanceiro();
  const [visao, setVisao] = useState<Visao>("geral");
  const [regime, setRegime] = useState<Regime>("caixa");
  const rows = resultadosPorGrupo(visao);

  const mensal = useMemo(
    () =>
      buildResultadosMensais({
        planos: state.planos,
        categorias: state.categorias,
        pagamentos: state.pagamentos,
        recebimentos: state.recebimentos,
        visao,
        regime,
      }),
    [state, visao, regime]
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Resultados"
        description="G17 — demonstrativo mensal por grupo, regime de caixa ou competência."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/fluxo-de-caixa">Fluxo de caixa</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadExcel(
                  "resultados",
                  ["Grupo", ...mensal.meses, "Total"],
                  mensal.linhas.map((l) => [
                    l.grupo,
                    ...mensal.meses.map((m) => l.porMes[m] ?? 0),
                    l.total,
                  ])
                );
                notify("Excel exportado");
              }}
            >
              Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => printList("Resultados")}
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
            ["caixa", "Caixa"],
            ["competencia", "Competência"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setRegime(id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              regime === id
                ? "bg-brand-orange text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <ModuleSection title="Demonstrativo mensal por grupo">
        {mensal.linhas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sem movimentos neste regime/visão.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={[
                { key: "grupo", label: "Grupo" },
                ...mensal.meses.map((m) => ({ key: m, label: m })),
                { key: "total", label: "Total" },
              ]}
              rows={mensal.linhas.map((l) => {
                const cells: Record<string, string> = {
                  grupo: l.grupo,
                  total: formatBRL(l.total),
                };
                for (const m of mensal.meses) {
                  cells[m] = formatBRL(l.porMes[m] ?? 0);
                }
                return cells;
              })}
            />
          </div>
        )}
      </ModuleSection>
      <ModuleSection title="Totais por grupo (visão atual)">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sem movimentos pagos nesta visão.
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {rows.map((r) => (
              <li
                key={r.grupo}
                className="flex justify-between border-b py-1.5"
              >
                <span>{r.grupo}</span>
                <span className="font-medium">{formatBRL(r.valor)}</span>
              </li>
            ))}
          </ul>
        )}
      </ModuleSection>
    </div>
  );
}
