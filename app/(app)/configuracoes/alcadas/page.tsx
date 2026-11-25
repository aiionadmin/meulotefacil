"use client";

import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useFase1 } from "@/lib/store/fase1-store";
import { podeAprovarPorAlcada, perfilRank } from "@/lib/domain/alcadas";

export default function AlcadasPage() {
  const { state, toggleApprovalRule, currentUser } = useFase1();
  const perfil =
    state.profiles.find((p) => p.id === currentUser?.profileId)?.nome ??
    "Administrador";

  const simOc5k = podeAprovarPorAlcada(
    state.approvalRules,
    "Ordem de compra",
    5000,
    perfil
  );
  const simOc60k = podeAprovarPorAlcada(
    state.approvalRules,
    "Ordem de compra",
    60000,
    perfil
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Alçadas"
        description="Aprovadores por faixa de valor (SC/OC) e quem concilia / desconcilia."
      />

      <ModuleSection title="Seu perfil agora">
        <p className="text-sm">
          {perfil} (rank {perfilRank(perfil)}) · OC R$ 5.000:{" "}
          <StatusPill tone={simOc5k.ok ? "ok" : "danger"}>
            {simOc5k.ok ? "pode aprovar" : "bloqueado"}
          </StatusPill>{" "}
          · OC R$ 60.000:{" "}
          <StatusPill tone={simOc60k.ok ? "ok" : "danger"}>
            {simOc60k.ok ? "pode aprovar" : "bloqueado"}
          </StatusPill>
        </p>
        {!simOc60k.ok && simOc60k.motivo ? (
          <p className="mt-1 text-xs text-muted-foreground">{simOc60k.motivo}</p>
        ) : null}
      </ModuleSection>

      <DataTable
        columns={[
          { key: "tipo", label: "Tipo" },
          { key: "perfil", label: "Perfil mínimo" },
          { key: "minimo", label: "Faixa / valor mín." },
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
