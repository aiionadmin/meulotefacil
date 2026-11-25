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
  DetailRow,
  DetailSheet,
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useDemoStore, type Arquivo } from "@/lib/store/demo-store";

export default function ArquivosPage() {
  const { state, addArquivo } = useDemoStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Arquivo | null>(null);
  const [form, setForm] = useState({
    nome: "",
    rotina: "Vendas",
    tag: "Documento",
    tamanho: "120 KB",
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.arquivos;
    return state.arquivos.filter((a) =>
      [a.nome, a.rotina, a.tag].join(" ").toLowerCase().includes(term)
    );
  }, [state.arquivos, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Arquivos"
        description="Repositório central com tags por rotina (contratos, plantas, NFe, ART)."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Enviar arquivo
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Arquivos", value: state.arquivos.length },
          {
            label: "Tags",
            value: new Set(state.arquivos.map((a) => a.tag)).size,
          },
          {
            label: "Rotinas",
            value: new Set(state.arquivos.map((a) => a.rotina)).size,
          },
          {
            label: "Filtrados",
            value: filtered.length,
          },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar arquivo…" />
      <DataTable
        onRowClick={(i) => setSelected(filtered[i])}
        columns={[
          { key: "nome", label: "Arquivo" },
          { key: "rotina", label: "Rotina" },
          { key: "tag", label: "Tag" },
          { key: "tamanho", label: "Tamanho" },
          { key: "quando", label: "Quando" },
        ]}
        rows={filtered.map((a) => ({
          nome: <span className="font-medium">{a.nome}</span>,
          rotina: a.rotina,
          tag: a.tag,
          tamanho: a.tamanho,
          quando: a.quando,
        }))}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Enviar arquivo (demo)"
        submitLabel="Registrar"
        onSubmit={() => {
          if (!form.nome.trim()) return;
          addArquivo(form);
          notify("Arquivo registrado", form.nome);
          setOpen(false);
          setForm({
            nome: "",
            rotina: "Vendas",
            tag: "Documento",
            tamanho: "120 KB",
          });
        }}
      >
        <Field label="Nome do arquivo">
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="ex.: contrato-CTR-3201.pdf"
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
              {[
                "Vendas",
                "Empreendimentos",
                "Fiscal",
                "Obras",
                "Regularização",
                "Financeiro",
              ].map((r) => (
                <option key={r}>{r}</option>
              ))}
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

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.nome ?? "Arquivo"}
      >
        {selected ? (
          <>
            <DetailRow label="Rotina" value={selected.rotina} />
            <DetailRow label="Tag" value={selected.tag} />
            <DetailRow label="Tamanho" value={selected.tamanho} />
            <DetailRow label="Quando" value={selected.quando} />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
