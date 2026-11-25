"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  FilterBar,
  notify,
} from "@/components/app/ModuleToolkit";
import { brl } from "@/lib/data/sistema";
import { useDemoStore } from "@/lib/store/demo-store";

export default function FinanceiroPage() {
  const { state, baixarPagar, baixarReceber } = useDemoStore();
  const [q, setQ] = useState("");
  const [selectedPagar, setSelectedPagar] = useState<
    (typeof state.pagar)[number] | null
  >(null);
  const [selectedReceber, setSelectedReceber] = useState<
    (typeof state.receber)[number] | null
  >(null);

  const pagar = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.pagar;
    return state.pagar.filter((p) =>
      [p.favorecido, p.categoria, p.status, p.centro]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.pagar, q]);

  const receber = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.receber;
    return state.receber.filter((r) =>
      [r.origem, r.cliente, r.status, r.centro]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.receber, q]);

  const abertoPagar = state.pagar
    .filter((p) => p.status !== "Pago")
    .reduce((a, p) => a + p.valor, 0);
  const abertoReceber = state.receber
    .filter((r) => r.status !== "Recebido")
    .reduce((a, r) => a + r.valor, 0);
  const saldoBancos = state.contas.reduce((a, c) => a + c.saldo, 0);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Financeiro"
        description="Contas a pagar e receber, contas bancárias, fluxo e posição consolidada."
      />
      <KpiGrid
        items={[
          { label: "A pagar", value: brl(abertoPagar) },
          { label: "A receber", value: brl(abertoReceber) },
          { label: "Saldo contas", value: brl(saldoBancos) },
          {
            label: "Contas",
            value: state.contas.length,
          },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Filtrar títulos…" />

      <ModuleSection title="Contas bancárias">
        <DataTable
          columns={[
            { key: "nome", label: "Conta" },
            { key: "banco", label: "Banco" },
            { key: "agencia", label: "Agência" },
            { key: "tipo", label: "Tipo" },
            { key: "saldo", label: "Saldo" },
          ]}
          rows={state.contas.map((c) => ({
            nome: <span className="font-medium">{c.nome}</span>,
            banco: c.banco,
            agencia: c.agencia,
            tipo: c.tipo,
            saldo: brl(c.saldo),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Contas a pagar">
        <DataTable
          onRowClick={(i) => setSelectedPagar(pagar[i])}
          columns={[
            { key: "favorecido", label: "Favorecido" },
            { key: "categoria", label: "Categoria" },
            { key: "centro", label: "Centro" },
            { key: "vencimento", label: "Vencimento" },
            { key: "valor", label: "Valor" },
            { key: "status", label: "Status" },
          ]}
          rows={pagar.map((p) => ({
            favorecido: <span className="font-medium">{p.favorecido}</span>,
            categoria: p.categoria,
            centro: p.centro,
            vencimento: p.vencimento,
            valor: brl(p.valor),
            status: (
              <StatusPill
                tone={
                  p.status === "Pago"
                    ? "ok"
                    : p.status === "Vencido"
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

      <ModuleSection title="Contas a receber">
        <DataTable
          onRowClick={(i) => setSelectedReceber(receber[i])}
          columns={[
            { key: "origem", label: "Origem" },
            { key: "cliente", label: "Cliente" },
            { key: "centro", label: "Centro" },
            { key: "vencimento", label: "Vencimento" },
            { key: "valor", label: "Valor" },
            { key: "status", label: "Status" },
          ]}
          rows={receber.map((r) => ({
            origem: <span className="font-medium">{r.origem}</span>,
            cliente: r.cliente,
            centro: r.centro,
            vencimento: r.vencimento,
            valor: brl(r.valor),
            status: (
              <StatusPill tone={r.status === "Recebido" ? "ok" : "warn"}>
                {r.status}
              </StatusPill>
            ),
          }))}
        />
      </ModuleSection>

      <DetailSheet
        open={!!selectedPagar}
        onOpenChange={(o) => !o && setSelectedPagar(null)}
        title={selectedPagar?.favorecido ?? "A pagar"}
        footer={
          selectedPagar && selectedPagar.status !== "Pago" ? (
            <Button
              size="sm"
              onClick={() => {
                baixarPagar(selectedPagar.id);
                setSelectedPagar({ ...selectedPagar, status: "Pago" });
                notify("Pagamento baixado", brl(selectedPagar.valor));
              }}
            >
              Baixar pagamento
            </Button>
          ) : null
        }
      >
        {selectedPagar ? (
          <>
            <DetailRow label="Categoria" value={selectedPagar.categoria} />
            <DetailRow label="Centro" value={selectedPagar.centro} />
            <DetailRow label="Vencimento" value={selectedPagar.vencimento} />
            <DetailRow label="Valor" value={brl(selectedPagar.valor)} />
            <DetailRow label="Status" value={selectedPagar.status} />
          </>
        ) : null}
      </DetailSheet>

      <DetailSheet
        open={!!selectedReceber}
        onOpenChange={(o) => !o && setSelectedReceber(null)}
        title={selectedReceber?.origem ?? "A receber"}
        footer={
          selectedReceber && selectedReceber.status !== "Recebido" ? (
            <Button
              size="sm"
              onClick={() => {
                baixarReceber(selectedReceber.id);
                setSelectedReceber({ ...selectedReceber, status: "Recebido" });
                notify("Recebimento baixado", brl(selectedReceber.valor));
              }}
            >
              Baixar recebimento
            </Button>
          ) : null
        }
      >
        {selectedReceber ? (
          <>
            <DetailRow label="Cliente" value={selectedReceber.cliente} />
            <DetailRow label="Centro" value={selectedReceber.centro} />
            <DetailRow label="Vencimento" value={selectedReceber.vencimento} />
            <DetailRow label="Valor" value={brl(selectedReceber.valor)} />
            <DetailRow label="Status" value={selectedReceber.status} />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
