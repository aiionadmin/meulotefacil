"use client";

import { useMemo, useState } from "react";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
} from "@/components/app/ModulePage";
import { FilterBar } from "@/components/app/ModuleToolkit";
import { useFase1 } from "@/lib/store/fase1-store";

function formatQuando(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR");
}

function summarize(value: unknown) {
  if (value == null) return "—";
  try {
    const s = JSON.stringify(value);
    return s.length > 80 ? `${s.slice(0, 77)}…` : s;
  } catch {
    return String(value);
  }
}

export default function AuditoriaPage() {
  const { state } = useFase1();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.audit;
    return state.audit.filter((a) =>
      [a.usuarioNome, a.rotina, a.acao, a.registroTipo, a.registroId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.audit, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Auditoria"
        description="Quem, quando, rotina, ação, registro e valores antes/depois. Dados pessoais sensíveis não entram no log."
      />
      <KpiGrid items={[{ label: "Eventos", value: state.audit.length }]} />
      <FilterBar value={q} onChange={setQ} placeholder="Filtrar auditoria…" />
      <DataTable
        columns={[
          { key: "quando", label: "Quando" },
          { key: "usuario", label: "Usuário" },
          { key: "rotina", label: "Rotina" },
          { key: "acao", label: "Ação" },
          { key: "registro", label: "Registro" },
          { key: "antes", label: "Antes" },
          { key: "depois", label: "Depois" },
        ]}
        rows={filtered.map((a) => ({
          quando: formatQuando(a.quando),
          usuario: a.usuarioNome,
          rotina: a.rotina,
          acao: a.acao,
          registro: a.registroTipo
            ? `${a.registroTipo}${a.registroId ? ` #${a.registroId}` : ""}`
            : "—",
          antes: (
            <span className="font-mono text-xs text-ink/70">
              {summarize(a.antes)}
            </span>
          ),
          depois: (
            <span className="font-mono text-xs text-ink/70">
              {summarize(a.depois)}
            </span>
          ),
        }))}
      />
    </div>
  );
}
