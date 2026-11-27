"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, fieldControlClass, notify } from "@/components/app/ModuleToolkit";
import { useSystemSettings } from "@/lib/store/system-settings-store";
import type { VendasParams } from "@/lib/domain/system-settings-types";

export default function ParametrosVendasPage() {
  const { state, updateVendas } = useSystemSettings();
  const [form, setForm] = useState<VendasParams>(state.vendas);

  useEffect(() => {
    setForm(state.vendas);
  }, [state.vendas]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Vendas"
        description="Validade da reserva, plano, campos liberados e comissão."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const err = updateVendas(form);
              if (err) {
                notify(err);
                return;
              }
              notify(
                "Parâmetros salvos",
                `Reserva ${form.validadeReservaDias} dia(s)`
              );
            }}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Tempo que o lote pode ficar reservado (dias)">
          <Input
            type="number"
            min={1}
            max={365}
            value={form.validadeReservaDias}
            onChange={(e) =>
              setForm({
                ...form,
                validadeReservaDias: Number(e.target.value) || 1,
              })
            }
          />
        </Field>
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
            checked={form.gerarParcelasNaVenda}
            onCheckedChange={(v) =>
              setForm({ ...form, gerarParcelasNaVenda: v })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Veículo de comunicação obrigatório</span>
          <Switch
            checked={form.veiculoComunicacaoObrigatorio}
            onCheckedChange={(v) =>
              setForm({ ...form, veiculoComunicacaoObrigatorio: v })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Data de reajuste obrigatória</span>
          <Switch
            checked={form.dataReajusteObrigatoria}
            onCheckedChange={(v) =>
              setForm({ ...form, dataReajusteObrigatoria: v })
            }
          />
        </label>
        <Field label="Comissão padrão (%)">
          <Input
            type="number"
            step="0.01"
            value={form.comissaoPadraoPct}
            onChange={(e) =>
              setForm({
                ...form,
                comissaoPadraoPct: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
        <Field label="Comissão sobre">
          <select
            className={fieldControlClass}
            value={form.comissaoSobre}
            onChange={(e) =>
              setForm({
                ...form,
                comissaoSobre: e.target.value as VendasParams["comissaoSobre"],
              })
            }
          >
            <option value="preco_lote">Preço do lote</option>
            <option value="entrada_intermediarias">
              Entrada e intermediárias
            </option>
          </select>
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Validar valor da comissão</span>
          <Switch
            checked={form.validarComissao}
            onCheckedChange={(v) => setForm({ ...form, validarComissao: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Transferência cobra taxa</span>
          <Switch
            checked={form.transferenciaCobraTaxa}
            onCheckedChange={(v) =>
              setForm({ ...form, transferenciaCobraTaxa: v })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Impedir transferência com débito</span>
          <Switch
            checked={form.impedirTransferenciaComDebito}
            onCheckedChange={(v) =>
              setForm({ ...form, impedirTransferenciaComDebito: v })
            }
          />
        </label>
        <Field label="Máscara do código do lote">
          <Input
            value={form.mascaraLote}
            onChange={(e) =>
              setForm({ ...form, mascaraLote: e.target.value })
            }
          />
        </Field>
        <Field label="Pesquisa padrão">
          <select
            className={fieldControlClass}
            value={form.pesquisaPadrao}
            onChange={(e) =>
              setForm({
                ...form,
                pesquisaPadrao: e.target
                  .value as VendasParams["pesquisaPadrao"],
              })
            }
          >
            <option value="comprador">Comprador</option>
            <option value="lote">Lote</option>
            <option value="segundo_comprador">Segundo comprador</option>
            <option value="proposta">Proposta</option>
          </select>
        </Field>
        <p className="pt-2 text-sm font-medium">Campos liberados na venda</p>
        {(
          [
            ["dataLancamento", "Data de lançamento"],
            ["area", "Área"],
            ["confrontacoes", "Confrontações"],
            ["juros", "Juros"],
            ["preco", "Preço"],
            ["valorM2", "Valor do m²"],
            ["valorTotal", "Valor total"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span>{label}</span>
            <Switch
              checked={form.camposLiberados[key]}
              onCheckedChange={(v) =>
                setForm({
                  ...form,
                  camposLiberados: { ...form.camposLiberados, [key]: v },
                })
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
}
