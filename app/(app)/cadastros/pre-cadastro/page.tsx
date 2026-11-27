"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  notify,
} from "@/components/app/ModuleToolkit";
import { useFase1 } from "@/lib/store/fase1-store";
import { useNovoParam } from "@/lib/ui/use-novo-param";

export default function PreCadastroPage() {
  const { state, addPerson } = useFase1();
  const [open, setOpen] = useNovoParam();
  const [form, setForm] = useState({
    nome: "",
    documento: "",
    telefone: "",
    email: "",
    cidade: "",
  });

  const lista = state.people.filter((p) =>
    p.papeis.includes("pre_cadastro")
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Pré-cadastro de cliente"
        description="Origem da venda (H11). Converte para comprador na jornada de venda."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/vendas/nova">Nova venda</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Novo pré-cadastro
            </Button>
          </>
        }
      />
      <DataTable
        columns={[
          { key: "nome", label: "Nome" },
          { key: "doc", label: "Documento" },
          { key: "contato", label: "Contato" },
          { key: "cidade", label: "Cidade" },
          { key: "status", label: "Status" },
        ]}
        rows={lista.map((p) => ({
          nome: p.nome,
          doc: p.documento,
          contato: p.celular ?? p.telefone1 ?? p.email ?? "—",
          cidade: p.cidade ?? "—",
          status: <StatusPill tone="info">Pré-cadastro</StatusPill>,
        }))}
        empty="Nenhum pré-cadastro."
      />
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo pré-cadastro"
        onSubmit={() => {
          if (!form.nome.trim() || !form.documento.trim()) {
            notify("Nome e documento obrigatórios");
            return;
          }
          addPerson({
            tipo: "fisica",
            status: "ativo",
            nome: form.nome.trim(),
            documento: form.documento.trim(),
            papeis: ["pre_cadastro", "comprador"],
            celular: form.telefone || undefined,
            email: form.email || undefined,
            cidade: form.cidade || undefined,
          });
          notify("Pré-cadastro criado", form.nome);
          setOpen(false);
          setForm({
            nome: "",
            documento: "",
            telefone: "",
            email: "",
            cidade: "",
          });
        }}
      >
        <Field label="Nome *">
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </Field>
        <Field label="CPF/CNPJ *">
          <Input
            value={form.documento}
            onChange={(e) => setForm({ ...form, documento: e.target.value })}
          />
        </Field>
        <Field label="Telefone">
          <Input
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          />
        </Field>
        <Field label="E-mail">
          <Input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Cidade">
          <Input
            value={form.cidade}
            onChange={(e) => setForm({ ...form, cidade: e.target.value })}
          />
        </Field>
      </FormDialog>
    </div>
  );
}
