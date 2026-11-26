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
import { BoardViews } from "@/components/kanban/BoardViews";
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
  const { state, addDemanda, moverDemanda } = useParte5();
  const { state: cart } = useCarteira();
  const { openClient } = useClientCard();
  const [q, setQ] = useState("");
  const [view, setView] = useState<"lista" | "quadro">("quadro");
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

  const tipoNome = (id: string) =>
    state.demandaTipos.find((t) => t.id === id)?.nome ?? "—";

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Demandas"
        description="Pedidos operacionais (água, energia, marcação…) — interno e portais."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setView((v) => (v === "lista" ? "quadro" : "lista"))
              }
            >
              {view === "lista" ? "Quadro" : "Lista"}
            </Button>
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
          { label: "Abertas", value: state.demandas.filter((d) => d.status === "aberta").length },
          { label: "Em execução", value: state.demandas.filter((d) => d.status === "em_execucao").length },
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

      {view === "quadro" ? (
        <BoardViews
          storageKey="demandas"
          columns={COLS}
          cards={filtered.map((d) => ({
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
          }))}
          onMove={(cardId, to) => {
            moverDemanda(cardId, to as DemandaStatus);
            notify(`Status → ${to.replace(/_/g, " ")}`);
            return true;
          }}
        />
      ) : (
        <ModuleSection title="Lista">
          <PaginatedTable
            exportName="demandas"
            columns={[
              { key: "num", label: "Nº" },
              { key: "tipo", label: "Tipo" },
              { key: "emp", label: "Empreendimento" },
              { key: "cli", label: "Cliente" },
              { key: "prio", label: "Prioridade" },
              { key: "resp", label: "Responsável" },
              { key: "prazo", label: "Prazo" },
              { key: "origem", label: "Origem" },
              { key: "status", label: "Status" },
            ]}
            rows={filtered.map((d) => ({
              num: d.numero,
              tipo: tipoNome(d.tipoId),
              emp: `${d.empreendimentoNome}${d.quadra ? ` · ${d.quadra}-${d.lote}` : ""}`,
              cli: d.clienteNome ?? "—",
              prio: d.prioridade,
              resp: d.responsavel,
              prazo: formatDateBR(d.prazo),
              origem: d.origem.replace(/_/g, " "),
              status: (
                <StatusPill tone="info">
                  {d.status.replace(/_/g, " ")}
                </StatusPill>
              ),
            }))}
          />
        </ModuleSection>
      )}

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
