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
import {
  EMPTY_GEO_EMP,
  GeoEmpFilters,
  developmentIdsMatching,
  type GeoEmpFilterValues,
} from "@/components/app/GeoEmpFilters";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import { useClientCard } from "@/lib/client/client-card-context";
import type { Installment } from "@/lib/domain/carteira-types";
import { resolveInstallmentStatus } from "@/lib/money/installment-status";
import { aReceberContratos } from "@/lib/indicators/receivables";
import { useEmpresa } from "@/lib/empresa/context";
import { statusLabel } from "@/lib/status/labels";
import { paginate } from "@/lib/ui/pagination";
import { downloadCsv } from "@/lib/export/list-export";
import { resolveContract } from "@/lib/financeiro/ficha-links";
import { FichaNavLinks } from "@/components/app/FichaNavLinks";

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
    updateInstallment,
    addInstallment,
    cancelarBoleto,
    estornarParcela,
    saldoDevedor,
  } = useCarteira();
  const { openClient } = useClientCard();
  const { filterByDevelopmentEmpresa } = useEmpresa();
  const search = useSearchParams();
  const contratoParam = search.get("contrato") ?? "";
  const numeroParam = search.get("numero") ?? "";
  const [q, setQ] = useState("");
  const [geo, setGeo] = useState<GeoEmpFilterValues>({ ...EMPTY_GEO_EMP });
  const [selected, setSelected] = useState<RowView | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverPage, setServerPage] = useState<{
    items: RowView[];
    total: number;
    elapsedMs: number;
  } | null>(null);

  // Só na montagem: `refreshEncargos` vem do api useMemo([state]) e
  // sempre gera novo state → dependência [refreshEncargos] = loop infinito
  // (Maximum update depth → UI “travada” sem cliques/teclado).
  useEffect(() => {
    refreshEncargos(CONSULTA);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  const contratoFiltroId = useMemo(() => {
    const c = resolveContract(
      state.contracts,
      contratoParam || numeroParam || null
    );
    return c?.id ?? (contratoParam || "");
  }, [state.contracts, contratoParam, numeroParam]);

  const filtered = useMemo(() => {
    const scoped = filterByDevelopmentEmpresa(
      state.installments.map((p) => {
        const c = state.contracts.find((x) => x.id === p.contractId);
        return { ...p, developmentId: c?.developmentId };
      }),
      state.developments
    ) as (Installment & { developmentId?: string })[];
    let list: Installment[] = scoped;
    const geoIds = developmentIdsMatching(state.developments, geo);
    if (geoIds) {
      list = list.filter((p) => {
        const c = state.contracts.find((x) => x.id === p.contractId);
        return c ? geoIds.has(c.developmentId) : false;
      });
    }
    if (contratoFiltroId)
      list = list.filter((p) => p.contractId === contratoFiltroId);
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
  }, [
    state.installments,
    state.contracts,
    state.developments,
    q,
    geo,
    contratoFiltroId,
    filterByDevelopmentEmpresa,
  ]);

  // B18 — se filtro de contrato e volume alto, usa API paginada com encargos só da página
  useEffect(() => {
    let cancelled = false;
    if (!contratoFiltroId || filtered.length < 50) {
      setServerPage(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      contractId: contratoFiltroId,
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
  }, [contratoFiltroId, filtered.length, page]);

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

  const aberto = aReceberContratos(filtered);
  const vencidas = filtered.filter((p) => {
    const v = resolveInstallmentStatus({
      status: p.status,
      valor: p.valor,
      vencimento: p.vencimento,
      consulta: CONSULTA,
    });
    return v.status === "vencida";
  }).length;
  const contratoFiltro = state.contracts.find((c) => c.id === contratoFiltroId);
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
                downloadCsv(
                  "ficha-financeira.csv",
                  [
                    "tipo",
                    "pagamento",
                    "vencimento",
                    "valor",
                    "juros",
                    "multa",
                    "correcao",
                    "despesa",
                    "numero",
                    "prestacao",
                    "status",
                  ],
                  views.map((p) => {
                    const totalParc = state.installments.filter(
                      (i) => i.contractId === p.contractId
                    ).length;
                    return [
                      p.tipo,
                      p.pagoEm ?? "",
                      p.vencimento,
                      p.valorOriginal,
                      p.juros,
                      p.multa,
                      p.correcao,
                      p.despesaBancaria,
                      p.nossoNumero ?? "",
                      `${p.n}/${totalParc}`,
                      p.statusResolved,
                    ];
                  })
                );
                notify("Ficha exportada");
              }}
            >
              Exportar Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!contratoFiltro}
              onClick={() => {
                if (!contratoFiltro) return;
                const ok = addInstallment({
                  contractId: contratoFiltro.id,
                  tipo: "Prestação",
                  vencimento: new Date().toISOString().slice(0, 10),
                  valor: 500,
                });
                notify(ok ? "Parcela incluída" : "Falha ao incluir");
              }}
            >
              Incluir parcela
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!contratoFiltro}
              onClick={() => {
                if (!contratoFiltro) return;
                openClient({
                  nome: contratoFiltro.compradorNome,
                  personId: contratoFiltro.compradorId,
                  contractId: contratoFiltro.id,
                  tab: "parcelas",
                });
              }}
            >
              Card do cliente
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
        <GeoEmpFilters
          developments={state.developments}
          value={geo}
          onChange={(next) => {
            setGeo(next);
            setPage(1);
          }}
        />
        {contratoFiltroId ? (
          <Button size="sm" variant="ghost" asChild>
            <Link href="/carteira">Limpar filtro contrato</Link>
          </Button>
        ) : null}
        {contratoFiltroId ? (
          <FichaNavLinks contractId={contratoFiltroId} />
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
        exportName="ficha-financeira"
        paginate={false}
        columns={[
          { key: "tipo", label: "Tipo" },
          { key: "pagoEm", label: "Pagamento" },
          { key: "vencimento", label: "Vencimento" },
          { key: "valor", label: "Valor" },
          { key: "juros", label: "Juros" },
          { key: "multa", label: "Multa" },
          { key: "correcao", label: "Correção" },
          { key: "desp", label: "Desp. bancária" },
          { key: "nosso", label: "Nº" },
          { key: "parc", label: "Prestação" },
          { key: "status", label: "Status" },
        ]}
        rows={views.map((p) => {
          const totalParc = state.installments.filter(
            (i) => i.contractId === p.contractId
          ).length;
          return {
            tipo: (
              <button
                type="button"
                className="font-medium hover:text-brand-orange"
                onClick={() => setSelected(p)}
              >
                {p.tipo}
              </button>
            ),
            pagoEm: p.pagoEm ? formatDateBR(p.pagoEm) : "—",
            vencimento: formatDateBR(p.vencimento),
            valor: formatBRL(p.valorOriginal),
            juros: formatBRL(p.juros),
            multa: formatBRL(p.multa),
            correcao: formatBRL(p.correcao),
            desp: formatBRL(p.despesaBancaria),
            nosso: p.nossoNumero ?? "—",
            parc: `${p.n} / ${totalParc}`,
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
          };
        })}
      />


      <p className="text-sm text-muted-foreground">
        Quantidade: {views.length} · Total pago:{" "}
        {formatBRL(
          views
            .filter((v) => v.statusResolved === "paga")
            .reduce((a, v) => a + v.valorOriginal, 0)
        )}{" "}
        · Em aberto:{" "}
        {formatBRL(
          views
            .filter((v) => v.statusResolved !== "paga")
            .reduce((a, v) => a + v.valorAtualizado, 0)
        )}
      </p>

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
              label="Correção monetária"
              value={formatBRL(selected.correcao)}
            />
            <DetailRow
              label="Despesa bancária"
              value={formatBRL(selected.despesaBancaria)}
            />
            <DetailRow
              label="Nosso número"
              value={selected.nossoNumero ?? "—"}
            />
            <DetailRow
              label="Pagamento"
              value={selected.pagoEm ? formatDateBR(selected.pagoEm) : "—"}
            />
            <FichaNavLinks
              contractId={selected.contractId}
              onBeforeNavigate={() => setSelected(null)}
              className="border-b border-linha pb-3"
            />
            <div className="flex flex-wrap gap-2 pt-3">
              {selected.status !== "paga" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    baixarParcela(selected.id);
                    notify("Parcela baixada no caixa");
                    setSelected(null);
                  }}
                >
                  Pagamento
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const d = new Date(selected.vencimento + "T12:00:00");
                  d.setDate(d.getDate() + 7);
                  updateInstallment(selected.id, {
                    vencimento: d.toISOString().slice(0, 10),
                  });
                  notify("Vencimento +7 dias");
                  setSelected(null);
                }}
              >
                Alterar vencimento
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const ok = cancelarBoleto(selected.id);
                  notify(
                    ok ? "Boleto cancelado" : "Sem boleto ativo",
                    selected.nossoNumero ?? ""
                  );
                }}
              >
                Cancelar boleto
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  notify("Recado", `Parcela ${selected.n} · ${selected.contratoNumero}`)
                }
              >
                Recado
              </Button>
            </div>
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
