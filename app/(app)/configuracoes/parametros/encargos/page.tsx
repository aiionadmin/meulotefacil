"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";
import { useSystemSettings } from "@/lib/store/system-settings-store";
import type { EncargosParams } from "@/lib/domain/system-settings-types";

export default function ParametrosEncargosPage() {
  const { state, updateEncargos } = useSystemSettings();
  const [form, setForm] = useState<EncargosParams>(state.encargos);

  useEffect(() => {
    setForm(state.encargos);
  }, [state.encargos]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Encargos"
        description="Mora, multa e regras de cobrança (spec §10.8)."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const err = updateEncargos(form);
              if (err) {
                notify(err);
                return;
              }
              notify("Parâmetros salvos", "Encargos");
            }}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Dias de tolerância de mora">
          <Input
            type="number"
            min={0}
            value={form.diasToleranciaMora}
            onChange={(e) =>
              setForm({
                ...form,
                diasToleranciaMora: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
        <Field label="Taxa de mora ao mês (ex.: 0,01 = 1%)">
          <Input
            type="number"
            step="0.001"
            min={0}
            max={1}
            value={form.taxaMoraMes}
            onChange={(e) =>
              setForm({ ...form, taxaMoraMes: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Dia de início da multa">
          <Input
            type="number"
            min={0}
            value={form.diaInicioMulta}
            onChange={(e) =>
              setForm({
                ...form,
                diaInicioMulta: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
        <Field label="Taxa de multa (ex.: 0,02 = 2%)">
          <Input
            type="number"
            step="0.001"
            min={0}
            max={1}
            value={form.taxaMulta}
            onChange={(e) =>
              setForm({ ...form, taxaMulta: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Multa diferenciada após N dias</span>
          <Switch
            checked={form.multaDiferenciada}
            onCheckedChange={(v) => setForm({ ...form, multaDiferenciada: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Multa acumulativa</span>
          <Switch
            checked={form.multaAcumulativa}
            onCheckedChange={(v) => setForm({ ...form, multaAcumulativa: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Encargos por empreendimento</span>
          <Switch
            checked={form.encargosPorEmpreendimento}
            onCheckedChange={(v) =>
              setForm({ ...form, encargosPorEmpreendimento: v })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Calcular multa/juros sobre despesa bancária</span>
          <Switch
            checked={form.calcularSobreDespesaBancaria}
            onCheckedChange={(v) =>
              setForm({ ...form, calcularSobreDespesaBancaria: v })
            }
          />
        </label>
      </div>
    </div>
  );
}
