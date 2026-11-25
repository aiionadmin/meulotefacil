"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useFase1 } from "@/lib/store/fase1-store";
import type { AppTask } from "@/lib/domain/fase1-types";

const COLS: AppTask["status"][] = ["a_fazer", "em_andamento", "concluida"];
const LABELS: Record<AppTask["status"], string> = {
  a_fazer: "A fazer",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

export default function TarefasPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
      <TarefasInner />
    </Suspense>
  );
}

function TarefasInner() {
  const { state, addTask, moveTask } = useFase1();
  const search = useSearchParams();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(search.get("novo") === "1");
  const [form, setForm] = useState({
    titulo: "",
    prioridade: "media" as AppTask["prioridade"],
    prazo: "30/11/2026",
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.tasks;
    return state.tasks.filter((t) =>
      [t.titulo, t.responsavelNome, t.status].join(" ").toLowerCase().includes(term)
    );
  }, [state.tasks, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Minhas tarefas"
        description="Tarefas do usuário logado, por prazo e prioridade."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Nova tarefa
          </Button>
        }
      />
      <KpiGrid
        items={COLS.map((c) => ({
          label: LABELS[c],
          value: state.tasks.filter((t) => t.status === c).length,
        }))}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar tarefa…" />
      <div className="grid gap-4 lg:grid-cols-3">
        {COLS.map((col) => (
          <Card key={col}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{LABELS[col]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filtered
                .filter((t) => t.status === col)
                .map((t) => (
                  <div
                    key={t.id}
                    className="rounded-sm border border-linha bg-white p-3"
                  >
                    <p className="text-sm font-medium text-ink">{t.titulo}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.responsavelNome} · {t.prazo}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <StatusPill tone="info">{t.prioridade}</StatusPill>
                      {COLS.filter((c) => c !== t.status).map((c) => (
                        <Button
                          key={c}
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            moveTask(t.id, c);
                            notify("Tarefa movida", LABELS[c]);
                          }}
                        >
                          → {LABELS[c]}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

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
            responsavelNome: "Admin Demo",
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
