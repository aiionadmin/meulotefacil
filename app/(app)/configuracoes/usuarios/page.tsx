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
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useFase1 } from "@/lib/store/fase1-store";

export default function UsuariosConfigPage() {
  const { state, addUser, updateUser } = useFase1();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    profileId: state.profiles[0]?.id ?? "",
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.users;
    return state.users.filter((u) =>
      [u.nome, u.email].join(" ").toLowerCase().includes(term)
    );
  }, [state.users, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Usuários"
        description="Nome, e-mail, perfil, status e usuário-chave. Visibilidade de empresas e empreendimentos no cadastro."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Novo usuário
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Usuários", value: state.users.length },
          {
            label: "Ativos",
            value: state.users.filter((u) => u.status === "ativo").length,
          },
          {
            label: "Chaves",
            value: state.users.filter((u) => u.chave).length,
          },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar usuário…" />
      <DataTable
        columns={[
          { key: "nome", label: "Nome" },
          { key: "email", label: "E-mail" },
          { key: "perfil", label: "Perfil" },
          { key: "chave", label: "Chave" },
          { key: "status", label: "Status" },
          { key: "acao", label: "" },
        ]}
        rows={filtered.map((u) => {
          const perfil = state.profiles.find((p) => p.id === u.profileId);
          return {
            nome: <span className="font-medium">{u.nome}</span>,
            email: u.email,
            perfil: perfil?.nome ?? "—",
            chave: u.chave ? "Sim" : "Não",
            status: (
              <StatusPill tone={u.status === "ativo" ? "ok" : "warn"}>
                {u.status}
              </StatusPill>
            ),
            acao: (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const next = u.status === "ativo" ? "inativo" : "ativo";
                  updateUser(u.id, { status: next });
                  notify("Status atualizado", next);
                }}
              >
                Alternar
              </Button>
            ),
          };
        })}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo usuário"
        submitLabel="Criar"
        onSubmit={() => {
          if (!form.nome || !form.email) return;
          addUser({
            nome: form.nome,
            email: form.email,
            status: "ativo",
            chave: false,
            profileId: form.profileId,
            organizationIds: [state.organization.id],
          });
          notify("Usuário criado", form.email);
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
        <Field label="E-mail">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </Field>
        <Field label="Perfil">
          <select
            className={fieldControlClass}
            value={form.profileId}
            onChange={(e) => setForm({ ...form, profileId: e.target.value })}
          >
            {state.profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </Field>
      </FormDialog>
    </div>
  );
}
