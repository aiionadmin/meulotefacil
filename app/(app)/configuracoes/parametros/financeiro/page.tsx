"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";
import { recordAudit } from "@/lib/audit/client-audit";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import { useFase1 } from "@/lib/store/fase1-store";

export default function ParametrosFinanceiroPage() {
  const { state, updateConfig } = useFinanceiro();
  const { currentUser } = useFase1();
  const cfg = state.config;
  const [meses, setMeses] = useState(cfg.mesesProvisionamento);
  const [docLan, setDocLan] = useState(cfg.numeroDocObrigatorioLancamento);
  const [docPag, setDocPag] = useState(cfg.numeroDocObrigatorioPagamento);
  const [abrirEtapas, setAbrirEtapas] = useState(
    cfg.abrirEtapasItensAutomatico ?? true
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Financeiro"
        description="G20/C02 — parâmetros por empresa (seletor da barra); provisionamento e documento obrigatório."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const antes = { ...cfg };
              updateConfig({
                mesesProvisionamento: meses,
                numeroDocObrigatorioLancamento: docLan,
                numeroDocObrigatorioPagamento: docPag,
                abrirEtapasItensAutomatico: abrirEtapas,
              });
              void recordAudit({
                userId: currentUser?.id,
                usuarioNome: currentUser?.nome ?? "Sistema",
                rotina: "Configurações > Financeiro",
                acao: "alterar",
                registroTipo: "financeiro_config",
                antes,
                depois: {
                  mesesProvisionamento: meses,
                  numeroDocObrigatorioLancamento: docLan,
                  numeroDocObrigatorioPagamento: docPag,
                  abrirEtapasItensAutomatico: abrirEtapas,
                },
              });
              notify("Parâmetros salvos", "Financeiro");
            }}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Meses de provisionamento">
          <Input
            type="number"
            min={0}
            max={36}
            value={meses}
            onChange={(e) => setMeses(Number(e.target.value) || 0)}
          />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Número do documento obrigatório no lançamento</span>
          <Switch checked={docLan} onCheckedChange={setDocLan} />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Número do documento obrigatório no pagamento</span>
          <Switch checked={docPag} onCheckedChange={setDocPag} />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Abrir etapas e itens ao selecionar a obra</span>
          <Switch checked={abrirEtapas} onCheckedChange={setAbrirEtapas} />
        </label>
      </div>
    </div>
  );
}
