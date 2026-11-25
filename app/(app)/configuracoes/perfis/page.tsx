"use client";

import {
  ModuleHeader,
  KpiGrid,
  DataTable,
} from "@/components/app/ModulePage";
import { useFase1 } from "@/lib/store/fase1-store";

export default function PerfisPage() {
  const { state } = useFase1();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Perfis de acesso"
        description="Doze perfis iniciais (§3.1). A matriz completa ver/inserir/remover por rotina entra com o backend Supabase."
      />
      <KpiGrid items={[{ label: "Perfis", value: state.profiles.length }]} />
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
    </div>
  );
}
