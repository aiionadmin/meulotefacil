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
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import type { BankSlip } from "@/lib/domain/carteira-types";

export default function BoletosPage() {
  const { state, gerarBoletosMes, gerarRemessa, processarRetorno } =
    useCarteira();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<BankSlip | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.bankSlips;
    return state.bankSlips.filter((b) =>
      [b.nossoNumero, b.contratoNumero, b.status, b.banco]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.bankSlips, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Boletos e remessa"
        description="Fase 4 — emissão, remessa CNAB e retorno (demo)."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const n = gerarBoletosMes();
                notify(
                  n ? "Boletos gerados" : "Nada a gerar",
                  n ? `${n} título(s)` : "Já emitidos ou travados"
                );
              }}
            >
              Gerar boletos
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const n = gerarRemessa();
                notify(n ? "Remessa gerada" : "Sem boletos gerados", n ? `${n} itens` : undefined);
              }}
            >
              Remessa
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const n = processarRetorno();
                notify(
                  n ? "Retorno processado" : "Nada em remessa",
                  n ? `${n} baixas` : undefined
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
          { label: "Boletos", value: state.bankSlips.length },
          {
            label: "Gerados",
            value: state.bankSlips.filter((b) => b.status === "gerado").length,
          },
          {
            label: "Em remessa",
            value: state.bankSlips.filter((b) => b.status === "remessa").length,
          },
          {
            label: "Pagos",
            value: state.bankSlips.filter((b) => b.status === "pago").length,
          },
        ]}
      />

      <FilterBar
        value={q}
        onChange={setQ}
        placeholder="Buscar nosso número, contrato…"
      />

      <DataTable
        columns={[
          { key: "nn", label: "Nosso nº" },
          { key: "contrato", label: "Contrato" },
          { key: "banco", label: "Banco" },
          { key: "venc", label: "Vencimento" },
          { key: "valor", label: "Valor" },
          { key: "status", label: "Status" },
        ]}
        rows={filtered.map((b) => ({
          nn: (
            <button
              type="button"
              className="font-medium hover:text-brand-orange"
              onClick={() => setSelected(b)}
            >
              {b.nossoNumero}
            </button>
          ),
          contrato: b.contratoNumero,
          banco: b.banco,
          venc: formatDateBR(b.vencimento),
          valor: formatBRL(b.valor),
          status: <StatusPill tone="info">{b.status}</StatusPill>,
        }))}
      />

      <ModuleSection title="Arquivos de remessa">
        <DataTable
          columns={[
            { key: "nome", label: "Arquivo" },
            { key: "quando", label: "Criado" },
            { key: "qtd", label: "Qtd" },
            { key: "status", label: "Status" },
          ]}
          rows={state.remittances.map((r) => ({
            nome: r.nome,
            quando: r.criadoEm,
            qtd: r.qtd,
            status: <StatusPill tone="neutral">{r.status}</StatusPill>,
          }))}
        />
      </ModuleSection>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `Boleto ${selected.nossoNumero}` : ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Contrato" value={selected.contratoNumero} />
            <DetailRow label="Banco" value={selected.banco} />
            <DetailRow label="Valor" value={formatBRL(selected.valor)} />
            <DetailRow label="Vencimento" value={formatDateBR(selected.vencimento)} />
            <DetailRow label="Status" value={selected.status} />
            <DetailRow label="Remessa" value={selected.remessaId ?? "—"} />
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
