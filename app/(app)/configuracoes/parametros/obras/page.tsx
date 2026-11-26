"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, fieldControlClass, notify } from "@/components/app/ModuleToolkit";
import { useObras } from "@/lib/store/obras-store";

export default function ParametrosObrasPage() {
  const { state, updateObrasConfig } = useObras();
  const [form, setForm] = useState({
    expedienteHoras: state.expedienteHoras ?? 8,
    bdiModo: (state.bdiModo ?? "dinamico") as "dinamico" | "fixo",
    arredondamento: state.arredondamento ?? 2,
    modeloProposta: "Padrão MLF",
  });

  useEffect(() => {
    setForm((f) => ({
      ...f,
      expedienteHoras: state.expedienteHoras ?? 8,
      bdiModo: (state.bdiModo ?? "dinamico") as "dinamico" | "fixo",
      arredondamento: state.arredondamento ?? 2,
    }));
  }, [state.expedienteHoras, state.bdiModo, state.arredondamento]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Obras"
        description="D11 — expediente, BDI, arredondamento e modelo de proposta."
        actions={
          <Button
            size="sm"
            onClick={() => {
              updateObrasConfig({
                expedienteHoras: form.expedienteHoras,
                bdiModo: form.bdiModo,
                arredondamento: form.arredondamento,
              });
              notify(
                "Parâmetros salvos",
                `Expediente ${form.expedienteHoras}h · BDI ${form.bdiModo}`
              );
            }}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Expediente (horas/dia)">
          <Input
            type="number"
            min={1}
            max={24}
            value={form.expedienteHoras}
            onChange={(e) =>
              setForm({
                ...form,
                expedienteHoras: Number(e.target.value) || 8,
              })
            }
          />
        </Field>
        <Field label="Modo BDI">
          <select
            className={fieldControlClass}
            value={form.bdiModo}
            onChange={(e) =>
              setForm({
                ...form,
                bdiModo: e.target.value as "dinamico" | "fixo",
              })
            }
          >
            <option value="dinamico">Dinâmico</option>
            <option value="fixo">Fixo</option>
          </select>
        </Field>
        <Field label="Casas decimais (arredondamento)">
          <Input
            type="number"
            min={0}
            max={6}
            value={form.arredondamento}
            onChange={(e) =>
              setForm({
                ...form,
                arredondamento: Number(e.target.value) || 0,
              })
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
