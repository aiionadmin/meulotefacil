"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";

export default function ParametrosObrasPage() {
  const [form, setForm] = useState({
    expedienteHoras: 8,
    bdiPadraoPct: 25,
    casasDecimais: 2,
    modeloProposta: "Padrão MLF",
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Obras"
        description="Expediente, BDI padrão, arredondamento e modelo de proposta."
        actions={
          <Button
            size="sm"
            onClick={() => notify("Parâmetros salvos", "Obras")}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Expediente (horas/dia)">
          <Input
            type="number"
            value={form.expedienteHoras}
            onChange={(e) =>
              setForm({ ...form, expedienteHoras: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="BDI padrão (%)">
          <Input
            type="number"
            value={form.bdiPadraoPct}
            onChange={(e) =>
              setForm({ ...form, bdiPadraoPct: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Casas decimais (arredondamento)">
          <Input
            type="number"
            value={form.casasDecimais}
            onChange={(e) =>
              setForm({ ...form, casasDecimais: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Modelo de proposta">
          <Input
            value={form.modeloProposta}
            onChange={(e) =>
              setForm({ ...form, modeloProposta: e.target.value })
            }
          />
        </Field>
      </div>
    </div>
  );
}
