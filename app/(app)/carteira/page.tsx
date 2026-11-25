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
import { useDemoStore, type Parcela } from "@/lib/store/demo-store";

export default function CarteiraPage() {
  const { state, baixarParcela, estornarParcela } = useDemoStore();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Parcela | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.parcelas;
    return state.parcelas.filter((p) =>
      [p.contrato, p.comprador, p.status, p.n].join(" ").toLowerCase().includes(term)
    );
  }, [state.parcelas, q]);

  const aberto = state.parcelas
    .filter((p) => p.status !== "Paga")
    .reduce((acc, p) => acc + p.valor + p.encargos, 0);
  const caixa = state.contas.find((c) => c.tipo === "Caixa");

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Carteira e caixa"
        description="Parcelas, recebimento, encargos de mora/multa e posição da carteira."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const alvo = state.parcelas.find(
                (p) => p.status === "Vencida" || p.status === "Em aberto"
              );
              if (!alvo) {
                notify("Nenhuma parcela em aberto");
                return;
              }
              baixarParcela(alvo.id);
              notify("Recebimento no caixa", `${alvo.contrato} · ${alvo.n}`);
            }}
          >
            Registrar pagamento
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Em aberto (amostra)", value: brl(aberto) },
          {
            label: "Vencidas",
            value: state.parcelas.filter((p) => p.status === "Vencida").length,
          },
          {
            label: "Pagas",
            value: state.parcelas.filter((p) => p.status === "Paga").length,
          },
          {
            label: "Caixa operacional",
            value: brl(caixa?.saldo ?? 0),
          },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar parcela…" />
      <DataTable
        onRowClick={(i) => setSelected(filtered[i])}
        columns={[
          { key: "contrato", label: "Contrato" },
          { key: "comprador", label: "Comprador" },
          { key: "n", label: "Parcela" },
          { key: "vencimento", label: "Vencimento" },
          { key: "valor", label: "Valor" },
          { key: "encargos", label: "Encargos" },
          { key: "status", label: "Status" },
        ]}
        rows={filtered.map((p) => ({
          contrato: <span className="font-medium">{p.contrato}</span>,
          comprador: p.comprador,
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

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${selected.contrato} · ${selected.n}` : "Parcela"}
        footer={
          selected ? (
            selected.status === "Paga" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  estornarParcela(selected.id);
                  setSelected({ ...selected, status: "Em aberto" });
                  notify("Parcela estornada");
                }}
              >
                Estornar
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  baixarParcela(selected.id);
                  setSelected({ ...selected, status: "Paga", encargos: 0 });
                  notify("Baixa realizada", brl(selected.valor + selected.encargos));
                }}
              >
                Baixar no caixa
              </Button>
            )
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="Comprador" value={selected.comprador} />
            <DetailRow label="Tipo" value={selected.tipo} />
            <DetailRow label="Vencimento" value={selected.vencimento} />
            <DetailRow label="Valor" value={brl(selected.valor)} />
            <DetailRow label="Encargos" value={brl(selected.encargos)} />
            <DetailRow
              label="Total"
              value={brl(selected.valor + selected.encargos)}
            />
            <DetailRow label="Status" value={selected.status} />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
