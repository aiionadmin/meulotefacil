"use client";

import { useCallback, useMemo, useState } from "react";
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
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import type { FormaPagamento, Recebimento } from "@/lib/domain/financeiro-types";

export default function RecebimentosPage() {
  const {
    state,
    addFaturamento,
    baixarRecebimento,
    estornarRecebimento,
    setRecebimentoStatus,
  } = useFinanceiro();

  const STATUS_COLS = [
    { id: "em_aberto", label: "Em aberto" },
    { id: "vencido", label: "Vencido" },
    { id: "parcial", label: "Parcial" },
    { id: "recebido", label: "Recebido" },
  ];

  const toCard = useCallback(
    (r: Recebimento) => ({
      id: r.id,
      columnId: r.status,
      title: r.cliente,
      subtitle: r.descricao,
      badge: formatBRL(r.valor),
      meta: r.origem === "contrato" ? `Ctr ${r.contratoRef ?? ""}` : "Fat",
    }),
    []
  );
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Recebimento | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    descricao: "",
    cliente: "",
    naturezaId: "",
    competencia: new Date().toISOString().slice(0, 7) + "-01",
    vencimento: new Date().toISOString().slice(0, 10),
    centroLabel: "Infraestrutura Residencial Horizonte",
    contaId: "",
    valorBruto: 10000,
    impostosRetidos: 0,
    forma: "boleto" as FormaPagamento,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.recebimentos;
    return state.recebimentos.filter((r) =>
      [r.cliente, r.descricao, r.origem, r.contratoRef, r.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.recebimentos, q]);

  const live = selected
    ? state.recebimentos.find((r) => r.id === selected.id) ?? selected
    : null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Recebimentos"
        description="Kanban | Lista (C19) — faturamento e parcelas de contrato (somente leitura)."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro">Pagamentos</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Novo faturamento
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          {
            label: "Em aberto",
            value: formatBRL(
              state.recebimentos
                .filter((r) => r.status !== "recebido")
                .reduce((a, r) => a + (r.valor - r.valorRecebido), 0)
            ),
          },
          {
            label: "Recebido",
            value: formatBRL(
              state.recebimentos
                .filter((r) => r.status === "recebido")
                .reduce((a, r) => a + r.valorRecebido, 0)
            ),
          },
          {
            label: "Origem contrato",
            value: state.recebimentos.filter((r) => r.origem === "contrato")
              .length,
          },
          { label: "Faturamentos", value: state.faturamentos.length },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar…" />

      <ProcessBoard
        storageKey="recebimentos"
        columns={STATUS_COLS}
        rows={filtered}
        toCard={toCard}
        columnTotals={(_, items) => items.reduce((a, r) => a + r.valor, 0)}
        onOpen={(id) =>
          setSelected(state.recebimentos.find((r) => r.id === id) ?? null)
        }
        onMove={(id, to) => {
          const row = state.recebimentos.find((r) => r.id === id);
          if (row?.origem === "contrato") {
            notify("Parcela de contrato é somente leitura");
            return false;
          }
          const ok = setRecebimentoStatus(
            id,
            to as Recebimento["status"]
          );
          if (!ok) notify("Movimento não permitido");
          return ok;
        }}
        exportName="recebimentos"
        listColumns={[
          {
            key: "venc",
            label: "Vencimento",
            filter: { type: "period" },
            getValue: (r) => r.vencimento,
            render: (r) => formatDateBR(r.vencimento),
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
            getValue: (r) => r.status,
            render: (r) => (
              <StatusPill
                tone={
                  r.status === "recebido"
                    ? "ok"
                    : r.status === "vencido"
                      ? "danger"
                      : "info"
                }
              >
                {r.status}
              </StatusPill>
            ),
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (r) => r.valor,
            render: (r) => formatBRL(r.valor),
          },
          {
            key: "cli",
            label: "Cliente",
            filter: { type: "text" },
            getValue: (r) => r.cliente,
          },
          {
            key: "origem",
            label: "Origem",
            filter: { type: "text" },
            getValue: (r) => r.origem,
          },
        ]}
      />

      <ModuleSection title="Faturamentos">
        <PaginatedTable
          columns={[
            { key: "data", label: "Lançamento" },
            { key: "bruto", label: "Bruto" },
            { key: "imp", label: "Impostos" },
            { key: "liq", label: "Líquido" },
            { key: "cli", label: "Cliente" },
            { key: "desc", label: "Descrição" },
          ]}
          rows={state.faturamentos.map((f) => ({
            data: formatDateBR(f.criadoEm),
            bruto: formatBRL(f.valorBruto),
            imp: formatBRL(f.impostosRetidos),
            liq: formatBRL(f.valorLiquido),
            cli: f.cliente,
            desc: f.descricao,
          }))}
        />
      </ModuleSection>

      <DetailSheet
        open={!!live}
        onOpenChange={(o) => !o && setSelected(null)}
        title={live?.cliente ?? ""}
      >
        {live ? (
          <div className="space-y-3">
            <DetailRow label="Descrição" value={live.descricao} />
            <DetailRow label="Valor" value={formatBRL(live.valor)} />
            <DetailRow
              label="Recebido"
              value={formatBRL(live.valorRecebido)}
            />
            <DetailRow label="Origem" value={live.origem} />
            {live.contratoRef ? (
              <DetailRow
                label="Contrato"
                value={
                  <Link
                    className="underline"
                    href="/carteira"
                  >{`${live.contratoRef} (ficha)`}</Link>
                }
              />
            ) : null}
            <div className="flex flex-wrap gap-2 pt-2">
              {live.origem === "contrato" ? (
                <p className="text-xs text-muted-foreground">
                  Origem carteira — somente leitura aqui; baixa via boleto.
                </p>
              ) : live.status !== "recebido" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    baixarRecebimento(live.id, live.valor - live.valorRecebido);
                    notify("Recebido");
                  }}
                >
                  Receber
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    estornarRecebimento(live.id);
                    notify("Estornado");
                  }}
                >
                  Estornar
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo faturamento"
        onSubmit={() => {
          const naturezaId =
            form.naturezaId || state.naturezas[0]?.id;
          const contaId = form.contaId || state.contas[0]?.id;
          if (!form.descricao || !form.cliente || !naturezaId || !contaId) {
            notify("Preencha os campos");
            return;
          }
          if (!form.centroLabel.trim()) {
            notify("Centro de custo obrigatório");
            return;
          }
          const r = addFaturamento({
            descricao: form.descricao,
            cliente: form.cliente,
            naturezaId,
            competencia: form.competencia,
            vencimento: form.vencimento,
            centro: {
              tipo: "obra",
              obraId: "obr-1",
              label: form.centroLabel,
            },
            contaId,
            valorBruto: form.valorBruto,
            impostosRetidos: form.impostosRetidos,
            forma: form.forma,
          });
          if (!r.ok) {
            notify("Falha ao faturar");
            return;
          }
          notify("Faturamento + recebimento criados");
          setOpen(false);
        }}
      >
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        <Field label="Cliente *">
          <Input
            value={form.cliente}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
          />
        </Field>
        <Field label="Natureza *">
          <select
            className={fieldControlClass}
            value={form.naturezaId || state.naturezas[0]?.id}
            onChange={(e) =>
              setForm({ ...form, naturezaId: e.target.value })
            }
          >
            {state.naturezas.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Centro de custo *">
          <Input
            value={form.centroLabel}
            onChange={(e) =>
              setForm({ ...form, centroLabel: e.target.value })
            }
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Valor bruto *">
            <Input
              type="number"
              value={form.valorBruto}
              onChange={(e) =>
                setForm({
                  ...form,
                  valorBruto: Number(e.target.value) || 0,
                })
              }
            />
          </Field>
          <Field label="Impostos retidos">
            <Input
              type="number"
              value={form.impostosRetidos}
              onChange={(e) =>
                setForm({
                  ...form,
                  impostosRetidos: Number(e.target.value) || 0,
                })
              }
            />
          </Field>
        </div>
      </FormDialog>
    </div>
  );
}
