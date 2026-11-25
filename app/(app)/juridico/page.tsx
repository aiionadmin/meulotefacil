"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFluxo } from "@/lib/store/fluxo-store";

export default function JuridicoPage() {
  const { state } = useFluxo();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Processos judiciais"
        description="Fase 9 — ações, prazos e advogado responsável."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/cobranca">Voltar à cobrança</Link>
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Processos", value: state.lawsuits.length },
          {
            label: "Ativos",
            value: state.lawsuits.filter((l) => l.situacao === "ativo").length,
          },
        ]}
      />
      <DataTable
        columns={[
          { key: "cliente", label: "Cliente" },
          { key: "ctr", label: "Contrato" },
          { key: "tipo", label: "Tipo" },
          { key: "numero", label: "Nº processo" },
          { key: "valor", label: "Causa" },
          { key: "prazo", label: "Próximo prazo" },
          { key: "status", label: "Situação" },
        ]}
        rows={state.lawsuits.map((l) => ({
          cliente: l.cliente,
          ctr: l.contratoNumero,
          tipo: l.tipo,
          numero: l.numero,
          valor: formatBRL(l.valorCausa),
          prazo: l.proximoPrazo ? formatDateBR(l.proximoPrazo) : "—",
          status: <StatusPill tone="warn">{l.situacao}</StatusPill>,
        }))}
      />
    </div>
  );
}
