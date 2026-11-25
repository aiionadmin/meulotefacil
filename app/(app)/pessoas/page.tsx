"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useDemoStore, type Pessoa } from "@/lib/store/demo-store";

const PAPEIS = [
  "Cliente",
  "Comprador",
  "Fornecedor",
  "Profissional",
  "Corretor",
  "Sócio",
  "Pré-cadastro",
];

export default function PessoasPage() {
  const { state, addPessoa, updatePessoa } = useDemoStore();
  const [q, setQ] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<Pessoa | null>(null);
  const [form, setForm] = useState({
    nome: "",
    doc: "",
    papeis: "Comprador",
    cidade: "Campinas",
    status: "Ativo",
    contato: "",
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.pessoas;
    return state.pessoas.filter((p) =>
      [p.nome, p.doc, p.cidade, p.contato, p.papeis.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.pessoas, q]);

  const criar = () => {
    if (!form.nome.trim()) return;
    addPessoa({
      nome: form.nome.trim(),
      doc: form.doc || "pendente",
      papeis: form.papeis.split(",").map((s) => s.trim()).filter(Boolean),
      cidade: form.cidade,
      status: form.status,
      contato: form.contato || "pendente",
    });
    notify("Pessoa cadastrada", form.nome);
    setOpenForm(false);
    setForm({
      nome: "",
      doc: "",
      papeis: "Comprador",
      cidade: "Campinas",
      status: "Ativo",
      contato: "",
    });
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Pessoas"
        description="Cadastro único com papéis: cliente, comprador, fornecedor, profissional, corretor e sócio."
        actions={
          <Button size="sm" onClick={() => setOpenForm(true)}>
            Nova pessoa
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Pessoas", value: state.pessoas.length },
          {
            label: "Compradores",
            value: state.pessoas.filter((p) => p.papeis.includes("Comprador")).length,
          },
          {
            label: "Fornecedores",
            value: state.pessoas.filter((p) => p.papeis.includes("Fornecedor")).length,
          },
          {
            label: "Corretores",
            value: state.pessoas.filter((p) => p.papeis.includes("Corretor")).length,
          },
        ]}
      />
      <FilterBar
        value={q}
        onChange={setQ}
        placeholder="Buscar por nome, documento, cidade…"
      />
      <DataTable
        onRowClick={(i) => setSelected(filtered[i])}
        columns={[
          { key: "nome", label: "Nome / razão social" },
          { key: "doc", label: "CPF/CNPJ" },
          { key: "papeis", label: "Papéis" },
          { key: "cidade", label: "Cidade" },
          { key: "contato", label: "Contato" },
          { key: "status", label: "Status" },
        ]}
        rows={filtered.map((p) => ({
          nome: <span className="font-medium">{p.nome}</span>,
          doc: p.doc,
          papeis: p.papeis.join(", "),
          cidade: p.cidade,
          contato: p.contato,
          status: (
            <StatusPill tone={p.status === "Ativo" ? "ok" : "warn"}>
              {p.status}
            </StatusPill>
          ),
        }))}
      />

      <FormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        title="Nova pessoa"
        onSubmit={criar}
        submitLabel="Cadastrar"
      >
        <Field label="Nome / razão social">
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
        </Field>
        <Field label="CPF/CNPJ">
          <Input
            value={form.doc}
            onChange={(e) => setForm({ ...form, doc: e.target.value })}
          />
        </Field>
        <Field label="Papel principal">
          <select
            className={fieldControlClass}
            value={form.papeis}
            onChange={(e) => setForm({ ...form, papeis: e.target.value })}
          >
            {PAPEIS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cidade">
            <Input
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
            />
          </Field>
          <Field label="Contato">
            <Input
              value={form.contato}
              onChange={(e) => setForm({ ...form, contato: e.target.value })}
            />
          </Field>
        </div>
      </FormDialog>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.nome ?? "Pessoa"}
        footer={
          selected ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const next =
                    selected.status === "Ativo" ? "Afastado" : "Ativo";
                  updatePessoa(selected.id, { status: next });
                  setSelected({ ...selected, status: next });
                  notify("Status atualizado", next);
                }}
              >
                Alternar status
              </Button>
              <Button size="sm" onClick={() => setSelected(null)}>
                Fechar
              </Button>
            </>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="Documento" value={selected.doc} />
            <DetailRow label="Papéis" value={selected.papeis.join(", ")} />
            <DetailRow label="Cidade" value={selected.cidade} />
            <DetailRow label="Contato" value={selected.contato} />
            <DetailRow label="Status" value={selected.status} />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
