"use client";

import { useMemo, useState } from "react";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
} from "@/components/app/ModulePage";
import { FilterBar } from "@/components/app/ModuleToolkit";
import { useFase1 } from "@/lib/store/fase1-store";

export default function AuditoriaPage() {
  const { state } = useFase1();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.audit;
    return state.audit.filter((a) =>
      [a.usuarioNome, a.rotina, a.acao].join(" ").toLowerCase().includes(term)
    );
  }, [state.audit, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Auditoria"
        description="Quem, quando, rotina e ação. Dados pessoais sensíveis não entram no log."
      />
      <KpiGrid items={[{ label: "Eventos", value: state.audit.length }]} />
      <FilterBar value={q} onChange={setQ} placeholder="Filtrar auditoria…" />
      <DataTable
        columns={[
          { key: "quando", label: "Quando" },
          { key: "usuario", label: "Usuário" },
          { key: "rotina", label: "Rotina" },
          { key: "acao", label: "Ação" },
        ]}
        rows={filtered.map((a) => ({
          quando: a.quando,
          usuario: a.usuarioNome,
          rotina: a.rotina,
          acao: a.acao,
        }))}
      />
    </div>
  );
}
