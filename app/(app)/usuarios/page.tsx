"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
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
import { useDemoStore, type Usuario } from "@/lib/store/demo-store";

export default function UsuariosPage() {
  const { state, addUsuario, updateUsuario } = useDemoStore();
  const [q, setQ] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    perfil: "Comercial",
    status: "Ativo",
    chave: false,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.usuarios;
    return state.usuarios.filter((u) =>
      [u.nome, u.email, u.perfil].join(" ").toLowerCase().includes(term)
    );
  }, [state.usuarios, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Usuários e auditoria"
        description="Perfis com alçadas, visibilidade por empresa/obra e histórico de alterações."
        actions={
          <Button size="sm" onClick={() => setOpenForm(true)}>
            Novo usuário
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Usuários", value: state.usuarios.length },
          {
            label: "Ativos",
            value: state.usuarios.filter((u) => u.status === "Ativo").length,
          },
          {
            label: "Chaves",
            value: state.usuarios.filter((u) => u.chave).length,
          },
          { label: "Eventos auditoria", value: state.auditoria.length },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar usuário…" />
      <DataTable
        onRowClick={(i) => setSelected(filtered[i])}
        columns={[
          { key: "nome", label: "Nome" },
          { key: "email", label: "E-mail" },
          { key: "perfil", label: "Perfil" },
          { key: "chave", label: "Chave" },
          { key: "status", label: "Status" },
        ]}
        rows={filtered.map((u) => ({
          nome: <span className="font-medium">{u.nome}</span>,
          email: u.email,
          perfil: u.perfil,
          chave: u.chave ? "Sim" : "Não",
          status: (
            <StatusPill tone={u.status === "Ativo" ? "ok" : "warn"}>
              {u.status}
            </StatusPill>
          ),
        }))}
      />

      <ModuleSection title="Auditoria recente">
        <DataTable
          columns={[
            { key: "quando", label: "Quando" },
            { key: "usuario", label: "Usuário" },
            { key: "rotina", label: "Rotina" },
            { key: "acao", label: "Ação" },
          ]}
          rows={state.auditoria.slice(0, 12).map((a) => ({
            quando: a.quando,
            usuario: a.usuario,
            rotina: a.rotina,
            acao: a.acao,
          }))}
        />
      </ModuleSection>

      <FormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        title="Novo usuário"
        submitLabel="Criar"
        onSubmit={() => {
          if (!form.nome || !form.email) return;
          addUsuario(form);
          notify("Usuário criado", form.email);
          setOpenForm(false);
          setForm({
            nome: "",
            email: "",
            perfil: "Comercial",
            status: "Ativo",
            chave: false,
          });
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
            value={form.perfil}
            onChange={(e) => setForm({ ...form, perfil: e.target.value })}
          >
            {["Administrador", "Financeiro", "Comercial", "Gestão de obra"].map(
              (p) => (
                <option key={p}>{p}</option>
              )
            )}
          </select>
        </Field>
      </FormDialog>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.nome ?? "Usuário"}
        footer={
          selected ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const next = selected.status === "Ativo" ? "Inativo" : "Ativo";
                updateUsuario(selected.id, { status: next });
                setSelected({ ...selected, status: next });
                notify("Status atualizado", next);
              }}
            >
              Alternar status
            </Button>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="E-mail" value={selected.email} />
            <DetailRow label="Perfil" value={selected.perfil} />
            <DetailRow label="Chave" value={selected.chave ? "Sim" : "Não"} />
            <DetailRow label="Status" value={selected.status} />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
