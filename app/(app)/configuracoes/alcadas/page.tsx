"use client";

import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  StatusPill,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { formatBRL } from "@/lib/masks/br";
import { useFase1 } from "@/lib/store/fase1-store";

export default function AlcadasPage() {
  const { state, toggleApprovalRule } = useFase1();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Alçadas"
        description="J03 — OC, SC, RDO, gerencial, desconto e estorno; lista com lote (C15)."
      />
      <ProcessList
        storageKey="alcadas"
        exportName="alcadas"
        rows={state.approvalRules}
        empty="Sem alçadas."
        bulkActions={[
          {
            label: "Ativar seleção",
            onClick: (ids) => {
              let n = 0;
              for (const id of ids) {
                const r = state.approvalRules.find((x) => x.id === id);
                if (r && !r.ativo) {
                  toggleApprovalRule(id);
                  n += 1;
                }
              }
              notify(n ? `${n} ativada(s)` : "Nenhuma inativa");
            },
          },
          {
            label: "Desativar seleção",
            onClick: (ids) => {
              let n = 0;
              for (const id of ids) {
                const r = state.approvalRules.find((x) => x.id === id);
                if (r && r.ativo) {
                  toggleApprovalRule(id);
                  n += 1;
                }
              }
              notify(n ? `${n} desativada(s)` : "Nenhuma ativa");
            },
          },
        ]}
        columns={[
          {
            key: "tipo",
            label: "Tipo",
            filter: { type: "text" },
            getValue: (r) => r.tipo,
            render: (r) => <span className="font-medium">{r.tipo}</span>,
          },
          {
            key: "perfil",
            label: "Perfil",
            filter: { type: "text" },
            getValue: (r) => r.perfilNome,
          },
          {
            key: "minimo",
            label: "Valor mínimo",
            filter: { type: "range" },
            getValue: (r) => r.valorMinimo ?? 0,
            render: (r) =>
              r.valorMinimo != null
                ? r.tipo.includes("Desconto")
                  ? `${r.valorMinimo}%`
                  : formatBRL(r.valorMinimo)
                : "—",
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: [
                { value: "ativa", label: "Ativa" },
                { value: "inativa", label: "Inativa" },
              ],
            },
            getValue: (r) => (r.ativo ? "ativa" : "inativa"),
            render: (r) => (
              <StatusPill tone={r.ativo ? "ok" : "warn"}>
                {r.ativo ? "Ativa" : "Inativa"}
              </StatusPill>
            ),
          },
          {
            key: "acao",
            label: "",
            getValue: () => "",
            render: (r) => (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleApprovalRule(r.id);
                  notify(r.ativo ? "Alçada desativada" : "Alçada ativada");
                }}
              >
                Alternar
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
