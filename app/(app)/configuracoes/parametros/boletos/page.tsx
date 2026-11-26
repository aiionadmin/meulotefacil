"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";

export default function ParametrosBoletosPage() {
  const [form, setForm] = useState({
    mensagemPadrao: 'Pagável em qualquer banco até o vencimento.',
    nossoNumeroSeq: 10001,
    travaEmissaoAtraso: false,
    despesaBancaria: 2.5,
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Boletos"
        description="Mensagens, nosso número e travas de emissão."
        actions={
          <Button
            size="sm"
            onClick={() => notify("Parâmetros salvos", "Boletos")}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Mensagem do boleto">
          <Input
            value={form.mensagemPadrao}
            onChange={(e) => setForm({ ...form, mensagemPadrao: e.target.value })}
          />
        </Field>
        <Field label="Próximo nosso número">
          <Input
            type="number"
            value={form.nossoNumeroSeq}
            onChange={(e) =>
              setForm({ ...form, nossoNumeroSeq: Number(e.target.value) })
            }
          />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Travar emissão com atraso</span>
          <Switch
            checked={form.travaEmissaoAtraso}
            onCheckedChange={(v) => setForm({ ...form, travaEmissaoAtraso: v })}
          />
        </label>
        <Field label="Despesa bancária padrão">
          <Input
            type="number"
            value={form.despesaBancaria}
            onChange={(e) =>
              setForm({ ...form, despesaBancaria: Number(e.target.value) })
            }
          />
        </Field>
      </div>
    </div>
  );
}
