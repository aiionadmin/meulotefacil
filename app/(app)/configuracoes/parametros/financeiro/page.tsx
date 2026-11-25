"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";
import { useFinanceiro } from "@/lib/store/financeiro-store";

export default function ParametrosFinanceiroPage() {
  const { state } = useFinanceiro();
  const cfg = state.config;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Financeiro"
        description="Meses de provisionamento, documento obrigatório e abertura de etapas."
        actions={
          <Button
            size="sm"
            onClick={() => notify("Parâmetros salvos", "Financeiro")}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Meses de provisionamento">
          <Input type="number" defaultValue={cfg.mesesProvisionamento} />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Número do documento obrigatório no lançamento</span>
          <Switch checked={cfg.numeroDocObrigatorioLancamento} disabled />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Número do documento obrigatório no pagamento</span>
          <Switch checked={cfg.numeroDocObrigatorioPagamento} disabled />
        </label>
      </div>
    </div>
  );
}
