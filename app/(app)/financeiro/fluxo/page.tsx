"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  ModuleSection,
} from "@/components/app/ModulePage";
import { formatBRL } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";

type Visao = "geral" | "empresa" | "obra";

export default function FluxoCaixaPage() {
  const { state, fluxoMensal } = useFinanceiro();
  const [visao, setVisao] = useState<Visao>("geral");
  const fluxo = fluxoMensal(visao);
  const saldoContas = state.contas.reduce((a, c) => a + c.saldo, 0);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Fluxo de caixa"
        description="Três visões: Empresa, Obras e Geral."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/financeiro/resultados">Resultados</Link>
          </Button>
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
      </div>
      <KpiGrid
        items={[
          { label: "Saldo contas", value: formatBRL(saldoContas) },
          { label: "Receitas (pagos)", value: formatBRL(fluxo.receitas) },
          { label: "Despesas (pagas)", value: formatBRL(fluxo.despesas) },
          { label: "Saldo período", value: formatBRL(fluxo.saldo) },
        ]}
      />
      <ModuleSection title="Resumo por plano (despesas pagas)">
        <ul className="space-y-1 text-sm">
          {state.planos
            .filter((p) => p.fluxo === "despesas")
            .map((p) => {
              const cats = state.categorias
                .filter((c) => c.planoId === p.id)
                .map((c) => c.id);
              const valor = state.pagamentos
                .filter(
                  (pag) =>
                    pag.status === "pago" &&
                    cats.includes(pag.categoriaId) &&
                    (visao === "geral" ||
                      (visao === "empresa"
                        ? /empresa|meu lote/i.test(pag.centroLabel)
                        : !/^meu lote fácil$/i.test(pag.centroLabel.trim())))
                )
                .reduce((a, pag) => a + pag.valorPago, 0);
              if (!valor) return null;
              return (
                <li key={p.id} className="flex justify-between border-b py-1">
                  <span>
                    {p.nome}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {p.grupoResultados}
                    </span>
                  </span>
                  <span>{formatBRL(valor)}</span>
                </li>
              );
            })}
        </ul>
      </ModuleSection>
    </div>
  );
}
