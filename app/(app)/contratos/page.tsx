"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { SearchSelect } from "@/components/app/SearchSelect";
import {
  FORMAS_PAGAMENTO_VENDA,
  labelFormaPagamentoVenda,
  validatePermutaDescricao,
  type FormaPagamentoVenda,
} from "@/lib/domain/venda-pagamento";
import { formatBRL } from "@/lib/masks/br";
import { aReceberContratos } from "@/lib/indicators/receivables";
import { useEmpresa } from "@/lib/empresa/context";
import { useCarteira } from "@/lib/store/carteira-store";
import { useClientCard } from "@/lib/client/client-card-context";
import type { Contract } from "@/lib/domain/carteira-types";
import { carteiraContratoHref } from "@/lib/financeiro/ficha-links";
import {
  FichaFinanceiraButton,
  FichaNavLinks,
} from "@/components/app/FichaNavLinks";
import {
  EMPTY_GEO_EMP,
  GeoEmpFilters,
  developmentIdsMatching,
  type GeoEmpFilterValues,
} from "@/components/app/GeoEmpFilters";
import { useNovoParam } from "@/lib/ui/use-novo-param";
import { useSystemSettings } from "@/lib/store/system-settings-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { peopleIdOptions } from "@/lib/ui/people-options";


const STATUS_COLS = [
  { id: "ativo", label: "Ativo" },
  { id: "quitado", label: "Quitado" },
  { id: "cancelado", label: "Cancelado" },
  { id: "renegociado", label: "Renegociado" },
  { id: "transferido", label: "Transferido" },
  { id: "trocado", label: "Trocado" },
];

export default function ContratosPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}
    >
      <ContratosInner />
    </Suspense>
  );
}

function ContratosInner() {
  const { state, saldoDevedor, addContract, registrarOperacao } = useCarteira();
  const { indicePadrao } = useSystemSettings();
  const { filterByDevelopmentEmpresa } = useEmpresa();
  const { state: fase1 } = useFase1();
  const { openClient } = useClientCard();
  const search = useSearchParams();
  const abrirId = search.get("abrir") ?? "";
  const [selected, setSelected] = useState<Contract | null>(null);
  const [geo, setGeo] = useState<GeoEmpFilterValues>({ ...EMPTY_GEO_EMP });
  const [open, setOpen] = useNovoParam();
  const compradorOpts = useMemo(
    () => peopleIdOptions(fase1.people, ["cliente", "comprador"]),
    [fase1.people]
  );
  const [form, setForm] = useState({
    developmentId: state.developments[0]?.id ?? "",
    lotId: "",
    compradorId: "",
    compradorNome: "",
    preco: 180000,
    entrada: 20000,
    qtdParcelas: 60,
    valorParcela: 2500,
    formaPagamento: "plano" as FormaPagamentoVenda,
    permutaDescricao: "",
  });

  const contracts = useMemo(() => {
    let list = filterByDevelopmentEmpresa(
      state.contracts,
      state.developments
    );
    const ids = developmentIdsMatching(state.developments, geo);
    if (ids) list = list.filter((c) => ids.has(c.developmentId));
    return list;
  }, [
    filterByDevelopmentEmpresa,
    state.contracts,
    state.developments,
    geo,
  ]);

  useEffect(() => {
    if (!abrirId) return;
    const c = state.contracts.find((x) => x.id === abrirId);
    if (c) setSelected(c);
  }, [abrirId, state.contracts]);
  const installments = useMemo(
    () => filterByDevelopmentEmpresa(
      state.installments.map((i) => {
        const c = state.contracts.find((x) => x.id === i.contractId);
        return { ...i, developmentId: c?.developmentId };
      }),
      state.developments
    ),
    [
      filterByDevelopmentEmpresa,
      state.installments,
      state.contracts,
      state.developments,
    ]
  );

  const disponiveis = state.lots.filter(
    (l) => l.developmentId === form.developmentId && l.status === "disponivel"
  );

  const ativos = contracts.filter((c) => c.status === "ativo").length;
  const aReceber = aReceberContratos(installments);

  const toCard = useCallback(
    (c: Contract) => ({
      id: c.id,
      columnId: c.status,
      title: `${c.numero} · ${c.compradorNome}`,
      subtitle: `${c.empNome} · ${c.quadra}/${c.lote}`,
      badge: formatBRL(c.preco),
      meta: c.status,
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Contratos"
        description="Nascem da proposta aprovada (C12). Kanban por situação."
        actions={
          <>
            <FichaFinanceiraButton href="/carteira" />
            <Button size="sm" variant="outline" asChild>
              <Link href="/vendas">Propostas</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova venda
            </Button>
          </>
        }
      />

      <GeoEmpFilters
        developments={state.developments}
        value={geo}
        onChange={setGeo}
      />

      <KpiGrid
        items={[
          { label: "Contratos", value: contracts.length },
          { label: "Ativos", value: ativos },
          { label: "A receber de contratos", value: formatBRL(aReceber) },
        ]}
      />

      <ProcessBoard
        storageKey="contratos"
        columns={STATUS_COLS}
        rows={contracts}
        toCard={toCard}
        columnTotals={(_, items) =>
          items.reduce((a, c) => a + c.preco, 0)
        }
        onOpen={(id) => {
          const c = state.contracts.find((x) => x.id === id) ?? null;
          setSelected(c);
          if (c) {
            openClient({
              nome: c.compradorNome,
              personId: c.compradorId,
              contractId: c.id,
              tab: "contrato",
            });
          }
        }}
        onMove={() => {
          notify("Altere situação pela ficha / operação");
          return false;
        }}
        exportName="contratos"
        listColumns={[
          {
            key: "numero",
            label: "Nº",
            filter: { type: "text" },
            getValue: (c) => c.numero,
          },
          {
            key: "cliente",
            label: "Cliente",
            filter: { type: "text" },
            getValue: (c) => c.compradorNome,
          },
          {
            key: "lote",
            label: "Lote",
            filter: { type: "text" },
            getValue: (c) => `${c.empNome} · ${c.quadra}/${c.lote}`,
          },
          {
            key: "preco",
            label: "Preço",
            filter: { type: "range" },
            getValue: (c) => c.preco,
            render: (c) => formatBRL(c.preco),
          },
          {
            key: "saldo",
            label: "Saldo",
            filter: { type: "range" },
            getValue: (c) => saldoDevedor(c.id),
            render: (c) => formatBRL(saldoDevedor(c.id)),
          },
          {
            key: "status",
            label: "Situação",
            filter: {
              type: "status",
              options: STATUS_COLS.map((s) => ({
                value: s.id,
                label: s.label,
              })),
            },
            getValue: (c) => c.status,
            render: (c) => (
              <StatusPill tone={c.status === "ativo" ? "ok" : "neutral"}>
                {c.status}
              </StatusPill>
            ),
          },
        ]}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `Contrato ${selected.numero}` : ""}
      >
        {selected ? (
          <div className="space-y-3">
            <DetailRow
              label="Lote"
              value={`${selected.quadra}/${selected.lote}`}
            />
            <DetailRow label="Preço" value={formatBRL(selected.preco)} />
            <DetailRow
              label="Saldo"
              value={formatBRL(saldoDevedor(selected.id))}
            />
            <DetailRow
              label="Forma"
              value={labelFormaPagamentoVenda(selected.formaPagamento)}
            />
            {selected.formaPagamento === "permuta" &&
            selected.permutaDescricao ? (
              <DetailRow label="Permuta" value={selected.permutaDescricao} />
            ) : null}
            <DetailRow label="Reajuste" value={selected.tipoReajuste} />
            <FichaNavLinks
              contractId={selected.id}
              onBeforeNavigate={() => setSelected(null)}
              className="border-b border-linha pb-3"
            />
            <div className="flex flex-wrap gap-2 pt-2">
              <FichaFinanceiraButton
                href={carteiraContratoHref(selected.id)}
                onBeforeNavigate={() => setSelected(null)}
                variant="default"
              />
              {(
                [
                  ["retomada", "Retomar lote"],
                  ["transferencia", "Transferência"],
                  ["renegociacao", "Renegociação"],
                  ["troca", "Troca de lote"],
                  ["antecipacao", "Adiantamento"],
                  ["alteracao_plano", "Alterar plano"],
                  ["distrato", "Distrato"],
                ] as const
              ).map(([tipo, label]) => (
                <Button
                  key={tipo}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    registrarOperacao(
                      selected.id,
                      tipo,
                      `${label} registrada em ${new Date().toISOString().slice(0, 10)}`
                    );
                    notify(label, `Contrato ${selected.numero}`);
                    setSelected(null);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            {state.operations.filter((o) => o.contractId === selected.id)
              .length > 0 ? (
              <div className="mt-3 space-y-1 border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Histórico de operações
                </p>
                {state.operations
                  .filter((o) => o.contractId === selected.id)
                  .slice(0, 8)
                  .map((o) => (
                    <p key={o.id} className="text-xs text-muted-foreground">
                      {o.quando}: {o.tipo} — {o.detalhe}
                    </p>
                  ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova venda / contrato"
        onSubmit={() => {
          if (!form.lotId || !form.compradorId || !form.compradorNome) {
            notify("Selecione lote e comprador cadastrado");
            return;
          }
          const permutaErr = validatePermutaDescricao(
            form.formaPagamento,
            form.permutaDescricao
          );
          if (permutaErr) {
            notify("Permuta", permutaErr);
            return;
          }
          const isPermuta = form.formaPagamento === "permuta";
          const ct = addContract({
            ...form,
            entrada: isPermuta ? 0 : form.entrada,
            qtdParcelas: isPermuta ? 0 : form.qtdParcelas,
            valorParcela: isPermuta ? 0 : form.valorParcela,
            permutaDescricao: isPermuta
              ? form.permutaDescricao.trim()
              : undefined,
            tipoReajuste: indicePadrao,
          });
          if (!ct) {
            notify(
              "Não foi possível criar",
              isPermuta
                ? "Descreva a permuta e verifique o lote"
                : "Lote indisponível"
            );
            return;
          }
          notify("Contrato criado", ct.numero);
          setOpen(false);
        }}
      >
        <Field label="Empreendimento">
          <SearchSelect
            options={state.developments.map((d) => ({
              value: d.id,
              label: d.nome,
              meta: d.modalidade,
            }))}
            value={form.developmentId}
            onChange={(v) =>
              setForm({ ...form, developmentId: v, lotId: "" })
            }
          />
        </Field>
        <Field label="Lote disponível *">
          <SearchSelect
            options={disponiveis.map((l) => ({
              value: l.id,
              label: `${l.quadra}/${l.lote}`,
              meta: formatBRL(l.valor),
            }))}
            value={form.lotId}
            onChange={(v) => {
              const lot = disponiveis.find((l) => l.id === v);
              setForm({
                ...form,
                lotId: v,
                preco: lot?.valor ?? form.preco,
              });
            }}
            placeholder="Buscar lote…"
          />
        </Field>
        <Field label="Comprador cadastrado *">
          <SearchSelect
            value={form.compradorId}
            onChange={(compradorId) => {
              const p = compradorOpts.find((o) => o.value === compradorId);
              setForm({
                ...form,
                compradorId,
                compradorNome: p?.label ?? "",
              });
            }}
            options={compradorOpts}
            placeholder="Selecionar comprador cadastrado…"
          />
          {compradorOpts.length === 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Cadastre em{" "}
              <Link className="underline" href="/cadastros/clientes">
                Clientes
              </Link>
            </p>
          ) : null}
        </Field>
        <Field label="Forma de pagamento *">
          <select
            className={fieldControlClass}
            value={form.formaPagamento}
            onChange={(e) =>
              setForm({
                ...form,
                formaPagamento: e.target.value as FormaPagamentoVenda,
              })
            }
          >
            {FORMAS_PAGAMENTO_VENDA.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </Field>
        {form.formaPagamento === "permuta" ? (
          <Field label="Como foi a permuta *">
            <textarea
              className={fieldControlClass + " min-h-[80px]"}
              value={form.permutaDescricao}
              onChange={(e) =>
                setForm({ ...form, permutaDescricao: e.target.value })
              }
              placeholder="Descreva o bem/serviço, valores e condições"
              required
            />
          </Field>
        ) : null}
        {form.formaPagamento !== "permuta" ? (
          <>
            <Field label="Entrada">
              <Input
                type="number"
                value={form.entrada}
                onChange={(e) =>
                  setForm({ ...form, entrada: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Qtd. prestações">
              <Input
                type="number"
                value={form.qtdParcelas}
                onChange={(e) =>
                  setForm({
                    ...form,
                    qtdParcelas: Number(e.target.value) || 1,
                  })
                }
              />
            </Field>
            <Field label="Valor da prestação">
              <Input
                type="number"
                value={form.valorParcela}
                onChange={(e) =>
                  setForm({
                    ...form,
                    valorParcela: Number(e.target.value) || 0,
                  })
                }
              />
            </Field>
          </>
        ) : null}
      </FormDialog>
    </div>
  );
}
