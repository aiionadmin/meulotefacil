"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";

export default function ParametrosReajustePage() {
  const [form, setForm] = useState({
    tipoPadrao: 'IGPM',
    baseAnual: 1,
    gerarResiduo: true,
    permitirDesfazer: true,
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Reajuste"
        description="Tipos, base anual, resíduo e desfazer."
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
          <Input
            value={form.tipoPadrao}
            onChange={(e) => setForm({ ...form, tipoPadrao: e.target.value })}
          />
        </Field>
        <Field label="Base anual (mês)">
          <Input
            type="number"
            value={form.baseAnual}
            onChange={(e) =>
              setForm({ ...form, baseAnual: Number(e.target.value) })
            }
          />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Gerar resíduo</span>
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
