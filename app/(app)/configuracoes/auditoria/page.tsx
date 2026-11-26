"use client";

import {
  ModuleHeader,
  KpiGrid,
} from "@/components/app/ModulePage";
import { ProcessList } from "@/components/app/ProcessList";
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

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Auditoria"
        description="Quem, quando, rotina, ação e valores — lista filtrável (C14/C16)."
      />
      <KpiGrid items={[{ label: "Eventos", value: state.audit.length }]} />
      <ProcessList
        storageKey="auditoria"
        exportName="auditoria"
        rows={state.audit}
        empty="Sem eventos de auditoria."
        columns={[
          {
            key: "quando",
            label: "Quando",
            filter: { type: "period" },
            getValue: (a) => a.quando,
            render: (a) => formatQuando(a.quando),
          },
          {
            key: "usuario",
            label: "Usuário",
            filter: { type: "text" },
            getValue: (a) => a.usuarioNome,
          },
          {
            key: "rotina",
            label: "Rotina",
            filter: { type: "text" },
            getValue: (a) => a.rotina,
          },
          {
            key: "acao",
            label: "Ação",
            filter: { type: "text" },
            getValue: (a) => a.acao,
          },
          {
            key: "registro",
            label: "Registro",
            filter: { type: "text" },
            getValue: (a) =>
              a.registroTipo
                ? `${a.registroTipo}${a.registroId ? ` #${a.registroId}` : ""}`
                : "",
            render: (a) =>
              a.registroTipo
                ? `${a.registroTipo}${a.registroId ? ` #${a.registroId}` : ""}`
                : "—",
          },
          {
            key: "antes",
            label: "Antes",
            getValue: (a) => summarize(a.antes),
            render: (a) => (
              <span className="font-mono text-xs text-ink/70">
                {summarize(a.antes)}
              </span>
            ),
          },
          {
            key: "depois",
            label: "Depois",
            getValue: (a) => summarize(a.depois),
            render: (a) => (
              <span className="font-mono text-xs text-ink/70">
                {summarize(a.depois)}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
