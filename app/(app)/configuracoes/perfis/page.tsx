"use client";

import { useMemo, useState } from "react";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
} from "@/components/app/ModulePage";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useFase1 } from "@/lib/store/fase1-store";
import { PERMISSION_ROUTINES } from "@/lib/permissions/routines";
import { notify } from "@/components/app/ModuleToolkit";

export default function PerfisPage() {
  const { state, setProfilePermission, can } = useFase1();
  const [profileId, setProfileId] = useState(state.profiles[0]?.id ?? "");

  const selected = state.profiles.find((p) => p.id === profileId);
  const canEdit = can("usuarios", "inserirAlterar");

  const rows = useMemo(() => {
    return PERMISSION_ROUTINES.map((rotina) => {
      const perm = state.permissions.find(
        (p) => p.profileId === profileId && p.rotina === rotina.id
      );
      return {
        rotina,
        ver: perm?.ver ?? false,
        inserirAlterar: perm?.inserirAlterar ?? false,
        remover: perm?.remover ?? false,
      };
    });
  }, [state.permissions, profileId]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Perfis de acesso"
        description="Matriz por rotina: Visualizar, Inserir e Alterar, Remover. Persistida no store e na tabela profile_permissions (Supabase)."
      />
      <KpiGrid
        items={[
          { label: "Perfis", value: state.profiles.length },
          {
            label: "Permissões do perfil",
            value: rows.filter((r) => r.ver || r.inserirAlterar || r.remover)
              .length,
          },
        ]}
      />

      <DataTable
        columns={[
          { key: "codigo", label: "Código" },
          { key: "nome", label: "Nome" },
          { key: "descricao", label: "Descrição" },
          { key: "usuarios", label: "Usuários" },
        ]}
        rows={state.profiles.map((p) => ({
          codigo: p.codigo,
          nome: <span className="font-medium">{p.nome}</span>,
          descricao: p.descricao,
          usuarios: state.users.filter((u) => u.profileId === p.id).length,
        }))}
      />

      <div className="space-y-3 rounded-lg border border-ink/10 bg-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="perfil-matriz">Perfil para editar a matriz</Label>
            <select
              id="perfil-matriz"
              className="flex h-10 w-[260px] rounded-md border border-ink/15 bg-paper px-3 text-sm text-ink"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
            >
              {state.profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
          {selected ? (
            <p className="text-sm text-ink/70">{selected.descricao}</p>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-ink/70">
                <th className="py-2 pr-3 font-medium">Rotina</th>
                <th className="py-2 px-2 font-medium">Visualizar</th>
                <th className="py-2 px-2 font-medium">Inserir e Alterar</th>
                <th className="py-2 px-2 font-medium">Remover</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rotina.id} className="border-b border-ink/5">
                  <td className="py-2 pr-3">{row.rotina.label}</td>
                  {(
                    [
                      ["ver", row.ver],
                      ["inserirAlterar", row.inserirAlterar],
                      ["remover", row.remover],
                    ] as const
                  ).map(([key, checked]) => (
                    <td key={key} className="py-2 px-2">
                      <Checkbox
                        checked={checked}
                        disabled={!canEdit}
                        onCheckedChange={(v) => {
                          const next = {
                            ver: row.ver,
                            inserirAlterar: row.inserirAlterar,
                            remover: row.remover,
                            [key]: v === true,
                          };
                          setProfilePermission(profileId, row.rotina.id, next);
                          notify("Permissão atualizada", row.rotina.label);
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
