"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useDemoStore, type Tarefa } from "@/lib/store/demo-store";

const COLUNAS: Tarefa["status"][] = ["A fazer", "Em andamento", "Concluída"];

export default function TarefasPage() {
  const { state, addTarefa, moveTarefa } = useDemoStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Tarefa | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    quadro: "Comercial",
    responsavel: "Comercial",
    prazo: "30/11/2026",
    prioridade: "Média",
    status: "A fazer" as Tarefa["status"],
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.tarefas;
    return state.tarefas.filter((t) =>
      [t.titulo, t.quadro, t.responsavel, t.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.tarefas, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Tarefas e agenda"
        description="Kanban por status, prioridade e responsáveis entre rotinas."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Nova tarefa
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Tarefas", value: state.tarefas.length },
          {
            label: "A fazer",
            value: state.tarefas.filter((t) => t.status === "A fazer").length,
          },
          {
            label: "Em andamento",
            value: state.tarefas.filter((t) => t.status === "Em andamento")
              .length,
          },
          {
            label: "Concluídas",
            value: state.tarefas.filter((t) => t.status === "Concluída").length,
          },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar tarefa…" />

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUNAS.map((col) => (
          <Card key={col}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{col}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filtered
                .filter((t) => t.status === col)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelected(t)}
                    className="w-full rounded-sm border border-linha bg-white p-3 text-left hover:border-ink/30"
                  >
                    <p className="text-sm font-medium text-ink">{t.titulo}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.quadro} · {t.responsavel} · {t.prazo}
                    </p>
                  </button>
                ))}
              {!filtered.some((t) => t.status === col) ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Vazio
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable
        onRowClick={(i) => setSelected(filtered[i])}
        columns={[
          { key: "titulo", label: "Tarefa" },
          { key: "quadro", label: "Quadro" },
          { key: "responsavel", label: "Responsável" },
          { key: "prazo", label: "Prazo" },
          { key: "prioridade", label: "Prioridade" },
          { key: "status", label: "Status" },
        ]}
        rows={filtered.map((t) => ({
          titulo: <span className="font-medium">{t.titulo}</span>,
          quadro: t.quadro,
          responsavel: t.responsavel,
          prazo: t.prazo,
          prioridade: t.prioridade,
          status: (
            <StatusPill
              tone={
                t.status === "Concluída"
                  ? "ok"
                  : t.status === "Em andamento"
                    ? "info"
                    : "neutral"
              }
            >
              {t.status}
            </StatusPill>
          ),
        }))}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova tarefa"
        submitLabel="Criar"
        onSubmit={() => {
          if (!form.titulo.trim()) return;
          addTarefa(form);
          notify("Tarefa criada", form.titulo);
          setOpen(false);
          setForm({
            titulo: "",
            quadro: "Comercial",
            responsavel: "Comercial",
            prazo: "30/11/2026",
            prioridade: "Média",
            status: "A fazer",
          });
        }}
      >
        <Field label="Título">
          <Input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quadro">
            <select
              className={fieldControlClass}
              value={form.quadro}
              onChange={(e) => setForm({ ...form, quadro: e.target.value })}
            >
              {["Compras", "Carteira", "Comercial", "Regularização", "Obras"].map(
                (q) => (
                  <option key={q}>{q}</option>
                )
              )}
            </select>
          </Field>
          <Field label="Prioridade">
            <select
              className={fieldControlClass}
              value={form.prioridade}
              onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
            >
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Responsável">
            <Input
              value={form.responsavel}
              onChange={(e) =>
                setForm({ ...form, responsavel: e.target.value })
              }
            />
          </Field>
          <Field label="Prazo">
            <Input
              value={form.prazo}
              onChange={(e) => setForm({ ...form, prazo: e.target.value })}
            />
          </Field>
        </div>
      </FormDialog>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.titulo ?? "Tarefa"}
        footer={
          selected ? (
            <div className="flex flex-wrap gap-2">
              {COLUNAS.filter((c) => c !== selected.status).map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    moveTarefa(selected.id, c);
                    setSelected({ ...selected, status: c });
                    notify("Tarefa movida", c);
                  }}
                >
                  → {c}
                </Button>
              ))}
            </div>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="Quadro" value={selected.quadro} />
            <DetailRow label="Responsável" value={selected.responsavel} />
            <DetailRow label="Prazo" value={selected.prazo} />
            <DetailRow label="Prioridade" value={selected.prioridade} />
            <DetailRow label="Status" value={selected.status} />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
