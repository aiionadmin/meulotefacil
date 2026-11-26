"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  DetailRow,
  DetailSheet,
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import type {
  CondicaoPagamento,
  FormaPagamento,
  Pagamento,
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
  } = useFinanceiro();
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
    pagador: "Meu Lote Fácil",
    contaId: "",
    valor: 1000,
    forma: "pix" as FormaPagamento,
    condicao: "a_vista" as CondicaoPagamento,
    parcelas: 2,
    centroTipo: "obra" as "obra" | "empresa",
    centroLabel: "Infraestrutura Residencial Horizonte",
    rateioEmpresaPct: 40,
    rateioObraPct: 60,
    usarRateio: false,
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
        description="Parte 4 — lançamento gera parcelas a pagar; baixa parcial e estorno."
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

      <ModuleSection title="Lista">
        <PaginatedTable
          columns={[
            { key: "venc", label: "Vencimento" },
            { key: "status", label: "Status" },
            { key: "valor", label: "Valor" },
            { key: "fav", label: "Favorecido" },
            { key: "desc", label: "Descrição / Categoria" },
            { key: "cond", label: "Condição / Conta" },
            { key: "centro", label: "Centro" },
            { key: "pago", label: "Pago" },
          ]}
          rows={filtered.map((p) => {
            const conta = state.contas.find((c) => c.id === p.contaId);
            return {
              venc: (
                <button
                  type="button"
                  className="font-medium hover:text-brand-orange"
                  onClick={() => setSelected(p)}
                >
                  {formatDateBR(p.vencimento)}
                </button>
              ),
              status: (
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
                  {p.conciliado ? " · conc." : ""}
                </StatusPill>
              ),
              valor: formatBRL(p.valor),
              fav: p.favorecido,
              desc: (
                <span>
                  {p.descricao}
                  <span className="block text-xs text-muted-foreground">
                    {categoriaNome(p.categoriaId)} · {p.parcela}
                  </span>
                </span>
              ),
              cond: `${p.condicao.replace(/_/g, " ")} · ${conta?.nome ?? "—"}`,
              centro: p.centroLabel,
              pago: p.pagoEm ? formatDateBR(p.pagoEm) : "—",
            };
          })}
        />
      </ModuleSection>

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
        <Link className="underline" href="/financeiro/fluxo">
          Fluxo de caixa
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/resultados">
          Resultados
        </Link>
        {" · "}
        <Link className="underline" href="/financeiro/notas">
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
                    conciliarPagamento(live.id);
                    notify("Conciliado");
                  }}
                >
                  Conciliar
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo lançamento"
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
          const centros = form.usarRateio
            ? [
                {
                  tipo: "obra" as const,
                  obraId: "obr-1",
                  label: "Infraestrutura Residencial Horizonte",
                  pct: form.rateioObraPct,
                  valor:
                    Math.round(form.valor * (form.rateioObraPct / 100) * 100) /
                    100,
                },
                {
                  tipo: "empresa" as const,
                  label: "Meu Lote Fácil",
                  pct: form.rateioEmpresaPct,
                  valor:
                    Math.round(
                      form.valor * (form.rateioEmpresaPct / 100) * 100
                    ) / 100,
                },
              ]
            : [
                {
                  tipo: form.centroTipo,
                  obraId: form.centroTipo === "obra" ? "obr-1" : undefined,
                  label: form.centroLabel,
                  valor: form.valor,
                },
              ];
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
          <select
            className={fieldControlClass}
            value={form.categoriaId}
            onChange={(e) =>
              setForm({ ...form, categoriaId: e.target.value })
            }
          >
            <option value="">Selecione…</option>
            {state.categorias
              .filter((c) => c.ativo)
              .slice(0, 40)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
          </select>
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
          <Field label="Valor *">
            <Input
              type="number"
              value={form.valor}
              onChange={(e) =>
                setForm({ ...form, valor: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Conta *">
            <select
              className={fieldControlClass}
              value={form.contaId || state.contas[0]?.id}
              onChange={(e) => setForm({ ...form, contaId: e.target.value })}
            >
              {state.contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
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
              <option value="cartao">Cartão</option>
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
          <Field label="Parcelas">
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.usarRateio}
            onChange={(e) =>
              setForm({ ...form, usarRateio: e.target.checked })
            }
          />
          Rateio em duas obras/centros (60% obra / 40% empresa)
        </label>
        {!form.usarRateio ? (
          <Field label="Centro de custo *">
            <Input
              value={form.centroLabel}
              onChange={(e) =>
                setForm({ ...form, centroLabel: e.target.value })
              }
            />
          </Field>
        ) : null}
      </FormDialog>
    </div>
  );
}
