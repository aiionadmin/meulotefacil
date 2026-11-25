"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import type { Installment } from "@/lib/domain/carteira-types";

export default function CarteiraPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
      <CarteiraInner />
    </Suspense>
  );
}

function CarteiraInner() {
  const {
    state,
    refreshEncargos,
    baixarParcela,
    estornarParcela,
    saldoDevedor,
  } = useCarteira();
  const search = useSearchParams();
  const contratoQ = search.get("contrato") ?? "";
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Installment | null>(null);

  useEffect(() => {
    refreshEncargos("2026-11-24");
  }, [refreshEncargos]);

  const filtered = useMemo(() => {
    let list = state.installments;
    if (contratoQ) list = list.filter((p) => p.contractId === contratoQ);
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((p) =>
        [p.contratoNumero, p.compradorNome, p.status, String(p.n), p.tipo]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [state.installments, q, contratoQ]);

  const aberto = state.installments
    .filter((p) => p.status !== "paga" && p.status !== "cancelada")
    .reduce(
      (a, p) =>
        a + p.valor + p.juros + p.multa + p.correcao + p.despesaBancaria - p.desconto,
      0
    );
  const vencidas = state.installments.filter((p) => p.status === "vencida").length;
  const contratoFiltro = state.contracts.find((c) => c.id === contratoQ);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Ficha financeira"
        description="Fase 3–4 — parcelas, encargos §11.3, recebimento no caixa."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/contratos">Contratos</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                refreshEncargos("2026-11-24");
                notify("Encargos recalculados", "consulta 24/11/2026");
              }}
            >
              Recalcular atraso
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const alvo = state.installments.find(
                  (p) => p.status === "vencida" || p.status === "em_aberto"
                );
                if (!alvo) {
                  notify("Nenhuma parcela em aberto");
                  return;
                }
                baixarParcela(alvo.id);
                notify("Recebimento no caixa", `${alvo.contratoNumero} · ${alvo.n}`);
              }}
            >
              Registrar pagamento
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "A receber", value: formatBRL(aberto) },
          { label: "Vencidas", value: vencidas },
          { label: "Saldo caixa", value: formatBRL(state.caixaSaldo) },
          {
            label: contratoFiltro ? `Saldo ${contratoFiltro.numero}` : "Contratos",
            value: contratoFiltro
              ? formatBRL(saldoDevedor(contratoFiltro.id))
              : state.contracts.length,
          },
        ]}
      />

      <FilterBar
        value={q}
        onChange={setQ}
        placeholder="Buscar contrato, comprador, parcela…"
      >
        {contratoQ ? (
          <Button size="sm" variant="ghost" asChild>
            <Link href="/carteira">Limpar filtro contrato</Link>
          </Button>
        ) : null}
      </FilterBar>

      <DataTable
        columns={[
          { key: "contrato", label: "Contrato" },
          { key: "comprador", label: "Comprador" },
          { key: "n", label: "Nº" },
          { key: "vencimento", label: "Vencimento" },
          { key: "valor", label: "Valor" },
          { key: "encargos", label: "Juros+Multa" },
          { key: "status", label: "Status" },
        ]}
        rows={filtered.map((p) => ({
          contrato: (
            <button
              type="button"
              className="font-medium hover:text-brand-orange"
              onClick={() => setSelected(p)}
            >
              {p.contratoNumero}
            </button>
          ),
          comprador: p.compradorNome,
          n: `${p.tipo} ${p.n}`,
          vencimento: formatDateBR(p.vencimento),
          valor: formatBRL(p.valor),
          encargos: formatBRL(p.juros + p.multa),
          status: (
            <StatusPill
              tone={
                p.status === "paga"
                  ? "ok"
                  : p.status === "vencida"
                    ? "danger"
                    : "warn"
              }
            >
              {p.status.replace("_", " ")}
            </StatusPill>
          ),
        }))}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={
          selected
            ? `Parcela ${selected.n} · Contrato ${selected.contratoNumero}`
            : ""
        }
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Tipo" value={selected.tipo} />
            <DetailRow label="Vencimento" value={formatDateBR(selected.vencimento)} />
            <DetailRow label="Valor" value={formatBRL(selected.valor)} />
            <DetailRow label="Juros" value={formatBRL(selected.juros)} />
            <DetailRow label="Multa" value={formatBRL(selected.multa)} />
            <DetailRow
              label="Total"
              value={formatBRL(
                selected.valor +
                  selected.juros +
                  selected.multa +
                  selected.correcao +
                  selected.despesaBancaria -
                  selected.desconto
              )}
            />
            <DetailRow label="Nosso número" value={selected.nossoNumero ?? "—"} />
            <div className="flex gap-2 pt-3">
              {selected.status !== "paga" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    baixarParcela(selected.id);
                    notify("Parcela baixada no caixa");
                    setSelected(null);
                  }}
                >
                  Baixar
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    estornarParcela(selected.id);
                    notify("Estorno registrado");
                    setSelected(null);
                  }}
                >
                  Estornar
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
