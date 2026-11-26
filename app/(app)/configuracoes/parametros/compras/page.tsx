"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";
import { useCompras } from "@/lib/store/compras-store";

export default function ParametrosComprasPage() {
  const { state } = useCompras();
  const cfg = state.config;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Compras"
        description="Numeração inicial de cotação/OC e permissão de ordem sem cotação."
        actions={
          <Button
            size="sm"
            onClick={() => notify("Parâmetros salvos", "Compras")}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Número inicial de cotação">
          <Input type="number" defaultValue={cfg.cotacaoNumeroInicial} />
        </Field>
        <Field label="Número inicial de ordem">
          <Input type="number" defaultValue={cfg.ocNumeroInicial} />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Permitir ordem sem cotação</span>
          <Switch checked={cfg.permitirOcSemCotacao} disabled />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Documento do fornecedor obrigatório</span>
          <Switch checked={cfg.fornecedorDocumentoObrigatorio} disabled />
        </label>
      </div>
    </div>
  );
}
