"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, fieldControlClass, notify } from "@/components/app/ModuleToolkit";
import { useSystemSettings } from "@/lib/store/system-settings-store";
import type { ReajusteParams } from "@/lib/domain/system-settings-types";

export default function ParametrosReajustePage() {
  const { state, updateReajuste, indicePadrao } = useSystemSettings();
  const [form, setForm] = useState<ReajusteParams>({
    ...state.reajuste,
    indicePadrao: state.reajuste.indicePadrao || indicePadrao,
  });

  useEffect(() => {
    setForm({
      ...state.reajuste,
      indicePadrao: state.reajuste.indicePadrao || indicePadrao,
    });
  }, [state.reajuste, indicePadrao]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Reajuste"
        description="Índice padrão, mês-base anual, resíduo e desfazer (H18)."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const err = updateReajuste(form);
              if (err) {
                notify(err);
                return;
              }
              notify("Parâmetros salvos", `Índice ${form.indicePadrao}`);
            }}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Índice padrão">
          <select
            className={fieldControlClass}
            value={form.indicePadrao}
            onChange={(e) => setForm({ ...form, indicePadrao: e.target.value })}
          >
            {state.indices
              .filter((i) => i.ativo)
              .map((i) => (
                <option key={i.codigo} value={i.codigo}>
                  {i.abreviatura} — {i.nome}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Base anual (mês 1–12)">
          <Input
            type="number"
            min={1}
            max={12}
            value={form.baseAnualMes}
            onChange={(e) =>
              setForm({
                ...form,
                baseAnualMes: Math.min(
                  12,
                  Math.max(1, Number(e.target.value) || 1)
                ),
              })
            }
          />
        </Field>
        <Field label="Acréscimo percentual sobre o índice">
          <Input
            type="number"
            step="0.01"
            value={form.acrescimoPercentual}
            onChange={(e) =>
              setForm({
                ...form,
                acrescimoPercentual: Number(e.target.value) || 0,
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
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Arredondar para valores inteiros</span>
          <Switch
            checked={form.arredondarInteiros}
            onCheckedChange={(v) => setForm({ ...form, arredondarInteiros: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Primeira parcela com correção pro-rata</span>
          <Switch
            checked={form.primeiraParcelaProRata}
            onCheckedChange={(v) =>
              setForm({ ...form, primeiraParcelaProRata: v })
            }
          />
        </label>
      </div>
    </div>
  );
}
