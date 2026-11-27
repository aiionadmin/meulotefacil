"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";
import { useSystemSettings } from "@/lib/store/system-settings-store";
import type { BoletosParams } from "@/lib/domain/system-settings-types";

export default function ParametrosBoletosPage() {
  const { state, updateBoletos } = useSystemSettings();
  const [form, setForm] = useState<BoletosParams>(state.boletos);

  useEffect(() => {
    setForm(state.boletos);
  }, [state.boletos]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Boletos"
        description="Mensagens, nosso número e travas de emissão."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const err = updateBoletos(form);
              if (err) {
                notify(err);
                return;
              }
              notify("Parâmetros salvos", "Boletos");
            }}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Mensagem do boleto">
          <Input
            value={form.mensagemPadrao}
            onChange={(e) =>
              setForm({ ...form, mensagemPadrao: e.target.value })
            }
          />
        </Field>
        <Field label="Próximo nosso número">
          <Input
            type="number"
            value={form.nossoNumeroSeq}
            onChange={(e) =>
              setForm({
                ...form,
                nossoNumeroSeq: Number(e.target.value) || 1,
              })
            }
          />
        </Field>
        <Field label="Despesa bancária padrão (R$)">
          <Input
            type="number"
            step="0.01"
            value={form.despesaBancaria}
            onChange={(e) =>
              setForm({
                ...form,
                despesaBancaria: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Travar emissão com atraso</span>
          <Switch
            checked={form.travaEmissaoAtraso}
            onCheckedChange={(v) =>
              setForm({ ...form, travaEmissaoAtraso: v })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Bloquear parcela com boleto gerado</span>
          <Switch
            checked={form.bloquearParcelaComBoleto}
            onCheckedChange={(v) =>
              setForm({ ...form, bloquearParcelaComBoleto: v })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Atualizar boleto vencido</span>
          <Switch
            checked={form.atualizarBoletoVencido}
            onCheckedChange={(v) =>
              setForm({ ...form, atualizarBoletoVencido: v })
            }
          />
        </label>
      </div>
    </div>
  );
}
