"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  parcelasCarteira,
  brl,
  sistemaKpis,
} from "@/lib/data/sistema";

export default function CarteiraPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Carteira e caixa"
        description="Ficha financeira, recebimento no caixa, encargos (mora/multa), inadimplência e estorno com alçada."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/carteira">Abrir caixa</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/carteira">Registrar pagamento</Link>
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          {
            label: "Carteira a receber",
            value: brl(sistemaKpis.carteiraReceber),
          },
          { label: "Inadimplentes", value: sistemaKpis.inadimplentes },
          { label: "Vencimentos 30 dias", value: sistemaKpis.vencimentos30d },
          {
            label: "Encargos padrão",
            value: "Mora 1% / Multa 2%",
            hint: "Após 2 dias",
          },
        ]}
      />
      <ModuleSection title="Parcelas">
        <DataTable
          columns={[
            { key: "contrato", label: "Contrato" },
            { key: "comprador", label: "Comprador" },
            { key: "tipo", label: "Tipo" },
            { key: "n", label: "Nº" },
            { key: "vencimento", label: "Vencimento" },
            { key: "valor", label: "Valor" },
            { key: "encargos", label: "Encargos" },
            { key: "status", label: "Status" },
          ]}
          rows={parcelasCarteira.map((p) => ({
            contrato: p.contrato,
            comprador: p.comprador,
            tipo: p.tipo,
            n: p.n,
            vencimento: p.vencimento,
            valor: brl(p.valor),
            encargos: brl(p.encargos),
            status: (
              <StatusPill
                tone={
                  p.status === "Paga"
                    ? "ok"
                    : p.status === "Vencida"
                      ? "danger"
                      : "warn"
                }
              >
                {p.status}
              </StatusPill>
            ),
          }))}
        />
      </ModuleSection>
    </div>
  );
}
