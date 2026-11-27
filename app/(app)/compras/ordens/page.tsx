"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  FilterBar,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { canApprove } from "@/lib/alcadas/check";
import {
  notifyStub,
  sendOcEmailStub,
  sendOcWhatsAppStub,
} from "@/lib/integrations";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useCompras } from "@/lib/store/compras-store";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import { useFase1 } from "@/lib/store/fase1-store";
import type { OcAprovacao, OrdemCompra } from "@/lib/domain/compras-types";

const APROV_COLS: { id: OcAprovacao; label: string }[] = [
  { id: "aguardando_aprovacao", label: "Aguardando" },
  { id: "em_aberto", label: "Em aberto" },
  { id: "negociando", label: "Negociando" },
  { id: "aprovado", label: "Aprovado" },
  { id: "negado", label: "Negado" },
];

export default function OrdensCompraPage() {
  const {
    state,
    aprovarOrdem,
    negarOrdem,
    marcarOcEntregue,
    aprovarOrdensLote,
    negarOrdensLote,
  } = useCompras();
  const { state: fin, addLancamento } = useFinanceiro();
  const { currentUser, state: f1 } = useFase1();
  const perfilNome =
    f1.profiles.find((p) => p.id === currentUser?.profileId)?.nome ?? "—";
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<OrdemCompra | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.ordens;
    return state.ordens.filter((o) =>
      [o.numero, o.fornecedor, o.descricao, o.centro.label]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.ordens, q]);

  const totais = useMemo(() => {
    const by = (st: string) =>
      state.ordens
        .filter((o) => o.aprovacaoStatus === st)
        .reduce((a, o) => a + o.valor, 0);
    return {
      total: state.ordens.reduce((a, o) => a + o.valor, 0),
      aprovado: by("aprovado"),
      aguardando: by("aguardando_aprovacao"),
    };
  }, [state.ordens]);

  const toCard = useCallback(
    (o: OrdemCompra) => ({
      id: o.id,
      columnId: o.aprovacaoStatus,
      title: o.numero,
      subtitle: o.fornecedor,
      badge: formatBRL(o.valor),
      meta: o.centro.label,
    }),
    []
  );

  const live = selected
    ? state.ordens.find((o) => o.id === selected.id) ?? selected
    : null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Ordem de Compra"
        description="Aprovação por alçada; padrão bloqueia OC sem cotação. Gera lançamento a pagar."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/compras/solicitacoes">Solicitação</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/compras/cotacoes">Cotação</Link>
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Ordens", value: state.ordens.length },
          { label: "Total", value: formatBRL(totais.total) },
          { label: "Aprovado", value: formatBRL(totais.aprovado) },
          {
            label: "Aguardando",
            value: formatBRL(totais.aguardando),
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar OC…" />

      <ProcessBoard
        storageKey="ordens-compra"
        columns={APROV_COLS}
        rows={filtered}
        toCard={toCard}
        columnTotals={(_, items) => items.reduce((a, o) => a + o.valor, 0)}
        onOpen={(id) =>
          setSelected(state.ordens.find((o) => o.id === id) ?? null)
        }
        onMove={() => {
          notify("Use Aprovar / Negar no detalhe ou em lote");
          return false;
        }}
        exportName="ordens-compra"
        bulkActions={[
          {
            label: "Aprovar seleção",
            onClick: (ids) => {
              const gate = canApprove({
                rules: f1.approvalRules,
                tipo: "Ordem de compra",
                perfilNome,
              });
              if (!gate.ok) {
                notify("Alçada insuficiente", gate.reason);
                return;
              }
              const n = aprovarOrdensLote(ids);
              notify(n ? `${n} OC aprovada(s)` : "Nenhuma aguardando");
            },
          },
          {
            label: "Negar seleção",
            tone: "danger",
            onClick: (ids) => {
              const n = negarOrdensLote(ids);
              notify(n ? `${n} OC negada(s)` : "Nenhuma aguardando");
            },
          },
        ]}
        listColumns={[
          {
            key: "numero",
            label: "Nº",
            filter: { type: "text" },
            getValue: (o) => o.numero,
          },
          {
            key: "forn",
            label: "Fornecedor",
            filter: { type: "text" },
            getValue: (o) => o.fornecedor,
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (o) => o.valor,
            render: (o) => formatBRL(o.valor),
          },
          {
            key: "centro",
            label: "Centro",
            filter: { type: "text" },
            getValue: (o) => o.centro.label,
          },
          {
            key: "criacao",
            label: "Criação",
            filter: { type: "period" },
            getValue: (o) => o.criadoEm,
            render: (o) => formatDateBR(o.criadoEm),
          },
          {
            key: "aprov",
            label: "Aprovação",
            filter: {
              type: "status",
              options: APROV_COLS.map((c) => ({
                value: c.id,
                label: c.label,
              })),
            },
            getValue: (o) => o.aprovacaoStatus,
            render: (o) => (
              <StatusPill tone="info">
                {o.aprovacaoStatus.replace(/_/g, " ")}
              </StatusPill>
            ),
          },
          {
            key: "compra",
            label: "Compra",
            filter: { type: "text" },
            getValue: (o) => o.compraStatus,
            render: (o) => (
              <StatusPill tone="ok">
                {o.compraStatus.replace(/_/g, " ")}
              </StatusPill>
            ),
          },
        ]}
      />

      {!state.config.permitirOcSemCotacao ? (
        <p className="text-xs text-muted-foreground">
          Configuração: OC sem cotação não permitida.
        </p>
      ) : null}

      <DetailSheet
        open={!!live}
        onOpenChange={(o) => !o && setSelected(null)}
        title={live?.numero ?? ""}
      >
        {live ? (
          <div className="space-y-3">
            <DetailRow label="Fornecedor" value={live.fornecedor} />
            <DetailRow label="Centro" value={live.centro.label} />
            <DetailRow label="Valor" value={formatBRL(live.valor)} />
            <DetailRow
              label="Cotação"
              value={
                state.cotacoes.find((c) => c.id === live.quotationId)?.numero ??
                "—"
              }
            />
            <DetailRow
              label="Aprovação"
              value={live.aprovacaoStatus.replace(/_/g, " ")}
            />
            <DetailRow
              label="Compra"
              value={live.compraStatus.replace(/_/g, " ")}
            />
            {live.payableId ? (
              <DetailRow label="Lançamento" value={live.payableId} />
            ) : null}
            <div className="text-sm font-medium">Itens</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {live.itens.map((it) => (
                <li key={it.id}>
                  {it.descricao} · {it.quantidade} {it.unidade} ×{" "}
                  {formatBRL(it.valorUnitario)} = {formatBRL(it.valor)}
                </li>
              ))}
            </ul>
            <div className="text-xs text-muted-foreground">
              + Frete {formatBRL(live.frete)} · + Despesas{" "}
              {formatBRL(live.outrasDespesas)} · + Impostos{" "}
              {formatBRL(live.impostos)} · − Desc. {formatBRL(live.desconto)}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {live.aprovacaoStatus === "aguardando_aprovacao" ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      const gate = canApprove({
                        rules: f1.approvalRules,
                        tipo: "Ordem de compra",
                        valor:
                          live.valor +
                          live.frete +
                          live.outrasDespesas +
                          live.impostos -
                          live.desconto,
                        perfilNome,
                        centroTipo: live.centro.tipo,
                      });
                      if (!gate.ok) {
                        notify("Alçada insuficiente", gate.reason);
                        return;
                      }
                      const r = aprovarOrdem(live.id);
                      if (!r.ok) {
                        notify(
                          live.quotationId
                            ? "Não foi possível aprovar"
                            : "OC sem cotação bloqueada"
                        );
                        return;
                      }
                      if (r.payable) {
                        const cat =
                          fin.categorias.find((c) =>
                            /compra|insumo|material/i.test(c.nome)
                          ) ?? fin.categorias[0];
                        const conta = fin.contas[0];
                        if (cat && conta) {
                          const lan = addLancamento({
                            descricao: r.payable.descricao,
                            favorecido: r.payable.favorecido,
                            categoriaId: cat.id,
                            competencia: new Date()
                              .toISOString()
                              .slice(0, 7),
                            vencimento: new Date()
                              .toISOString()
                              .slice(0, 10),
                            pagador: "Meu Lote Fácil",
                            contaId: conta.id,
                            valor: r.payable.valor,
                            forma: "boleto",
                            condicao: "a_vista",
                            centros: [
                              live.centro.tipo === "obra"
                                ? {
                                    tipo: "obra" as const,
                                    obraId: live.centro.obraId,
                                    label: live.centro.label,
                                  }
                                : {
                                    tipo: "empresa" as const,
                                    label: live.centro.label,
                                  },
                            ],
                            numeroDoc: live.numero,
                          });
                          notify(
                            lan.ok
                              ? `Aprovada · lançamento ${formatBRL(r.payable.valor)}`
                              : `Aprovada · a pagar ${formatBRL(r.payable.valor)}`
                          );
                        } else {
                          notify(
                            `Aprovada · a pagar ${formatBRL(r.payable.valor)}`
                          );
                        }
                      } else {
                        notify("Aprovada");
                      }
                      setSelected(null);
                    }}
                  >
                    Aprovar + lançamento
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      negarOrdem(live.id);
                      notify("OC negada");
                      setSelected(null);
                    }}
                  >
                    Negar
                  </Button>
                </>
              ) : null}
              {live.aprovacaoStatus === "aprovado" &&
              live.compraStatus !== "entregue_total" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    marcarOcEntregue(live.id, false);
                    notify("Entrega total");
                    setSelected(null);
                  }}
                >
                  Marcar entregue
                </Button>
              ) : null}
              {live.aprovacaoStatus === "aprovado" ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob(
                        [
                          `Ordem de Compra ${live.numero}\n`,
                          `Fornecedor: ${live.fornecedor}\n`,
                          `Valor: ${live.valor}\n`,
                          `Centro: ${live.centro.label}\n`,
                        ],
                        { type: "application/pdf" }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${live.numero}.pdf`;
                      a.click();
                      URL.revokeObjectURL(url);
                      notify("PDF gerado", live.numero);
                    }}
                  >
                    Imprimir PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const r = sendOcWhatsAppStub({
                        ordemId: live.id,
                        numero: live.numero,
                      });
                      const n = notifyStub(r, "WhatsApp OC");
                      notify(n.title, n.description);
                    }}
                  >
                    Enviar WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const r = sendOcEmailStub({
                        ordemId: live.id,
                        numero: live.numero,
                      });
                      const n = notifyStub(r, "E-mail OC");
                      notify(n.title, n.description);
                    }}
                  >
                    Enviar e-mail
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
