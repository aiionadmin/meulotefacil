"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  ModuleSection,
} from "@/components/app/ModulePage";
import { formatBRL } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";

type Visao = "geral" | "empresa" | "obra";

export default function ResultadosPage() {
  const { resultadosPorGrupo } = useFinanceiro();
  const [visao, setVisao] = useState<Visao>("geral");
  const rows = resultadosPorGrupo(visao);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Resultados"
        description="Demonstrativo por grupo (contas 'Somente Fluxo de Caixa' fora)."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/financeiro/fluxo">Fluxo de caixa</Link>
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
      <ModuleSection title="Por grupo de resultados">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sem movimentos pagos nesta visão. Baixe um pagamento ou recebimento
            para popular.
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
