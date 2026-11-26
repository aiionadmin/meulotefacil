"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import { Field, FormDialog, notify } from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { SearchSelect } from "@/components/app/SearchSelect";
import { useEmpresa } from "@/lib/empresa/context";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { useObras } from "@/lib/store/obras-store";

export default function UsuariosConfigPage() {
  const { state, addUser, updateUser } = useFase1();
  const { empresas } = useEmpresa();
  const { state: cart } = useCarteira();
  const { state: obras } = useObras();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    profileId: state.profiles[0]?.id ?? "",
    chave: false,
    todasEmpresas: true,
    organizationIds: [] as string[],
    verTodasObras: true,
    developmentIds: [] as string[],
    obraIds: [] as string[],
  });

  const editUser = useMemo(
    () => (editId ? state.users.find((u) => u.id === editId) : null),
    [editId, state.users]
  );

  const openCreate = () => {
    setEditId(null);
    setForm({
      nome: "",
      email: "",
      profileId: state.profiles[0]?.id ?? "",
      chave: false,
      todasEmpresas: true,
      organizationIds: [state.organization.id],
      verTodasObras: true,
      developmentIds: [],
      obraIds: [],
    });
    setOpen(true);
  };

  const openEdit = (id: string) => {
    const u = state.users.find((x) => x.id === id);
    if (!u) return;
    setEditId(id);
    setForm({
      nome: u.nome,
      email: u.email,
      profileId: u.profileId,
      chave: u.chave,
      todasEmpresas: u.todasEmpresas ?? u.organizationIds.length > 1,
      organizationIds: u.organizationIds,
      verTodasObras: u.verTodasObras ?? true,
      developmentIds: u.developmentIds ?? [],
      obraIds: u.obraIds ?? [],
    });
    setOpen(true);
  };

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Usuários"
        description="J02 — perfil, usuário-chave e visibilidade de empresas, empreendimentos e obras."
        actions={
          <Button size="sm" onClick={openCreate}>
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
      <ProcessList
        storageKey="usuarios-config"
        exportName="usuarios"
        rows={state.users}
        empty="Sem usuários."
        bulkActions={[
          {
            label: "Ativar seleção",
            onClick: (ids) => {
              for (const id of ids) updateUser(id, { status: "ativo" });
              notify(`${ids.length} ativado(s)`);
            },
          },
          {
            label: "Inativar seleção",
            onClick: (ids) => {
              for (const id of ids) updateUser(id, { status: "inativo" });
              notify(`${ids.length} inativado(s)`);
            },
          },
        ]}
        columns={[
          {
            key: "nome",
            label: "Nome",
            filter: { type: "text" },
            getValue: (u) => u.nome,
            render: (u) => <span className="font-medium">{u.nome}</span>,
          },
          {
            key: "email",
            label: "E-mail",
            filter: { type: "text" },
            getValue: (u) => u.email,
          },
          {
            key: "perfil",
            label: "Perfil",
            filter: { type: "text" },
            getValue: (u) =>
              state.profiles.find((p) => p.id === u.profileId)?.nome ?? "",
          },
          {
            key: "empresas",
            label: "Empresas",
            filter: { type: "text" },
            getValue: (u) =>
              u.todasEmpresas
                ? "todas"
                : String(u.organizationIds.length),
            render: (u) =>
              u.todasEmpresas
                ? "Todas"
                : `${u.organizationIds.length} empresa(s)`,
          },
          {
            key: "chave",
            label: "Chave",
            filter: {
              type: "status",
              options: [
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ],
            },
            getValue: (u) => (u.chave ? "sim" : "nao"),
            render: (u) => (u.chave ? "Sim" : "Não"),
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: [
                { value: "ativo", label: "Ativo" },
                { value: "inativo", label: "Inativo" },
              ],
            },
            getValue: (u) => u.status,
            render: (u) => (
              <StatusPill tone={u.status === "ativo" ? "ok" : "warn"}>
                {u.status}
              </StatusPill>
            ),
          },
          {
            key: "acao",
            label: "",
            getValue: () => "",
            render: (u) => (
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(u.id);
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = u.status === "ativo" ? "inativo" : "ativo";
                    updateUser(u.id, { status: next });
                    notify("Status atualizado", next);
                  }}
                >
                  Alternar
                </Button>
              </div>
            ),
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editUser ? "Editar usuário" : "Novo usuário"}
        submitLabel={editUser ? "Salvar" : "Criar"}
        onSubmit={() => {
          if (!form.nome || !form.email) {
            notify("Nome e e-mail obrigatórios");
            return;
          }
          const orgs = form.todasEmpresas
            ? empresas.map((e) => e.id)
            : form.organizationIds.length
              ? form.organizationIds
              : [state.organization.id];
          const payload = {
            nome: form.nome,
            email: form.email,
            status: "ativo" as const,
            chave: form.chave,
            profileId: form.profileId,
            organizationIds: orgs,
            todasEmpresas: form.todasEmpresas,
            verTodasObras: form.verTodasObras,
            developmentIds: form.verTodasObras ? [] : form.developmentIds,
            obraIds: form.verTodasObras ? [] : form.obraIds,
          };
          if (editId) {
            updateUser(editId, payload);
            notify("Usuário atualizado", form.email);
          } else {
            addUser(payload);
            notify("Usuário criado", form.email);
          }
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
          <SearchSelect
            value={form.profileId}
            onChange={(profileId) => setForm({ ...form, profileId })}
            placeholder="Buscar perfil…"
            options={state.profiles.map((p) => ({
              value: p.id,
              label: p.nome,
            }))}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.chave}
            onChange={(e) => setForm({ ...form, chave: e.target.checked })}
          />
          Usuário-chave
        </label>
        <Field label="Visibilidade de empresas (J02)">
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.todasEmpresas}
              onChange={(e) =>
                setForm({ ...form, todasEmpresas: e.target.checked })
              }
            />
            Todas as empresas
          </label>
          {!form.todasEmpresas ? (
            <div className="space-y-1">
              {empresas.map((e) => (
                <label key={e.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.organizationIds.includes(e.id)}
                    onChange={() =>
                      setForm({
                        ...form,
                        organizationIds: toggleId(
                          form.organizationIds,
                          e.id
                        ),
                      })
                    }
                  />
                  {e.nome}
                </label>
              ))}
            </div>
          ) : null}
        </Field>
        <Field label="Visibilidade de obras / empreendimentos">
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.verTodasObras}
              onChange={(e) =>
                setForm({ ...form, verTodasObras: e.target.checked })
              }
            />
            Ver todas as obras e empreendimentos
          </label>
          {!form.verTodasObras ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  Empreendimentos
                </p>
                {cart.developments.map((d) => (
                  <label
                    key={d.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.developmentIds.includes(d.id)}
                      onChange={() =>
                        setForm({
                          ...form,
                          developmentIds: toggleId(
                            form.developmentIds,
                            d.id
                          ),
                        })
                      }
                    />
                    {d.nome}
                  </label>
                ))}
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Obras</p>
                {obras.obras.map((o) => (
                  <label
                    key={o.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.obraIds.includes(o.id)}
                      onChange={() =>
                        setForm({
                          ...form,
                          obraIds: toggleId(form.obraIds, o.id),
                        })
                      }
                    />
                    {o.nome}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </Field>
      </FormDialog>
    </div>
  );
}
