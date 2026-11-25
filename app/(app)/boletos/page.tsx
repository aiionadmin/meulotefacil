"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  FilterBar,
  notify,
} from "@/components/app/ModuleToolkit";
import { brl } from "@/lib/data/sistema";
import { useDemoStore, type Boleto } from "@/lib/store/demo-store";

export default function BoletosPage() {
  const { state, gerarBoletosMes, gerarRemessa, processarRetorno } =
    useDemoStore();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Boleto | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.boletos;
    return state.boletos.filter((b) =>
      [b.nossoNumero, b.contrato, b.status, b.banco]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.boletos, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Boletos e remessa"
        description="Emissão por mês/contrato, remessa e retorno CNAB, carnê e travas de emissão."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const n = gerarBoletosMes();
                notify(
                  n ? "Boletos gerados" : "Nada a gerar",
                  n ? `${n} título(s)` : "Parcelas já possuem boleto"
                );
              }}
            >
              Gerar boletos do mês
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const n = gerarRemessa();
                notify(
                  n ? "Remessa CNAB gerada" : "Sem títulos emitidos",
                  n ? `${n} registro(s)` : undefined
                );
              }}
            >
              Gerar remessa
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const n = processarRetorno();
                notify(
                  n ? "Retorno processado" : "Sem remessa pendente",
                  n ? `${n} liquidação(ões)` : undefined
                );
              }}
            >
              Processar retorno
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Boletos", value: state.boletos.length },
          {
            label: "Emitidos",
            value: state.boletos.filter((b) => b.status === "Emitido").length,
          },
          {
            label: "Em remessa",
            value: state.boletos.filter((b) => b.status === "Remessa gerada")
              .length,
          },
          {
            label: "Liquidados",
            value: state.boletos.filter((b) => b.status === "Liquidado").length,
          },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar boleto…" />
      <DataTable
        onRowClick={(i) => setSelected(filtered[i])}
        columns={[
          { key: "nn", label: "Nosso número" },
          { key: "contrato", label: "Contrato" },
          { key: "vencimento", label: "Vencimento" },
          { key: "valor", label: "Valor" },
          { key: "banco", label: "Banco" },
          { key: "status", label: "Status" },
        ]}
        rows={filtered.map((b) => ({
          nn: <span className="font-medium">{b.nossoNumero}</span>,
          contrato: b.contrato,
          vencimento: b.vencimento,
          valor: brl(b.valor),
          banco: b.banco,
          status: (
            <StatusPill
              tone={
                b.status === "Liquidado"
                  ? "ok"
                  : b.status === "Cancelado"
                    ? "danger"
                    : "info"
              }
            >
              {b.status}
            </StatusPill>
          ),
        }))}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `Boleto ${selected.nossoNumero}` : "Boleto"}
      >
        {selected ? (
          <>
            <DetailRow label="Contrato" value={selected.contrato} />
            <DetailRow label="Vencimento" value={selected.vencimento} />
            <DetailRow label="Valor" value={brl(selected.valor)} />
            <DetailRow label="Banco" value={selected.banco} />
            <DetailRow label="Status" value={selected.status} />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
