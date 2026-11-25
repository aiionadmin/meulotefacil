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
import { resolveInstallmentStatus } from "@/lib/money/installment-status";
import { aReceberContratos } from "@/lib/indicators/receivables";
import { statusLabel } from "@/lib/status/labels";
import { paginate } from "@/lib/ui/pagination";

const CONSULTA = "2026-11-24";

type RowView = Installment & {
  statusResolved: string;
  valorOriginal: number;
  valorAtualizado: number;
};

export default function CarteiraPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}
    >
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
  const [selected, setSelected] = useState<RowView | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverPage, setServerPage] = useState<{
    items: RowView[];
    total: number;
    elapsedMs: number;
  } | null>(null);

  useEffect(() => {
    refreshEncargos(CONSULTA);
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

  // B18 — se filtro de contrato e volume alto, usa API paginada com encargos só da página
  useEffect(() => {
    let cancelled = false;
    if (!contratoQ || filtered.length < 50) {
      setServerPage(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      contractId: contratoQ,
      page: String(page),
      pageSize: "20",
      consulta: CONSULTA,
    });
    fetch(`/api/carteira/parcelas?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Falha ao carregar parcelas");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setServerPage({
          items: (data.items as Array<Installment & {
            valorOriginal: number;
            valorAtualizado: number;
            status: string;
          }>).map((p) => ({
            ...p,
            statusResolved: p.status,
            valorOriginal: p.valorOriginal,
            valorAtualizado: p.valorAtualizado,
          })),
          total: data.total,
          elapsedMs: data.elapsedMs,
        });
        setLoading(false);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contratoQ, filtered.length, page]);

  const views: RowView[] = useMemo(() => {
    if (serverPage) return serverPage.items;
    const pageData = paginate(filtered, page, 20);
    return pageData.items.map((p) => {
      const view = resolveInstallmentStatus({
        status: p.status,
        valor: p.valor,
        vencimento: p.vencimento,
        consulta: CONSULTA,
        taxaMoraMes: 0.01,
        taxaMulta: 0.02,
      });
      return {
        ...p,
        status: view.status,
        statusResolved: view.status,
        valorOriginal: view.valorOriginal,
        valorAtualizado: view.valorAtualizado,
        juros: view.juros,
        multa: view.multa,
      };
    });
  }, [filtered, page, serverPage]);

  const aberto = aReceberContratos(state.installments);
  const vencidas = state.installments.filter((p) => {
    const v = resolveInstallmentStatus({
      status: p.status,
      valor: p.valor,
      vencimento: p.vencimento,
      consulta: CONSULTA,
    });
    return v.status === "vencida";
  }).length;
  const contratoFiltro = state.contracts.find((c) => c.id === contratoQ);
  const totalRows = serverPage?.total ?? filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / 20));

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Ficha financeira"
        description="Parcelas, encargos e recebimento no caixa."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/contratos">Contratos</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                refreshEncargos(CONSULTA);
                notify("Encargos recalculados", "consulta 24/11/2026");
              }}
            >
              Recalcular atraso
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const alvo = state.installments.find((p) => {
                  const v = resolveInstallmentStatus({
                    status: p.status,
                    valor: p.valor,
                    vencimento: p.vencimento,
                    consulta: CONSULTA,
                  });
                  return v.status === "vencida" || v.status === "em_aberto";
                });
                if (!alvo) {
                  notify("Nenhuma parcela em aberto");
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
          { label: "A receber de contratos", value: formatBRL(aberto) },
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
      </FilterBar>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando parcelas…</p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive">Erro: {error}</p>
      ) : null}
      {serverPage ? (
        <p className="text-xs text-muted-foreground">
          Encargos calculados só nesta página · {Math.round(serverPage.elapsedMs)}{" "}
          ms
        </p>
      ) : null}

      <DataTable
        paginate={false}
        columns={[
          { key: "contrato", label: "Contrato" },
          { key: "comprador", label: "Comprador" },
          { key: "n", label: "Nº" },
          { key: "vencimento", label: "Vencimento" },
          { key: "original", label: "Valor original" },
          { key: "atualizado", label: "Valor atualizado" },
          { key: "status", label: "Status" },
        ]}
        rows={views.map((p) => ({
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
          original: formatBRL(p.valorOriginal),
          atualizado: formatBRL(p.valorAtualizado),
          status: (
            <StatusPill
              tone={
                p.statusResolved === "paga"
                  ? "ok"
                  : p.statusResolved === "vencida"
                    ? "danger"
                    : "warn"
              }
            >
              {statusLabel(p.statusResolved)}
            </StatusPill>
          ),
        }))}
      />

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {totalRows} parcelas · página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}

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
            <DetailRow
              label="Valor original"
              value={formatBRL(selected.valorOriginal)}
            />
            <DetailRow
              label="Valor atualizado"
              value={formatBRL(selected.valorAtualizado)}
            />
            <DetailRow label="Juros" value={formatBRL(selected.juros)} />
            <DetailRow label="Multa" value={formatBRL(selected.multa)} />
            <DetailRow
              label="Status"
              value={statusLabel(selected.statusResolved)}
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
