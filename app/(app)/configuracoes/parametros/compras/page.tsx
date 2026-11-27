"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";
import { useCompras } from "@/lib/store/compras-store";

export default function ParametrosComprasPage() {
  const { state, updateConfig } = useCompras();
  const [form, setForm] = useState({
    cotacaoNumeroInicial: state.config.cotacaoNumeroInicial,
    ocNumeroInicial: state.config.ocNumeroInicial,
    permitirOcSemCotacao: state.config.permitirOcSemCotacao,
    fornecedorDocumentoObrigatorio:
      state.config.fornecedorDocumentoObrigatorio,
  });

  useEffect(() => {
    setForm({
      cotacaoNumeroInicial: state.config.cotacaoNumeroInicial,
      ocNumeroInicial: state.config.ocNumeroInicial,
      permitirOcSemCotacao: state.config.permitirOcSemCotacao,
      fornecedorDocumentoObrigatorio:
        state.config.fornecedorDocumentoObrigatorio,
    });
  }, [state.config]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Compras"
        description="Numeração inicial de cotação/OC e permissão de ordem sem cotação."
        actions={
          <Button
            size="sm"
            onClick={() => {
              updateConfig(form);
              notify(
                "Parâmetros salvos",
                form.permitirOcSemCotacao
                  ? "OC sem cotação permitida"
                  : "OC exige cotação"
              );
            }}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Número inicial de cotação">
          <Input
            type="number"
            value={form.cotacaoNumeroInicial}
            onChange={(e) =>
              setForm({
                ...form,
                cotacaoNumeroInicial: Number(e.target.value) || 1,
              })
            }
          />
        </Field>
        <Field label="Número inicial de ordem">
          <Input
            type="number"
            value={form.ocNumeroInicial}
            onChange={(e) =>
              setForm({
                ...form,
                ocNumeroInicial: Number(e.target.value) || 1,
              })
            }
          />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Permitir ordem sem cotação</span>
          <Switch
            checked={form.permitirOcSemCotacao}
            onCheckedChange={(v) =>
              setForm({ ...form, permitirOcSemCotacao: v })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Documento do fornecedor obrigatório</span>
          <Switch
            checked={form.fornecedorDocumentoObrigatorio}
            onCheckedChange={(v) =>
              setForm({ ...form, fornecedorDocumentoObrigatorio: v })
            }
          />
        </label>
      </div>
    </div>
  );
}
