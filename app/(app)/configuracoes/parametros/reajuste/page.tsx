"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";

export default function ParametrosReajustePage() {
  const [form, setForm] = useState({
    tipoPadrao: "IGPM",
    baseAnual: 1,
    gerarResiduo: true,
    permitirDesfazer: true,
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Reajuste"
        description="Tipo padrão, mês-base anual, resíduo e desfazer (H18)."
        actions={
          <Button
            size="sm"
            onClick={() => notify("Parâmetros salvos", "Reajuste")}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Tipo padrão">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={form.tipoPadrao}
            onChange={(e) => setForm({ ...form, tipoPadrao: e.target.value })}
          >
            <option value="IGPM">IGPM</option>
            <option value="IPCA">IPCA</option>
            <option value="INCC">INCC</option>
          </select>
        </Field>
        <Field label="Base anual (mês 1–12)">
          <Input
            type="number"
            min={1}
            max={12}
            value={form.baseAnual}
            onChange={(e) =>
              setForm({
                ...form,
                baseAnual: Math.min(
                  12,
                  Math.max(1, Number(e.target.value) || 1)
                ),
              })
            }
          />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Gerar resíduo no reajuste</span>
          <Switch
            checked={form.gerarResiduo}
            onCheckedChange={(v) => setForm({ ...form, gerarResiduo: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Permitir desfazer reajuste</span>
          <Switch
            checked={form.permitirDesfazer}
            onCheckedChange={(v) => setForm({ ...form, permitirDesfazer: v })}
          />
        </label>
      </div>
    </div>
  );
}
