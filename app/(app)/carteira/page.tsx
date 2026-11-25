"use client";

import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
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
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import type { Installment } from "@/lib/domain/carteira-types";
import {
  encargosParaPagina,
  paginateIds,
} from "@/lib/money/ficha-parcelas";

export default function CarteiraPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando ficha…</p>
      }
    >
      <CarteiraInner />
    </Suspense>
  );
}

function CarteiraInner() {
  const { state, baixarParcela, estornarParcela, saldoDevedor } = useCarteira();
  const search = useSearchParams();
  const contratoQ = search.get("contrato") ?? "";
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Installment | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [consulta] = useState("2026-11-24");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = window.setTimeout(() => {
      try {
        startTransition(() => setLoading(false));
      } catch {
        setError("Não foi possível montar a ficha financeira.");
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

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

  const paged = useMemo(
    () => paginateIds(filtered, { page, pageSize }),
    [filtered, page, pageSize]
  );

  const pageWithEncargos = useMemo(
    () =>
      encargosParaPagina(
        paged.items,
        (p) => {
          const ct = state.contracts.find((c) => c.id === p.contractId);
          if (!ct) return null;
          return {
            taxaMoraMes: ct.taxaMoraMes,
            taxaMulta: ct.multaPct,
            diasTolerancia: ct.diasTolerancia,
          };
        },
        consulta
      ),
    [paged.items, state.contracts, consulta]
  );

  useEffect(() => {
    if (paged.page !== page) setPage(paged.page);
  }, [paged.page, page]);

  const aberto = useMemo(
    () =>
      state.installments
        .filter((p) => p.status !== "paga" && p.status !== "cancelada")
        .reduce(
          (a, p) =>
            a +
            p.valor +
            p.juros +
            p.multa +
            p.correcao +
            p.despesaBancaria -
            p.desconto,
          0
        ),
    [state.installments]
  );
  const vencidas = state.installments.filter((p) => p.status === "vencida")
    .length;
  const contratoFiltro = state.contracts.find((c) => c.id === contratoQ);

  if (loading) {
    return (
      <div className="space-y-4 py-10">
        <p className="text-sm text-muted-foreground">
          Abrindo ficha financeira…
        </p>
        <div className="h-2 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 py-10">
        <p className="text-sm text-destructive">{error}</p>
        <Button size="sm" onClick={() => window.location.reload()}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Ficha financeira"
        description="Parcelas paginadas; encargos só da página visível. Sem travar a tela."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/contratos">Contratos</Link>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const alvo = pageWithEncargos.find(
                  (p) => p.status === "vencida" || p.status === "em_aberto"
                );
                if (!alvo) {
                  notify("Nenhuma parcela em aberto nesta página");
                  return;
                }
                baixarParcela(alvo.id);
                notify(
                  "Recebimento no caixa",
                  `${alvo.contratoNumero} · ${alvo.n}`
                );
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
            label: contratoFiltro
              ? `Saldo ${contratoFiltro.numero}`
              : "Contratos",
            value: contratoFiltro
              ? formatBRL(saldoDevedor(contratoFiltro.id))
              : state.contracts.length,
          },
        ]}
      />

      <FilterBar
        value={q}
        onChange={(v) => {
          setQ(v);
          setPage(1);
        }}
        placeholder="Buscar contrato, comprador, parcela…"
      >
        {contratoQ ? (
          <Button size="sm" variant="ghost" asChild>
            <Link href="/carteira">Limpar filtro contrato</Link>
          </Button>
        ) : null}
        {pending ? (
          <span className="text-xs text-muted-foreground">Atualizando…</span>
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
        rows={pageWithEncargos.map((p) => ({
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

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          {paged.total
            ? `${(paged.page - 1) * paged.pageSize + 1}–${Math.min(paged.page * paged.pageSize, paged.total)} de ${paged.total}`
            : "0 registros"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className={fieldControlClass + " h-8 w-auto py-1 text-xs"}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            aria-label="Itens por página"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / pág.
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={paged.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span>
            {paged.page}/{paged.pageCount}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={paged.page >= paged.pageCount}
            onClick={() => setPage((p) => Math.min(paged.pageCount, p + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>

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
            <DetailRow
              label="Vencimento"
              value={formatDateBR(selected.vencimento)}
            />
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
            <DetailRow
              label="Nosso número"
              value={selected.nossoNumero ?? "—"}
            />
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
