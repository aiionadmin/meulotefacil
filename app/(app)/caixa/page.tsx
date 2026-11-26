"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleHeader, DataTable, KpiGrid } from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useCarteira } from "@/lib/store/carteira-store";
import { formatBRL } from "@/lib/masks/br";

export default function CaixaPage() {
  const { state } = useCarteira();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    cliente: "",
    valor: 0,
    forma: "dinheiro",
    vias: 1 as 1 | 2,
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Caixa"
        description="Recebimento com tolerância, recibo em 1 ou 2 vias e autenticação."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Receber
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Saldo do caixa", value: formatBRL(state.caixaSaldo) },
          { label: "Movimentos", value: String(state.caixa.length) },
        ]}
      />
      <DataTable
        columns={[
          { key: "data", label: "Data" },
          { key: "cliente", label: "Cliente" },
          { key: "valor", label: "Valor" },
          { key: "forma", label: "Forma" },
          { key: "auth", label: "Autenticação" },
          { key: "vias", label: "Vias" },
        ]}
        rows={state.caixa.map((m) => ({
          data: m.data,
          cliente: m.cliente,
          valor: formatBRL(m.valor),
          forma: m.forma,
          auth: m.autenticacao,
          vias: String(m.vias),
        }))}
        empty="Nenhum recebimento no caixa nesta sessão."
      />
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Recebimento no caixa"
        onSubmit={() => {
          if (!form.cliente || form.valor <= 0) {
            notify("Cliente e valor obrigatórios");
            return;
          }
          notify(
            "Recebido no caixa",
            `${form.cliente} · ${formatBRL(form.valor)} · recibo ${form.vias} via(s)`
          );
          setOpen(false);
        }}
      >
        <Field label="Cliente *">
          <Input
            value={form.cliente}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
          />
        </Field>
        <Field label="Valor *">
          <Input
            type="number"
            value={form.valor || ""}
            onChange={(e) =>
              setForm({ ...form, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Forma">
          <select
            className={fieldControlClass}
            value={form.forma}
            onChange={(e) => setForm({ ...form, forma: e.target.value })}
          >
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">Pix</option>
            <option value="boleto">Boleto</option>
          </select>
        </Field>
        <Field label="Vias do recibo">
          <select
            className={fieldControlClass}
            value={form.vias}
            onChange={(e) =>
              setForm({ ...form, vias: Number(e.target.value) as 1 | 2 })
            }
          >
            <option value={1}>1 via</option>
            <option value={2}>2 vias</option>
          </select>
        </Field>
      </FormDialog>
    </div>
  );
}
