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
  const params = state.receiptParams ?? {
    multaAcumulativa: false,
    naoReceberAtuaisComAtrasadas: true,
    pagamentoParcial: true,
    unirVendasNoCaixa: false,
    despesaBancariaPadrao: 2.5,
    textoRecibo: "Recebemos a importância acima em pagamento de parcela(s).",
    reciboVias: 1 as const,
    autenticacao: true,
    estornoSoAdmin: true,
  };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    cliente: "",
    valor: 0,
    forma: "dinheiro",
    vias: params.reciboVias,
    parcial: false,
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Caixa"
        description="Recebimento com tolerância, recibo e regras H21."
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
          {
            label: "Parcial",
            value: params.pagamentoParcial ? "Sim" : "Não",
          },
          {
            label: "Atuais c/ atraso",
            value: params.naoReceberAtuaisComAtrasadas ? "Bloqueado" : "Livre",
          },
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
          if (form.parcial && !params.pagamentoParcial) {
            notify("Pagamento parcial desabilitado nos parâmetros");
            return;
          }
          notify(
            "Recebido no caixa",
            `${form.cliente} · ${formatBRL(form.valor)} · ${form.vias} via(s)`
          );
          notify("Recibo", params.textoRecibo);
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
        {params.pagamentoParcial ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.parcial}
              onChange={(e) =>
                setForm({ ...form, parcial: e.target.checked })
              }
            />
            Pagamento parcial
          </label>
        ) : null}
        <p className="text-xs text-muted-foreground">{params.textoRecibo}</p>
      </FormDialog>
    </div>
  );
}
