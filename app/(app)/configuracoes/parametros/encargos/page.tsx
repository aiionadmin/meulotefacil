"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";

export default function ParametrosEncargosPage() {
  const [form, setForm] = useState({
    diasMoraPadrao: 0,
    taxaMoraMes: 0.01,
    taxaMulta: 0.02,
    multaDiferenciada: true,
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Encargos"
        description="Mora, multa e diferenciação por empreendimento."
        actions={
          <Button
            size="sm"
            onClick={() => notify("Parâmetros salvos", "Encargos")}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Dias de mora (padrão)">
          <Input
            type="number"
            value={form.diasMoraPadrao}
            onChange={(e) =>
              setForm({ ...form, diasMoraPadrao: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Taxa de mora ao mês">
          <Input
            type="number"
            value={form.taxaMoraMes}
            onChange={(e) =>
              setForm({ ...form, taxaMoraMes: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Taxa de multa">
          <Input
            type="number"
            value={form.taxaMulta}
            onChange={(e) =>
              setForm({ ...form, taxaMulta: Number(e.target.value) })
            }
          />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Multa diferenciada por emp.</span>
          <Switch
            checked={form.multaDiferenciada}
            onCheckedChange={(v) => setForm({ ...form, multaDiferenciada: v })}
          />
        </label>
      </div>
    </div>
  );
}
