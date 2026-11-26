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
import { useFluxo } from "@/lib/store/fluxo-store";
import { useCarteira } from "@/lib/store/carteira-store";
import type { Proposal } from "@/lib/domain/fluxo-types";

const STATUS_COLS = [
  { id: "aberta", label: "Aberta" },
  { id: "reservada", label: "Reservada" },
  { id: "convertida", label: "Convertida" },
  { id: "cancelada", label: "Cancelada" },
];

export default function VendasPage() {
  const { state, addProposal, converterProposal } = useFluxo();
  const { state: carteira, addContract, changeLotStatus } = useCarteira();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    leadId: state.leads[0]?.id ?? "",
    cliente: "",
    developmentId: carteira.developments[0]?.id ?? "",
    lotId: "",
    servicoRegularizacao: false,
    valor: 185000,
    parcelas: 120,
    entrada: 20000,
    validade: new Date().toISOString().slice(0, 10),
    responsavel: "Comercial",
  });

  const disponiveis = useMemo(
    () =>
      carteira.lots.filter(
        (l) =>
          l.developmentId === form.developmentId && l.status === "disponivel"
      ),
    [carteira.lots, form.developmentId]
  );

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

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Propostas e reservas"
        description="Empreendimento e lote disponíveis obrigatórios. Converter gera contrato."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/vendas/nova">Nova venda</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/contratos">Contratos</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
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

      <ProcessBoard
        storageKey="propostas"
        columns={STATUS_COLS}
        rows={state.proposals}
        toCard={toCard}
        columnTotals={(_, items) =>
          items.reduce((a, p) => a + p.valor, 0)
        }
        onMove={() => {
          notify("Use Converter / Cancelar na ficha");
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
              <div className="flex items-center gap-2">
                <StatusPill tone="info">{p.status}</StatusPill>
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
                        changeLotStatus([lot.id], "vendido", "Proposta convertida");
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
        onOpenChange={setOpen}
        title="Nova proposta"
        onSubmit={() => {
          if (!form.developmentId) {
            notify("Empreendimento obrigatório");
            return;
          }
          if (!form.servicoRegularizacao && !form.lotId) {
            notify("Selecione um lote disponível ou serviço de regularização");
            return;
          }
          const lead = state.leads.find((l) => l.id === form.leadId);
          const lot = carteira.lots.find((l) => l.id === form.lotId);
          addProposal({
            leadId: form.leadId || undefined,
            cliente: form.cliente || lead?.nome || "Cliente",
            empNome: emp?.nome ?? "",
            developmentId: form.developmentId,
            lotId: form.lotId || undefined,
            loteLabel: form.servicoRegularizacao
              ? "Serviço REURB"
              : lot
                ? `${lot.quadra}/${lot.lote}`
                : "",
            servicoRegularizacao: form.servicoRegularizacao,
            valor: form.valor,
            parcelas: form.parcelas,
            entrada: form.entrada,
            validade: form.validade,
            responsavel: form.responsavel,
          });
          if (lot) {
            changeLotStatus([lot.id], "reservado", "Proposta/reserva");
          }
          notify("Proposta criada");
          setOpen(false);
        }}
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
          />
        </Field>
        <Field label="Serviço de regularização">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
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
            />
          </Field>
        ) : null}
        <Field label="Valor">
          <Input
            type="number"
            value={form.valor}
            onChange={(e) =>
              setForm({ ...form, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Entrada">
          <Input
            type="number"
            value={form.entrada}
            onChange={(e) =>
              setForm({ ...form, entrada: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Parcelas">
          <Input
            type="number"
            value={form.parcelas}
            onChange={(e) =>
              setForm({ ...form, parcelas: Number(e.target.value) || 1 })
            }
          />
        </Field>
        <Field label="Validade">
          <Input
            type="date"
            className={fieldControlClass}
            value={form.validade}
            onChange={(e) => setForm({ ...form, validade: e.target.value })}
          />
        </Field>
      </FormDialog>
    </div>
  );
}
