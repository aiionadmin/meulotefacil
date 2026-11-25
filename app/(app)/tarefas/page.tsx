"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { useFase1 } from "@/lib/store/fase1-store";
import type { AppTask } from "@/lib/domain/fase1-types";

const COLS: { id: AppTask["status"]; label: string }[] = [
  { id: "a_fazer", label: "A fazer" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluída" },
];

export default function TarefasPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}
    >
      <TarefasInner />
    </Suspense>
  );
}

function TarefasInner() {
  const { state, addTask, moveTask } = useFase1();
  const search = useSearchParams();
  const [open, setOpen] = useState(search.get("novo") === "1");
  const [form, setForm] = useState({
    titulo: "",
    prioridade: "media" as AppTask["prioridade"],
    prazo: "30/11/2026",
  });

  const toCard = useCallback(
    (t: AppTask) => ({
      id: t.id,
      columnId: t.status,
      title: t.titulo,
      subtitle: t.responsavelNome,
      badge: t.prioridade,
      meta: t.prazo,
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Minhas tarefas"
        description="Kanban | Lista (C19), por prazo e prioridade."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Nova tarefa
          </Button>
        }
      />
      <KpiGrid
        items={COLS.map((c) => ({
          label: c.label,
          value: state.tasks.filter((t) => t.status === c.id).length,
        }))}
      />

      <ProcessBoard
        storageKey="tarefas"
        columns={COLS}
        rows={state.tasks}
        toCard={toCard}
        onMove={(id, to) => {
          moveTask(id, to as AppTask["status"]);
          notify("Tarefa movida");
          return true;
        }}
        exportName="tarefas"
        listColumns={[
          {
            key: "titulo",
            label: "Título",
            filter: { type: "text" },
            getValue: (t) => t.titulo,
          },
          {
            key: "resp",
            label: "Responsável",
            filter: { type: "text" },
            getValue: (t) => t.responsavelNome,
          },
          {
            key: "prazo",
            label: "Prazo",
            filter: { type: "text" },
            getValue: (t) => t.prazo,
          },
          {
            key: "prio",
            label: "Prioridade",
            filter: {
              type: "list",
              options: [
                { value: "baixa", label: "Baixa" },
                { value: "media", label: "Média" },
                { value: "alta", label: "Alta" },
              ],
            },
            getValue: (t) => t.prioridade,
            render: (t) => <StatusPill tone="info">{t.prioridade}</StatusPill>,
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: COLS.map((c) => ({ value: c.id, label: c.label })),
            },
            getValue: (t) => t.status,
            render: (t) => (
              <StatusPill tone="neutral">
                {COLS.find((c) => c.id === t.status)?.label ?? t.status}
              </StatusPill>
            ),
          },
        ]}
        bulkActions={[
          {
            label: "Concluir",
            onClick: (ids) => {
              ids.forEach((id) => moveTask(id, "concluida"));
            },
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova tarefa"
        submitLabel="Criar"
        onSubmit={() => {
          if (!form.titulo.trim()) return;
          addTask({
            titulo: form.titulo,
            status: "a_fazer",
            prioridade: form.prioridade,
            prazo: form.prazo,
            responsavelNome: "Administrador",
          });
          notify("Tarefa criada");
          setOpen(false);
        }}
      >
        <Field label="Título">
          <Input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
        </Field>
        <Field label="Prioridade">
          <select
            className={fieldControlClass}
            value={form.prioridade}
            onChange={(e) =>
              setForm({
                ...form,
                prioridade: e.target.value as AppTask["prioridade"],
              })
            }
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </Field>
        <Field label="Prazo">
          <Input
            value={form.prazo}
            onChange={(e) => setForm({ ...form, prazo: e.target.value })}
          />
        </Field>
      </FormDialog>
    </div>
  );
}
