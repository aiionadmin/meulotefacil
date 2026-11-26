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
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import {
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatDateBR } from "@/lib/masks/br";
import { useServerPage } from "@/lib/ui/use-server-page";
import { useParte5 } from "@/lib/store/parte5-store";
import type {
  Demanda,
  DemandaPrioridade,
  DemandaStatus,
} from "@/lib/domain/parte5-types";
import { useCarteira } from "@/lib/store/carteira-store";
import { useClientCard } from "@/lib/client/client-card-context";

const COLS: { id: DemandaStatus; label: string }[] = [
  { id: "aberta", label: "Aberta" },
  { id: "em_analise", label: "Em análise" },
  { id: "agendada", label: "Agendada" },
  { id: "em_execucao", label: "Em execução" },
  { id: "concluida", label: "Concluída" },
  { id: "cancelada", label: "Cancelada" },
];

export default function DemandasPage() {
  const {
    state,
    addDemanda,
    moverDemanda,
    atribuirDemandas,
    concluirDemandas,
  } = useParte5();
  const { state: cart } = useCarteira();
  const { openClient } = useClientCard();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const server = useServerPage({
    url: "/api/list/demandas",
    page: 1,
    pageSize: 25,
    q,
  });
  const [form, setForm] = useState({
    tipoId: "",
    empreendimentoId: "",
    quadra: "",
    lote: "",
    clienteNome: "",
    descricao: "",
    prioridade: "normal" as DemandaPrioridade,
  });

  const hoje = new Date().toISOString().slice(0, 10);
  const atrasadas = state.demandas.filter(
    (d) =>
      d.prazo < hoje &&
      d.status !== "concluida" &&
      d.status !== "cancelada"
  ).length;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.demandas;
    return state.demandas.filter((d) =>
      [
        d.numero,
        d.descricao,
        d.clienteNome,
        d.empreendimentoNome,
        d.responsavel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.demandas, q]);

  const tipoNome = useCallback(
    (id: string) =>
      state.demandaTipos.find((t) => t.id === id)?.nome ?? "—",
    [state.demandaTipos]
  );

  const toCard = useCallback(
    (d: Demanda) => ({
      id: d.id,
      columnId: d.status,
      title: d.numero,
      subtitle: `${tipoNome(d.tipoId)} · ${d.descricao}`,
      meta: `${d.empreendimentoNome}${d.quadra ? ` ${d.quadra}-${d.lote}` : ""}`,
      badge:
        d.prazo < hoje &&
        d.status !== "concluida" &&
        d.status !== "cancelada"
          ? "atrasada"
          : d.prioridade === "urgente" || d.prioridade === "alta"
            ? d.prioridade
            : undefined,
    }),
    [tipoNome, hoje]
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Demandas"
        description="Pedidos operacionais — Kanban | Lista com ações em lote (C15)."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/portal/cliente">Portal cliente</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova demanda
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          {
            label: "Abertas",
            value: state.demandas.filter((d) => d.status === "aberta").length,
          },
          {
            label: "Em execução",
            value: state.demandas.filter((d) => d.status === "em_execucao")
              .length,
          },
          { label: "Atrasadas", value: atrasadas },
          {
            label: "API B17",
            value: server.loading
              ? "…"
              : server.data
                ? `${server.data.total} · ${Math.round(server.data.elapsedMs ?? 0)}ms`
                : server.error ?? "—",
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar demanda…" />

      <ProcessBoard
        storageKey="demandas"
        columns={COLS}
        rows={filtered}
        toCard={toCard}
        onMove={(cardId, to) => {
          moverDemanda(cardId, to as DemandaStatus);
          notify(`Status → ${to.replace(/_/g, " ")}`);
          return true;
        }}
        onOpen={(id) => {
          const d = state.demandas.find((x) => x.id === id);
          if (d?.clienteNome) {
            openClient({
              nome: d.clienteNome,
              personId: d.clienteId,
            });
          }
        }}
        exportName="demandas"
        bulkActions={[
          {
            label: "Atribuir a mim",
            onClick: (ids) => {
              const n = atribuirDemandas(ids, "Atendimento");
              notify(`${n} demanda(s) atribuídas`);
            },
          },
          {
            label: "Concluir seleção",
            onClick: (ids) => {
              const n = concluirDemandas(ids);
              notify(n ? `${n} concluída(s)` : "Nenhuma pendente");
            },
          },
        ]}
        listColumns={[
          {
            key: "num",
            label: "Nº",
            filter: { type: "text" },
            getValue: (d) => d.numero,
          },
          {
            key: "tipo",
            label: "Tipo",
            filter: { type: "text" },
            getValue: (d) => tipoNome(d.tipoId),
          },
          {
            key: "emp",
            label: "Empreendimento",
            filter: { type: "text" },
            getValue: (d) =>
              `${d.empreendimentoNome}${d.quadra ? ` · ${d.quadra}-${d.lote}` : ""}`,
          },
          {
            key: "cli",
            label: "Cliente",
            filter: { type: "text" },
            getValue: (d) => d.clienteNome ?? "—",
          },
          {
            key: "prio",
            label: "Prioridade",
            filter: { type: "text" },
            getValue: (d) => d.prioridade,
          },
          {
            key: "resp",
            label: "Responsável",
            filter: { type: "text" },
            getValue: (d) => d.responsavel,
          },
          {
            key: "prazo",
            label: "Prazo",
            filter: { type: "period" },
            getValue: (d) => d.prazo,
            render: (d) => formatDateBR(d.prazo),
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: COLS.map((c) => ({ value: c.id, label: c.label })),
            },
            getValue: (d) => d.status,
            render: (d) => (
              <StatusPill tone="info">
                {d.status.replace(/_/g, " ")}
              </StatusPill>
            ),
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova demanda"
        onSubmit={() => {
          const tipoId = form.tipoId || state.demandaTipos[0]?.id;
          const dev =
            cart.developments.find((d) => d.id === form.empreendimentoId) ??
            cart.developments[0];
          if (!tipoId || !dev || !form.descricao.trim()) {
            notify("Tipo, empreendimento e descrição obrigatórios");
            return;
          }
          const dem = addDemanda({
            tipoId,
            empreendimentoId: dev.id,
            empreendimentoNome: dev.nome,
            quadra: form.quadra || undefined,
            lote: form.lote || undefined,
            clienteNome: form.clienteNome || undefined,
            descricao: form.descricao,
            prioridade: form.prioridade,
            origem: "interno",
          });
          if (!dem) {
            notify("Falha ao criar");
            return;
          }
          notify(`${dem.numero} criada`);
          setOpen(false);
        }}
      >
        <Field label="Tipo *">
          <select
            className={fieldControlClass}
            value={form.tipoId || state.demandaTipos[0]?.id}
            onChange={(e) => setForm({ ...form, tipoId: e.target.value })}
          >
            {state.demandaTipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Empreendimento *">
          <select
            className={fieldControlClass}
            value={form.empreendimentoId || cart.developments[0]?.id}
            onChange={(e) =>
              setForm({ ...form, empreendimentoId: e.target.value })
            }
          >
            {cart.developments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Quadra">
            <Input
              value={form.quadra}
              onChange={(e) => setForm({ ...form, quadra: e.target.value })}
            />
          </Field>
          <Field label="Lote">
            <Input
              value={form.lote}
              onChange={(e) => setForm({ ...form, lote: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Cliente">
          <Input
            value={form.clienteNome}
            onChange={(e) =>
              setForm({ ...form, clienteNome: e.target.value })
            }
          />
        </Field>
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        <Field label="Prioridade">
          <select
            className={fieldControlClass}
            value={form.prioridade}
            onChange={(e) =>
              setForm({
                ...form,
                prioridade: e.target.value as DemandaPrioridade,
              })
            }
          >
            <option value="baixa">Baixa</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </Field>
      </FormDialog>
    </div>
  );
}
