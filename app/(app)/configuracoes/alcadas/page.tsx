"use client";

import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useFase1 } from "@/lib/store/fase1-store";

export default function AlcadasPage() {
  const { state, toggleApprovalRule } = useFase1();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Alçadas"
        description="J03 — OC, SC, RDO, relatório gerencial, desconciliar, correção de card, conciliação, desconto e estorno."
      />
      <DataTable
        columns={[
          { key: "tipo", label: "Tipo" },
          { key: "perfil", label: "Perfil" },
          { key: "minimo", label: "Valor mínimo" },
          { key: "status", label: "Status" },
          { key: "acao", label: "" },
        ]}
        rows={state.approvalRules.map((r) => ({
          tipo: <span className="font-medium">{r.tipo}</span>,
          perfil: r.perfilNome,
          minimo:
            r.valorMinimo != null
              ? r.tipo.includes("Desconto")
                ? `${r.valorMinimo}%`
                : formatBRL(r.valorMinimo)
              : "—",
          status: (
            <StatusPill tone={r.ativo ? "ok" : "warn"}>
              {r.ativo ? "Ativa" : "Inativa"}
            </StatusPill>
          ),
          acao: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                toggleApprovalRule(r.id);
                notify(r.ativo ? "Alçada desativada" : "Alçada ativada");
              }}
            >
              Alternar
            </Button>
          ),
        }))}
      />
    </div>
  );
}
