"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  Field,
  FilterBar,
  FormSheet,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { SearchSelect } from "@/components/app/SearchSelect";
import { canApprove } from "@/lib/alcadas/check";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { useObras } from "@/lib/store/obras-store";
import type {
  CentroFin,
  CondicaoPagamento,
  FormaPagamento,
  Pagamento,
  PagamentoStatus,
} from "@/lib/domain/financeiro-types";

type Situacao = "todos" | "em_aberto" | "vencidos" | "pagos";

export default function PagamentosPage() {
  const {
    state,
    categoriaNome,
    addLancamento,
    baixarPagamento,
    estornarPagamento,
    conciliarPagamento,
    desconciliarPagamento,
    baixarPagamentosLote,
    conciliarPagamentosLote,
    setPagamentoStatus,
  } = useFinanceiro();
  const { currentUser, state: f1 } = useFase1();
  const { state: obrasState } = useObras();
  const perfilNome =
    f1.profiles.find((p) => p.id === currentUser?.profileId)?.nome ?? "—";
  const tiposRetencao =
    f1.lookups
      .find((l) => l.codigo === "tipos_retencao")
      ?.itens.filter((i) => i.ativo) ?? [];

  const STATUS_COLS = [
    { id: "em_aberto", label: "Em aberto" },
    { id: "vencido", label: "Vencido" },
    { id: "parcial", label: "Parcial" },
    { id: "pago", label: "Pago" },
  ];

  const toCard = useCallback(
    (p: Pagamento) => ({
      id: p.id,
      columnId: p.status,
      title: p.favorecido,
      subtitle: p.descricao,
      badge: formatBRL(p.valor),
      meta: formatDateBR(p.vencimento),
    }),
    []
  );
  const [q, setQ] = useState("");
  const [sit, setSit] = useState<Situacao>("todos");
  const [selected, setSelected] = useState<Pagamento | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    descricao: "",
    favorecido: "",
    categoriaId: "",
    competencia: new Date().toISOString().slice(0, 7) + "-01",
    vencimento: new Date().toISOString().slice(0, 10),
    pagador: "Empresa",
    contaId: "",
    valor: 1000,
    forma: "pix" as FormaPagamento,
    condicao: "a_vista" as CondicaoPagamento,
    parcelas: 2,
    centroTipo: "obra" as "obra" | "empresa",
    obraId: "",
    centroLabel: "",
    usarRateio: false,
    rateioMode: "pct" as "pct" | "valor",
    rateios: [
      { obraId: "", label: "", pct: 60, valor: 600 },
      { obraId: "", label: "Empresa", pct: 40, valor: 400, empresa: true },
    ] as {
      obraId: string;
      label: string;
      pct: number;
      valor: number;
      empresa?: boolean;
    }[],
    usarRetencao: false,
    retencaoTipo: "",
    retencaoValor: 0,
    observacoes: "",
    marcarPago: false,
  });

  const filtered = useMemo(() => {
    let list = state.pagamentos;
    if (sit === "em_aberto") {
      list = list.filter((p) => p.status === "em_aberto" || p.status === "parcial");
    } else if (sit === "vencidos") {
      list = list.filter((p) => p.status === "vencido");
    } else if (sit === "pagos") {
      list = list.filter((p) => p.status === "pago");
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((p) =>
        [
          p.favorecido,
          p.descricao,
          p.centroLabel,
          categoriaNome(p.categoriaId),
          p.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [state.pagamentos, sit, q, categoriaNome]);

  const totais = useMemo(() => {
    const pago = filtered
      .filter((p) => p.status === "pago")
      .reduce((a, p) => a + p.valorPago, 0);
    const aberto = filtered
      .filter((p) => p.status !== "pago")
      .reduce((a, p) => a + (p.valor - p.valorPago), 0);
    return {
      pago,
      aberto,
      total: filtered.reduce((a, p) => a + p.valor, 0),
    };
  }, [filtered]);

  const live = selected
    ? state.pagamentos.find((p) => p.id === selected.id) ?? selected
    : null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Pagamentos"
        description="Kanban | Lista (C19) — lançamento, baixa parcial e estorno."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/recebimentos">Recebimentos</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/contas">Contas</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Novo lançamento
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Em aberto", value: formatBRL(totais.aberto) },
          { label: "Pago", value: formatBRL(totais.pago) },
          { label: "Total lista", value: formatBRL(totais.total) },
          {
            label: "Pré-lançamentos",
            value: state.preLancamentos.filter((p) => p.status === "pendente")
              .length,
          },
        ]}
      />

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["todos", "Todos"],
            ["em_aberto", "Em aberto"],
            ["vencidos", "Vencidos"],
            ["pagos", "Pagos"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSit(id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              sit === id
                ? "bg-brand-green text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <FilterBar value={q} onChange={setQ} placeholder="Buscar pagamento…" />

      <ProcessBoard
        storageKey="pagamentos"
        columns={STATUS_COLS}
        rows={filtered}
        toCard={toCard}
        columnTotals={(_, items) => items.reduce((a, p) => a + p.valor, 0)}
        onOpen={(id) =>
          setSelected(state.pagamentos.find((p) => p.id === id) ?? null)
        }
        onMove={(id, to) => {
          const ok = setPagamentoStatus(id, to as PagamentoStatus);
          if (!ok) notify("Movimento não permitido");
          return ok;
        }}
        exportName="pagamentos"
        bulkActions={[
          {
            label: "Baixar seleção",
            onClick: (ids) => {
              const n = baixarPagamentosLote(ids);
              notify(n ? `${n} pagamento(s) baixados` : "Nenhum em aberto");
            },
          },
          {
            label: "Conciliar seleção",
            onClick: (ids) => {
              const gate = canApprove({
                rules: f1.approvalRules,
                tipo: "Conciliar",
                perfilNome,
              });
              if (!gate.ok) {
                notify("Alçada insuficiente", gate.reason);
                return;
              }
              const n = conciliarPagamentosLote(ids);
              notify(n ? `${n} conciliado(s)` : "Nenhum elegível");
            },
          },
        ]}
        listColumns={[
          {
            key: "venc",
            label: "Vencimento",
            filter: { type: "period" },
            getValue: (p) => p.vencimento,
            render: (p) => formatDateBR(p.vencimento),
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: STATUS_COLS.map((c) => ({
                value: c.id,
                label: c.label,
              })),
            },
            getValue: (p) => p.status,
            render: (p) => (
              <StatusPill
                tone={
                  p.status === "pago"
                    ? "ok"
                    : p.status === "vencido"
                      ? "danger"
                      : "info"
                }
              >
                {p.status}
              </StatusPill>
            ),
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (p) => p.valor,
            render: (p) => formatBRL(p.valor),
          },
          {
            key: "fav",
            label: "Favorecido",
            filter: { type: "text" },
            getValue: (p) => p.favorecido,
          },
          {
            key: "desc",
            label: "Descrição",
            filter: { type: "text" },
            getValue: (p) => p.descricao,
          },
          {
            key: "centro",
            label: "Centro",
            filter: { type: "text" },
            getValue: (p) => p.centroLabel,
          },
        ]}
      />

      <p className="text-xs text-muted-foreground">
        Links:{" "}
        <Link className="underline" href="/financeiro/pre-lancamentos">
          Pré-lançamentos
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/transferencias">
          Transferências
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/fluxo-de-caixa">
          Fluxo de caixa
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/resultados">
          Resultados
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/notas-fiscais">
          Notas
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/plano-contas">
          Plano / Categorias
        </Link>
      </p>

      <DetailSheet
        open={!!live}
        onOpenChange={(o) => !o && setSelected(null)}
        title={live ? `${live.favorecido} · ${live.parcela}` : ""}
      >
        {live ? (
          <div className="space-y-3">
            <DetailRow label="Valor" value={formatBRL(live.valor)} />
            <DetailRow label="Pago" value={formatBRL(live.valorPago)} />
            <DetailRow label="Status" value={live.status} />
            <DetailRow
              label="Vencimento"
              value={formatDateBR(live.vencimento)}
            />
            <DetailRow label="Centro" value={live.centroLabel} />
            <DetailRow
              label="Categoria"
              value={categoriaNome(live.categoriaId)}
            />
            {live.historico.length ? (
              <div>
                <div className="text-sm font-medium">Histórico</div>
                <ul className="text-xs text-muted-foreground">
                  {live.historico.map((h, i) => (
                    <li key={i}>
                      {formatDateBR(h.data)} · {formatBRL(h.valor)} · {h.forma}{" "}
                      · {h.quem}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-2">
              {live.status !== "pago" ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      const resto = live.valor - live.valorPago;
                      baixarPagamento(live.id, resto);
                      notify("Pago integral");
                    }}
                  >
                    Pagar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const parcial = Math.round(live.valor * 0.5 * 100) / 100;
                      baixarPagamento(live.id, parcial);
                      notify(`Baixa parcial ${formatBRL(parcial)}`);
                    }}
                  >
                    Baixa 50%
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const gate = canApprove({
                      rules: f1.approvalRules,
                      tipo: "Estorno de recebimento",
                      perfilNome,
                    });
                    if (!gate.ok) {
                      notify("Alçada insuficiente", gate.reason);
                      return;
                    }
                    estornarPagamento(live.id);
                    notify("Estornado");
                  }}
                >
                  Estornar
                </Button>
              )}
              {!live.conciliado && live.status === "pago" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const gate = canApprove({
                      rules: f1.approvalRules,
                      tipo: "Conciliação bancária",
                      perfilNome,
                    });
                    if (!gate.ok) {
                      notify("Alçada insuficiente", gate.reason);
                      return;
                    }
                    conciliarPagamento(live.id);
                    notify("Conciliado");
                  }}
                >
                  Conciliar
                </Button>
              ) : null}
              {live.conciliado ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const gate = canApprove({
                      rules: f1.approvalRules,
                      tipo: "Desconciliar",
                      perfilNome,
                    });
                    if (!gate.ok) {
                      notify("Alçada insuficiente", gate.reason);
                      return;
                    }
                    if (!desconciliarPagamento(live.id)) {
                      notify("Não foi possível desconciliar");
                      return;
                    }
                    notify("Desconciliado");
                  }}
                >
                  Desconciliar
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DetailSheet>

      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title="Criar lançamento"
        submitLabel="Confirmar Lançamento"
        wide
        onSubmit={() => {
          const contaId = form.contaId || state.contas[0]?.id;
          const categoriaId =
            form.categoriaId ||
            state.categorias.find((c) => c.nome === "Materiais")?.id ||
            state.categorias[0]?.id;
          if (!form.descricao || !form.favorecido || !contaId || !categoriaId) {
            notify("Preencha os campos obrigatórios");
            return;
          }
          let centros: CentroFin[];
          if (form.usarRateio) {
            const sumPct = form.rateios.reduce((a, r) => a + (r.pct || 0), 0);
            if (form.rateioMode === "pct" && Math.abs(sumPct - 100) > 0.01) {
              notify("Rateio inválido", "A soma dos % deve ser 100");
              return;
            }
            const sumVal = form.rateios.reduce((a, r) => a + (r.valor || 0), 0);
            if (
              form.rateioMode === "valor" &&
              Math.abs(sumVal - form.valor) > 0.01
            ) {
              notify(
                "Rateio inválido",
                "A soma dos valores deve igualar o total"
              );
              return;
            }
            centros = form.rateios
              .filter((r) => r.label.trim())
              .map((r) => ({
                tipo: r.empresa ? ("empresa" as const) : ("obra" as const),
                obraId: r.empresa ? undefined : r.obraId || undefined,
                label: r.label,
                pct:
                  form.rateioMode === "pct"
                    ? r.pct
                    : Math.round((r.valor / form.valor) * 10000) / 100,
                valor:
                  form.rateioMode === "valor"
                    ? r.valor
                    : Math.round(form.valor * (r.pct / 100) * 100) / 100,
              }));
          } else if (form.centroTipo === "empresa") {
            centros = [
              { tipo: "empresa", label: "Empresa", valor: form.valor },
            ];
          } else {
            const obra =
              obrasState.obras.find((o) => o.id === form.obraId) ??
              obrasState.obras[0];
            if (!obra && !form.centroLabel.trim()) {
              notify("Informe o centro de custo");
              return;
            }
            centros = [
              {
                tipo: "obra",
                obraId: obra?.id,
                label: form.centroLabel || obra?.nome || "Obra",
                valor: form.valor,
              },
            ];
          }
          if (!centros.length) {
            notify("Informe ao menos um centro de custo");
            return;
          }
          const r = addLancamento({
            descricao: form.descricao,
            favorecido: form.favorecido,
            categoriaId,
            competencia: form.competencia,
            vencimento: form.vencimento,
            pagador: form.pagador,
            contaId,
            valor: form.valor,
            forma: form.forma,
            condicao: form.condicao,
            parcelas: form.parcelas,
            centros,
            observacoes: form.observacoes || undefined,
            marcarPago: form.marcarPago,
            retencoes:
              form.usarRetencao && form.retencaoTipo && form.retencaoValor > 0
                ? [
                    {
                      tipo: form.retencaoTipo,
                      valor: form.retencaoValor,
                    },
                  ]
                : undefined,
          });
          if (!r.ok) {
            notify("Não foi possível criar (centro/categoria)");
            return;
          }
          notify(
            `Lançamento · ${r.pagamentos?.length ?? 0} pagamento(s)`
          );
          setOpen(false);
        }}
      >
        <Field label="Valor *">
          <Input
            type="number"
            value={form.valor}
            onChange={(e) =>
              setForm({ ...form, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        <Field label="Favorecido *">
          <Input
            value={form.favorecido}
            onChange={(e) => setForm({ ...form, favorecido: e.target.value })}
          />
        </Field>
        <Field label="Categoria *">
          <SearchSelect
            value={form.categoriaId}
            onChange={(categoriaId) => setForm({ ...form, categoriaId })}
            placeholder="Buscar categoria…"
            options={state.categorias
              .filter((c) => c.ativo)
              .map((c) => ({
                value: c.id,
                label: c.nome,
                meta: c.planoId,
              }))}
          />
        </Field>
        <Field label="Pagador *">
          <Input
            value={form.pagador}
            onChange={(e) => setForm({ ...form, pagador: e.target.value })}
          />
        </Field>
        <Field label="Conta *">
          <SearchSelect
            value={form.contaId}
            onChange={(contaId) => setForm({ ...form, contaId })}
            placeholder="Buscar conta…"
            options={state.contas
              .filter((c) => c.ativa)
              .map((c) => ({
                value: c.id,
                label: c.nome,
                meta: c.banco,
              }))}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Competência *">
            <Input
              type="date"
              value={form.competencia}
              onChange={(e) =>
                setForm({ ...form, competencia: e.target.value })
              }
            />
          </Field>
          <Field label="Vencimento *">
            <Input
              type="date"
              value={form.vencimento}
              onChange={(e) =>
                setForm({ ...form, vencimento: e.target.value })
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Forma">
            <select
              className={fieldControlClass}
              value={form.forma}
              onChange={(e) =>
                setForm({
                  ...form,
                  forma: e.target.value as FormaPagamento,
                })
              }
            >
              <option value="pix">Pix</option>
              <option value="boleto">Boleto</option>
              <option value="transferencia">Transferência</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="permuta">Permuta</option>
            </select>
          </Field>
          <Field label="Condição">
            <select
              className={fieldControlClass}
              value={form.condicao}
              onChange={(e) =>
                setForm({
                  ...form,
                  condicao: e.target.value as CondicaoPagamento,
                })
              }
            >
              <option value="a_vista">À vista</option>
              <option value="parcelado">Parcelado</option>
              <option value="recorrente">Recorrente</option>
            </select>
          </Field>
        </div>
        {form.condicao === "parcelado" ? (
          <Field label="Parcelas *">
            <Input
              type="number"
              value={form.parcelas}
              onChange={(e) =>
                setForm({
                  ...form,
                  parcelas: Math.max(2, Number(e.target.value) || 2),
                })
              }
            />
          </Field>
        ) : null}

        <div className="space-y-2 rounded-lg border border-linha p-3">
          <p className="text-sm font-medium">Centro de custo</p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.usarRateio}
              onChange={(e) =>
                setForm({ ...form, usarRateio: e.target.checked })
              }
            />
            Adicionar obras (rateio)
          </label>
          {!form.usarRateio ? (
            <>
              <Field label="Apropriar por">
                <select
                  className={fieldControlClass}
                  value={form.centroTipo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      centroTipo: e.target.value as "obra" | "empresa",
                    })
                  }
                >
                  <option value="obra">Obra</option>
                  <option value="empresa">Empresa</option>
                </select>
              </Field>
              {form.centroTipo === "obra" ? (
                <Field label="Obra *">
                  <SearchSelect
                    value={form.obraId}
                    onChange={(obraId) => {
                      const o = obrasState.obras.find((x) => x.id === obraId);
                      setForm({
                        ...form,
                        obraId,
                        centroLabel: o?.nome ?? form.centroLabel,
                      });
                    }}
                    placeholder="Buscar obra…"
                    options={obrasState.obras.map((o) => ({
                      value: o.id,
                      label: o.nome,
                      meta: o.codigo,
                    }))}
                  />
                </Field>
              ) : null}
            </>
          ) : (
            <div className="space-y-2">
              <Field label="Rateio por">
                <select
                  className={fieldControlClass}
                  value={form.rateioMode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rateioMode: e.target.value as "pct" | "valor",
                    })
                  }
                >
                  <option value="pct">Percentual (%)</option>
                  <option value="valor">Valor (R$)</option>
                </select>
              </Field>
              {form.rateios.map((r, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_5rem_auto] items-end gap-2"
                >
                  <Field label={r.empresa ? "Empresa" : `Obra ${idx + 1}`}>
                    {r.empresa ? (
                      <Input value="Empresa" disabled />
                    ) : (
                      <SearchSelect
                        value={r.obraId}
                        onChange={(obraId) => {
                          const o = obrasState.obras.find(
                            (x) => x.id === obraId
                          );
                          const next = [...form.rateios];
                          next[idx] = {
                            ...r,
                            obraId,
                            label: o?.nome ?? "",
                          };
                          setForm({ ...form, rateios: next });
                        }}
                        placeholder="Obra…"
                        options={obrasState.obras.map((o) => ({
                          value: o.id,
                          label: o.nome,
                        }))}
                      />
                    )}
                  </Field>
                  <Field label={form.rateioMode === "pct" ? "%" : "R$"}>
                    <Input
                      type="number"
                      value={
                        form.rateioMode === "pct" ? r.pct : r.valor
                      }
                      onChange={(e) => {
                        const n = Number(e.target.value) || 0;
                        const next = [...form.rateios];
                        next[idx] =
                          form.rateioMode === "pct"
                            ? { ...r, pct: n }
                            : { ...r, valor: n };
                        setForm({ ...form, rateios: next });
                      }}
                    />
                  </Field>
                  {!r.empresa ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setForm({
                          ...form,
                          rateios: form.rateios.filter((_, i) => i !== idx),
                        })
                      }
                    >
                      ×
                    </Button>
                  ) : (
                    <span className="h-9 w-8" />
                  )}
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm({
                    ...form,
                    rateios: [
                      ...form.rateios.filter((x) => !x.empresa),
                      {
                        obraId: "",
                        label: "",
                        pct: 0,
                        valor: 0,
                      },
                      ...form.rateios.filter((x) => x.empresa),
                    ],
                  })
                }
              >
                Adicionar obra
              </Button>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.usarRetencao}
            onChange={(e) =>
              setForm({ ...form, usarRetencao: e.target.checked })
            }
          />
          Retenções
        </label>
        {form.usarRetencao ? (
          <div className="grid grid-cols-2 gap-2">
            <Field label="Tipo de retenção">
              <select
                className={fieldControlClass}
                value={form.retencaoTipo}
                onChange={(e) =>
                  setForm({ ...form, retencaoTipo: e.target.value })
                }
              >
                <option value="">Selecione</option>
                {tiposRetencao.map((t) => (
                  <option key={t.codigo} value={t.nome}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Valor">
              <Input
                type="number"
                value={form.retencaoValor}
                onChange={(e) =>
                  setForm({
                    ...form,
                    retencaoValor: Number(e.target.value) || 0,
                  })
                }
              />
            </Field>
          </div>
        ) : null}

        <Field label="Observações">
          <Input
            value={form.observacoes}
            onChange={(e) =>
              setForm({ ...form, observacoes: e.target.value })
            }
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.marcarPago}
            onChange={(e) =>
              setForm({ ...form, marcarPago: e.target.checked })
            }
          />
          Marcar como pago
        </label>
      </FormSheet>
    </div>
  );
}
