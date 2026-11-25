"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
} from "@/components/app/ModulePage";
import {
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useFase1 } from "@/lib/store/fase1-store";

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

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Arquivos"
        description="Repositório central com tags. Limite de 10 MB por arquivo no Storage (Supabase)."
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
      <DataTable
        columns={[
          { key: "nome", label: "Arquivo" },
          { key: "rotina", label: "Rotina" },
          { key: "tag", label: "Tag" },
          { key: "tamanho", label: "Tamanho" },
        ]}
        rows={filtered.map((a) => ({
          nome: <span className="font-medium">{a.nome}</span>,
          rotina: a.rotina,
          tag: a.tag,
          tamanho: a.tamanho,
        }))}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Registrar arquivo (demo)"
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
              {["Cadastros", "Contratos", "Obras", "Fiscal", "Regularização"].map(
                (r) => (
                  <option key={r}>{r}</option>
                )
              )}
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
