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
import { fiscalMock, brl, sistemaKpis } from "@/lib/data/sistema";

export default function FiscalPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Fiscal e contábil"
        description="Captura de NFe, emissão de NFSe, DIMOB, SPED Contribuições e exportação para contabilidade (Domínio, Folhamatic, ConsisaNet, Copan, Telecont)."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/fiscal">Exportar contabilidade</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/fiscal">Emitir NFSe</Link>
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          {
            label: "NFe sem lançamento",
            value: sistemaKpis.nfeSemLancamento,
          },
          { label: "Documentos na amostra", value: fiscalMock.length },
          { label: "DIMOB", value: "Disponível" },
          { label: "SPED", value: "Disponível" },
        ]}
      />
      <ModuleSection title="Notas">
        <DataTable
          columns={[
            { key: "tipo", label: "Tipo" },
            { key: "numero", label: "Número" },
            { key: "emitente", label: "Emitente" },
            { key: "valor", label: "Valor" },
            { key: "status", label: "Status" },
          ]}
          rows={fiscalMock.map((n) => ({
            tipo: n.tipo,
            numero: n.numero,
            emitente: n.emitente,
            valor: brl(n.valor),
            status: (
              <StatusPill
                tone={
                  n.status === "Sem lançamento"
                    ? "warn"
                    : n.status === "Emitida" || n.status === "Vinculada"
                      ? "ok"
                      : "info"
                }
              >
                {n.status}
              </StatusPill>
            ),
          }))}
        />
      </ModuleSection>
    </div>
  );
}
