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
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { SearchSelect } from "@/components/app/SearchSelect";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { downloadPropostaPdf } from "@/lib/export/proposta-report";
import { useFluxo } from "@/lib/store/fluxo-store";
import { useCarteira } from "@/lib/store/carteira-store";
import type { Proposal } from "@/lib/domain/fluxo-types";

const STATUS_COLS = [
  { id: "aberta", label: "Aberta" },
  { id: "reservada", label: "Reservada" },
  { id: "convertida", label: "Convertida" },
  { id: "cancelada", label: "Cancelada" },
];

type ProposalForm = {
  leadId: string;
  cliente: string;
  developmentId: string;
  lotId: string;
  servicoRegularizacao: boolean;
  valor: number;
  parcelas: number;
  entrada: number;
  validade: string;
  responsavel: string;
  status: Proposal["status"];
};

function emptyForm(
  leadId: string,
  developmentId: string
): ProposalForm {
  return {
    leadId,
    cliente: "",
    developmentId,
    lotId: "",
    servicoRegularizacao: false,
    valor: 185000,
    parcelas: 120,
    entrada: 20000,
    validade: new Date().toISOString().slice(0, 10),
    responsavel: "Comercial",
    status: "aberta",
  };
}

export default function VendasPage() {
  const {
    state,
    addProposal,
    updateProposal,
    removeProposal,
    converterProposal,
  } = useFluxo();
  const { state: carteira, addContract, changeLotStatus } = useCarteira();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProposalForm>(() =>
    emptyForm(state.leads[0]?.id ?? "", carteira.developments[0]?.id ?? "")
  );

  const editing = editingId
    ? state.proposals.find((p) => p.id === editingId)
    : undefined;
  const locked = editing?.status === "convertida";

  const disponiveis = useMemo(() => {
    const base = carteira.lots.filter(
      (l) =>
        l.developmentId === form.developmentId &&
        (l.status === "disponivel" ||
          (editing?.lotId && l.id === editing.lotId))
    );
    return base;
  }, [carteira.lots, form.developmentId, editing?.lotId]);

  const emp = carteira.developments.find((d) => d.id === form.developmentId);

  const toCard = useCallback(
    (p: Proposal) => ({
      id: p.id,
      columnId: p.status,
      title: p.cliente,
      subtitle: `${p.empNome} · ${p.loteLabel}`,
      badge: formatBRL(p.valor),
      meta: p.responsavel,
    }),
    []
  );

  function resetForm() {
    setForm(
      emptyForm(state.leads[0]?.id ?? "", carteira.developments[0]?.id ?? "")
    );
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(p: Proposal) {
    setEditingId(p.id);
    setForm({
      leadId: p.leadId ?? "",
      cliente: p.cliente,
      developmentId:
        p.developmentId ??
        carteira.developments.find((d) => d.nome === p.empNome)?.id ??
        "",
      lotId: p.lotId ?? "",
      servicoRegularizacao: Boolean(p.servicoRegularizacao),
      valor: p.valor,
      parcelas: p.parcelas,
      entrada: p.entrada,
      validade: p.validade,
      responsavel: p.responsavel,
      status: p.status,
    });
    setOpen(true);
  }

  function releaseLot(lotId: string | undefined, motivo: string) {
    if (!lotId) return;
    const lot = carteira.lots.find((l) => l.id === lotId);
    if (lot && lot.status === "reservado") {
      changeLotStatus([lotId], "disponivel", motivo);
    }
  }

  function reserveLot(lotId: string | undefined, motivo: string) {
    if (!lotId) return;
    const lot = carteira.lots.find((l) => l.id === lotId);
    if (lot && lot.status === "disponivel") {
      changeLotStatus([lotId], "reservado", motivo);
    }
  }

  function buildPatch(): Omit<Proposal, "id" | "status"> & {
    status: Proposal["status"];
  } {
    const lead = state.leads.find((l) => l.id === form.leadId);
    const lot = carteira.lots.find((l) => l.id === form.lotId);
    return {
      leadId: form.leadId || undefined,
      cliente: form.cliente || lead?.nome || "Cliente",
      empNome: emp?.nome ?? editing?.empNome ?? "",
      developmentId: form.developmentId,
      lotId: form.servicoRegularizacao ? undefined : form.lotId || undefined,
      loteLabel: form.servicoRegularizacao
        ? "Serviço REURB"
        : lot
          ? `${lot.quadra}/${lot.lote}`
          : editing?.loteLabel ?? "",
      servicoRegularizacao: form.servicoRegularizacao,
      valor: form.valor,
      parcelas: form.parcelas,
      entrada: form.entrada,
      validade: form.validade,
      responsavel: form.responsavel,
      status: form.status,
    };
  }

  function handleSubmit() {
    if (!form.developmentId) {
      notify("Empreendimento obrigatório");
      return;
    }
    if (!form.servicoRegularizacao && !form.lotId) {
      notify("Selecione um lote disponível ou serviço de regularização");
      return;
    }
    if (locked) {
      notify("Proposta convertida — só visualização");
      return;
    }

    const patch = buildPatch();

    if (editingId && editing) {
      const prevLotId = editing.lotId;
      const nextLotId = patch.lotId;
      const nextStatus = patch.status;

      if (prevLotId && prevLotId !== nextLotId) {
        releaseLot(prevLotId, "Proposta alterou lote");
      }
      if (
        nextLotId &&
        (nextStatus === "aberta" || nextStatus === "reservada")
      ) {
        reserveLot(nextLotId, "Proposta/reserva");
      }
      if (nextStatus === "cancelada" && nextLotId) {
        releaseLot(nextLotId, "Proposta cancelada");
      }

      updateProposal(editingId, patch);
      notify("Proposta atualizada", patch.cliente);
    } else {
      const { status: _status, ...createData } = patch;
      void _status;
      addProposal(createData);
      if (createData.lotId) {
        reserveLot(createData.lotId, "Proposta/reserva");
      }
      notify("Proposta criada", createData.cliente);
    }
    setOpen(false);
    resetForm();
  }

  function handleDelete() {
    if (!editingId || !editing) return;
    if (
      !window.confirm(
        `Excluir a proposta de ${editing.cliente} (${editing.loteLabel})?`
      )
    ) {
      return;
    }
    const res = removeProposal(editingId);
    if (!res.ok) {
      notify("Não excluída", res.reason ?? "");
      return;
    }
    releaseLot(res.proposal?.lotId, "Proposta excluída");
    notify("Proposta excluída", editing.cliente);
    setOpen(false);
    resetForm();
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Propostas e reservas"
        description="CRUD completo — criar, editar, excluir e listar. Converter gera contrato."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/vendas/nova">Nova venda</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/contratos">Contratos</Link>
            </Button>
            <Button size="sm" onClick={openCreate}>
              Nova proposta
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Propostas", value: state.proposals.length },
          {
            label: "Abertas",
            value: state.proposals.filter((p) => p.status === "aberta").length,
          },
          {
            label: "Reservadas",
            value: state.proposals.filter((p) => p.status === "reservada")
              .length,
          },
          {
            label: "Convertidas",
            value: state.proposals.filter((p) => p.status === "convertida")
              .length,
          },
        ]}
      />

      <p className="text-sm text-muted-foreground">
        Clique no card ou na linha para editar · use Excluir na ficha do
        formulário.
      </p>

      <ProcessBoard
        storageKey="propostas"
        columns={STATUS_COLS}
        rows={state.proposals}
        toCard={toCard}
        onOpen={(id) => {
          const p = state.proposals.find((x) => x.id === id);
          if (p) openEdit(p);
        }}
        columnTotals={(_, items) =>
          items.reduce((a, p) => a + p.valor, 0)
        }
        onMove={() => {
          notify("Use Editar / Converter / Excluir na ficha");
          return false;
        }}
        exportName="propostas"
        listColumns={[
          {
            key: "cliente",
            label: "Cliente",
            filter: { type: "text" },
            getValue: (p) => p.cliente,
          },
          {
            key: "emp",
            label: "Empreendimento",
            filter: { type: "text" },
            getValue: (p) => p.empNome,
          },
          {
            key: "lote",
            label: "Lote",
            filter: { type: "text" },
            getValue: (p) => p.loteLabel,
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (p) => p.valor,
            render: (p) => formatBRL(p.valor),
          },
          {
            key: "validade",
            label: "Validade",
            filter: { type: "period" },
            getValue: (p) => p.validade,
            render: (p) => formatDateBR(p.validade),
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
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="info">{p.status}</StatusPill>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(p);
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadPropostaPdf(p);
                    notify("PDF da proposta", p.cliente);
                  }}
                >
                  PDF
                </Button>
                {p.status === "aberta" || p.status === "reservada" ? (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const converted = converterProposal(p.id);
                      if (!converted) return;
                      const lot = carteira.lots.find(
                        (l) =>
                          l.id === p.lotId ||
                          (`${l.quadra}/${l.lote}` === p.loteLabel &&
                            l.empNome === p.empNome)
                      );
                      const dev =
                        carteira.developments.find(
                          (d) => d.id === p.developmentId
                        ) ??
                        carteira.developments.find((d) => d.nome === p.empNome);
                      if (dev && lot) {
                        addContract({
                          developmentId: dev.id,
                          lotId: lot.id,
                          compradorNome: p.cliente,
                          preco: p.valor,
                          entrada: p.entrada,
                          qtdParcelas: p.parcelas,
                          valorParcela:
                            Math.round(
                              ((p.valor - p.entrada) / Math.max(1, p.parcelas)) *
                                100
                            ) / 100,
                        });
                        changeLotStatus(
                          [lot.id],
                          "vendido",
                          "Proposta convertida"
                        );
                      }
                      notify("Contrato gerado da proposta aprovada");
                    }}
                  >
                    Converter
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
        bulkActions={[
          {
            label: "Exportar",
            onClick: () => notify("Exportação em lote"),
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) resetForm();
        }}
        title={
          editingId
            ? locked
              ? "Proposta convertida"
              : "Editar proposta"
            : "Nova proposta"
        }
        submitLabel={editingId ? "Salvar alterações" : "Criar proposta"}
        onSubmit={handleSubmit}
      >
        <Field label="Lead">
          <SearchSelect
            options={state.leads.map((l) => ({
              value: l.id,
              label: l.nome,
              meta: l.empInteresse,
            }))}
            value={form.leadId}
            onChange={(v) => {
              const lead = state.leads.find((l) => l.id === v);
              setForm({
                ...form,
                leadId: v,
                cliente: lead?.nome ?? form.cliente,
              });
            }}
            disabled={locked}
          />
        </Field>
        <Field label="Cliente">
          <Input
            value={form.cliente}
            disabled={locked}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
          />
        </Field>
        <Field label="Empreendimento *">
          <SearchSelect
            options={carteira.developments.map((d) => ({
              value: d.id,
              label: d.nome,
              meta: d.modalidade,
            }))}
            value={form.developmentId}
            onChange={(v) =>
              setForm({ ...form, developmentId: v, lotId: "" })
            }
            disabled={locked}
          />
        </Field>
        <Field label="Serviço de regularização">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={locked}
              checked={form.servicoRegularizacao}
              onChange={(e) =>
                setForm({
                  ...form,
                  servicoRegularizacao: e.target.checked,
                  lotId: e.target.checked ? "" : form.lotId,
                })
              }
            />
            Sem lote (serviço)
          </label>
        </Field>
        {!form.servicoRegularizacao ? (
          <Field label="Quadra / Lote disponível *">
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
                  valor: lot?.valor ?? form.valor,
                });
              }}
              placeholder="Buscar lote disponível…"
              emptyLabel="Nenhum lote disponível"
              disabled={locked}
            />
          </Field>
        ) : null}
        <Field label="Valor">
          <Input
            type="number"
            disabled={locked}
            value={form.valor}
            onChange={(e) =>
              setForm({ ...form, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Entrada">
          <Input
            type="number"
            disabled={locked}
            value={form.entrada}
            onChange={(e) =>
              setForm({ ...form, entrada: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Parcelas">
          <Input
            type="number"
            disabled={locked}
            value={form.parcelas}
            onChange={(e) =>
              setForm({ ...form, parcelas: Number(e.target.value) || 1 })
            }
          />
        </Field>
        <Field label="Validade">
          <Input
            type="date"
            disabled={locked}
            className={fieldControlClass}
            value={form.validade}
            onChange={(e) => setForm({ ...form, validade: e.target.value })}
          />
        </Field>
        <Field label="Responsável">
          <Input
            disabled={locked}
            value={form.responsavel}
            onChange={(e) =>
              setForm({ ...form, responsavel: e.target.value })
            }
          />
        </Field>
        {editingId ? (
          <Field label="Status">
            <select
              className={fieldControlClass}
              disabled={locked}
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as Proposal["status"],
                })
              }
            >
              {STATUS_COLS.filter((c) => c.id !== "convertida").map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
              {form.status === "convertida" ? (
                <option value="convertida">Convertida</option>
              ) : null}
            </select>
          </Field>
        ) : null}
        {editingId && !locked ? (
          <div className="flex justify-between gap-2 border-t border-linha pt-3">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              Excluir proposta
            </Button>
          </div>
        ) : null}
      </FormDialog>
    </div>
  );
}
