"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
} from "@/components/app/ModulePage";
import {
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { useFase1 } from "@/lib/store/fase1-store";
import type { AppFile } from "@/lib/domain/fase1-types";

export default function ArquivosPage() {
  const { state, addFile } = useFase1();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    rotina: "Cadastros",
    tag: "Documento",
    tamanho: "120 KB",
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.files;
    return state.files.filter((a) =>
      [a.nome, a.rotina, a.tag].join(" ").toLowerCase().includes(term)
    );
  }, [state.files, q]);

  const columns = useMemo(() => {
    const tags = [...new Set(state.files.map((f) => f.tag || "Sem tag"))];
    if (!tags.length) return [{ id: "Documento", label: "Documento" }];
    return tags.map((t) => ({ id: t, label: t }));
  }, [state.files]);

  const toCard = useCallback(
    (a: AppFile) => ({
      id: a.id,
      columnId: a.tag || "Documento",
      title: a.nome,
      subtitle: a.rotina,
      badge: a.tamanho,
      meta: a.createdAt.slice(0, 10),
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Arquivos"
        description="Kanban | Lista por tag (C19). Limite de 10 MB no Storage."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Enviar arquivo
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Arquivos", value: state.files.length },
          {
            label: "Tags",
            value: new Set(state.files.map((a) => a.tag)).size,
          },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar arquivo…" />
      <ProcessBoard
        storageKey="arquivos"
        columns={columns}
        rows={filtered}
        toCard={toCard}
        onMove={() => {
          notify("Altere a tag ao editar o arquivo");
          return false;
        }}
        exportName="arquivos"
        listColumns={[
          {
            key: "nome",
            label: "Arquivo",
            filter: { type: "text" },
            getValue: (a) => a.nome,
          },
          {
            key: "rotina",
            label: "Rotina",
            filter: { type: "text" },
            getValue: (a) => a.rotina,
          },
          {
            key: "tag",
            label: "Tag",
            filter: { type: "text" },
            getValue: (a) => a.tag,
          },
          {
            key: "tamanho",
            label: "Tamanho",
            filter: { type: "text" },
            getValue: (a) => a.tamanho,
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Registrar arquivo"
        submitLabel="Salvar"
        onSubmit={() => {
          if (!form.nome.trim()) return;
          addFile(form);
          notify("Arquivo registrado", form.nome);
          setOpen(false);
        }}
      >
        <Field label="Nome">
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rotina">
            <select
              className={fieldControlClass}
              value={form.rotina}
              onChange={(e) => setForm({ ...form, rotina: e.target.value })}
            >
              <option>Cadastros</option>
              <option>Contratos</option>
              <option>Financeiro</option>
              <option>Obras</option>
              <option>Compras</option>
            </select>
          </Field>
          <Field label="Tag">
            <Input
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
            />
          </Field>
        </div>
      </FormDialog>
    </div>
  );
}
