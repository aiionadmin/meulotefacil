"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ModuleHeader,
  KpiGrid,
  ModuleSection,
  DataTable,
} from "@/components/app/ModulePage";
import { fieldControlClass } from "@/components/app/ModuleToolkit";
import { useFase1 } from "@/lib/store/fase1-store";
import {
  PERMISSION_ROUTINES,
  buildDefaultPermissionMatrix,
  type PermKey,
  type PermissionMatrix,
} from "@/lib/domain/permissoes";

const KEYS: { key: PermKey; label: string }[] = [
  { key: "ver", label: "Ver" },
  { key: "inserir", label: "Inserir/Alterar" },
  { key: "remover", label: "Remover" },
];

export default function PerfisPage() {
  const { state } = useFase1();
  const [profileId, setProfileId] = useState(state.profiles[0]?.id ?? "");

  const defaultMatrix = useMemo(
    () =>
      buildDefaultPermissionMatrix(state.profiles.map((p) => p.codigo)),
    [state.profiles]
  );

  const [matrix, setMatrix] = useState<PermissionMatrix>(defaultMatrix);

  useEffect(() => {
    setMatrix(defaultMatrix);
  }, [defaultMatrix]);

  const profile =
    state.profiles.find((p) => p.id === profileId) ?? state.profiles[0];
  const codigo = profile?.codigo ?? "administrador";

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Perfis de acesso"
        description="Matriz Ver / Inserir·Alterar / Remover nas rotinas novas (RDO, Demandas, Dashboard gerencial, portais). Perfis externos Corretor e Cliente restritos aos portais."
      />
      <KpiGrid
        items={[
          { label: "Perfis", value: state.profiles.length },
          {
            label: "Rotinas especiais",
            value: PERMISSION_ROUTINES.length,
          },
          {
            label: "Externos",
            value: PERMISSION_ROUTINES.filter((r) => r.externo).length,
          },
        ]}
      />

      <ModuleSection title="Perfis cadastrados">
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
      </ModuleSection>

      <ModuleSection title="Matriz de permissões">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted-foreground">Perfil</label>
          <select
            className={fieldControlClass + " max-w-xs"}
            value={profile?.id ?? ""}
            onChange={(e) => setProfileId(e.target.value)}
          >
            {state.profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.codigo})
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground">
                <th className="px-3 py-2 font-medium">Rotina</th>
                {KEYS.map((k) => (
                  <th key={k.key} className="px-3 py-2 font-medium">
                    {k.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_ROUTINES.map((routine) => {
                const row = matrix[codigo]?.[routine.codigo] ?? {
                  ver: false,
                  inserir: false,
                  remover: false,
                };
                return (
                  <tr key={routine.codigo} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <div className="font-medium text-ink">{routine.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {routine.codigo}
                        {routine.externo ? " · externo" : ""}
                      </div>
                    </td>
                    {KEYS.map((k) => (
                      <td key={k.key} className="px-3 py-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--brand-green,#0f5132)]"
                          checked={row[k.key]}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setMatrix((prev) => ({
                              ...prev,
                              [codigo]: {
                                ...prev[codigo],
                                [routine.codigo]: {
                                  ...prev[codigo][routine.codigo],
                                  [k.key]: checked,
                                },
                              },
                            }));
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Demo local: alterações ficam nesta sessão. Persistência no Supabase entra
          com a sincronização de produção.
        </p>
      </ModuleSection>
    </div>
  );
}
