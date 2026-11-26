"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";

export default function ParametrosCaixaPage() {
  const [form, setForm] = useState({
    reciboVias: 1,
    autenticacao: true,
    estornoSoAdmin: true,
    naoReceberComAtraso: true,
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Caixa"
        description="Recibo, autenticação e regras de recebimento."
        actions={
          <Button
            size="sm"
            onClick={() => notify("Parâmetros salvos", "Caixa")}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Vias do recibo (1 ou 2)">
          <Input
            type="number"
            value={form.reciboVias}
            onChange={(e) =>
              setForm({ ...form, reciboVias: Number(e.target.value) })
            }
          />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Exigir autenticação</span>
          <Switch
            checked={form.autenticacao}
            onCheckedChange={(v) => setForm({ ...form, autenticacao: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Estorno só administrador</span>
          <Switch
            checked={form.estornoSoAdmin}
            onCheckedChange={(v) => setForm({ ...form, estornoSoAdmin: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Não receber atuais com atrasadas</span>
          <Switch
            checked={form.naoReceberComAtraso}
            onCheckedChange={(v) => setForm({ ...form, naoReceberComAtraso: v })}
          />
        </label>
      </div>
    </div>
  );
}
