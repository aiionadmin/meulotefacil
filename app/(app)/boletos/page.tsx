"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import { boletosMock, brl } from "@/lib/data/sistema";

export default function BoletosPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Boletos e remessa bancária"
        description="Geração por mês/empreendimento/cliente, remessa CNAB, carnê, PDF com senha, baixa manual/automática e travas de emissão."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/boletos">Importar retorno</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/boletos">Gerar remessa</Link>
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Boletos na amostra", value: boletosMock.length },
          { label: "Banco padrão", value: "Sicredi 748" },
          { label: "Emitidos", value: boletosMock.filter((b) => b.status === "Emitido").length },
          {
            label: "Cancelados",
            value: boletosMock.filter((b) => b.status === "Cancelado").length,
          },
        ]}
      />
      <DataTable
        columns={[
          { key: "nossoNumero", label: "Nosso número" },
          { key: "contrato", label: "Contrato" },
          { key: "vencimento", label: "Vencimento" },
          { key: "valor", label: "Valor" },
          { key: "banco", label: "Banco" },
          { key: "status", label: "Status" },
        ]}
        rows={boletosMock.map((b) => ({
          nossoNumero: <span className="font-medium">{b.nossoNumero}</span>,
          contrato: b.contrato,
          vencimento: b.vencimento,
          valor: brl(b.valor),
          banco: b.banco,
          status: (
            <StatusPill
              tone={
                b.status === "Cancelado"
                  ? "danger"
                  : b.status === "Remessa gerada"
                    ? "info"
                    : "ok"
              }
            >
              {b.status}
            </StatusPill>
          ),
        }))}
      />
    </div>
  );
}
