"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";

export default function ParametrosVendasPage() {
  const [form, setForm] = useState({
    planoAutomatico: true,
    gerarParcelas: true,
    veiculoObrigatorio: false,
    comissaoPadraoPct: 3,
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Vendas"
        description="Plano automático, geração de parcelas e comissão."
        actions={
          <Button
            size="sm"
            onClick={() => notify("Parâmetros salvos", "Vendas")}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Plano automático</span>
          <Switch
            checked={form.planoAutomatico}
            onCheckedChange={(v) => setForm({ ...form, planoAutomatico: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Gerar parcelas na venda</span>
          <Switch
            checked={form.gerarParcelas}
            onCheckedChange={(v) => setForm({ ...form, gerarParcelas: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Veículo de comunicação obrigatório</span>
          <Switch
            checked={form.veiculoObrigatorio}
            onCheckedChange={(v) => setForm({ ...form, veiculoObrigatorio: v })}
          />
        </label>
        <Field label="Comissão padrão (%)">
          <Input
            type="number"
            value={form.comissaoPadraoPct}
            onChange={(e) =>
              setForm({ ...form, comissaoPadraoPct: Number(e.target.value) })
            }
          />
        </Field>
      </div>
    </div>
  );
}
