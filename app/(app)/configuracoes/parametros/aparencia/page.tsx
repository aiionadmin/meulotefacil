"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";
import { useSystemSettings } from "@/lib/store/system-settings-store";
import type { AparenciaParams } from "@/lib/domain/system-settings-types";

export default function ParametrosAparenciaPage() {
  const { state, updateAparencia } = useSystemSettings();
  const [form, setForm] = useState<AparenciaParams>(state.aparencia);

  useEffect(() => {
    setForm(state.aparencia);
  }, [state.aparencia]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Aparência"
        description="Cores da planta, máscara do lote e pesquisa."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const err = updateAparencia(form);
              if (err) {
                notify(err);
                return;
              }
              notify("Parâmetros salvos", "Aparência");
            }}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Cor disponível">
          <Input
            value={form.corDisponivel}
            onChange={(e) =>
              setForm({ ...form, corDisponivel: e.target.value })
            }
          />
        </Field>
        <Field label="Cor reservado">
          <Input
            value={form.corReservado}
            onChange={(e) =>
              setForm({ ...form, corReservado: e.target.value })
            }
          />
        </Field>
        <Field label="Cor vendido">
          <Input
            value={form.corVendido}
            onChange={(e) => setForm({ ...form, corVendido: e.target.value })}
          />
        </Field>
        <Field label="Máscara do lote">
          <Input
            value={form.mascaraLote}
            onChange={(e) =>
              setForm({ ...form, mascaraLote: e.target.value })
            }
          />
        </Field>
        <Field label="Pesquisa padrão">
          <Input
            value={form.pesquisaPadrao}
            onChange={(e) =>
              setForm({ ...form, pesquisaPadrao: e.target.value })
            }
          />
        </Field>
      </div>
    </div>
  );
}
