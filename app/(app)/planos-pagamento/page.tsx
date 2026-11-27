"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleHeader, StatusPill } from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { useCarteira } from "@/lib/store/carteira-store";
import { useNovoParam } from "@/lib/ui/use-novo-param";

export default function PlanosPagamentoPage() {
  const { state, addPaymentPlan } = useCarteira();
  const [open, setOpen] = useNovoParam();
  const [form, setForm] = useState({
    nome: "",
    developmentId: "",
    entradas: 1,
    prestacoes: 48,
    moedaRef: "BRL",
    series: "mensal",
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Planos de pagamento"
        description="Cadastro e consulta de planos — lista filtrável (C14/C16)."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Novo plano
          </Button>
        }
      />
      <ProcessList
        storageKey="planos-pagamento"
        exportName="planos-pagamento"
        rows={state.paymentPlans}
        empty="Nenhum plano cadastrado."
        columns={[
          {
            key: "nome",
            label: "Nome",
            filter: { type: "text" },
            getValue: (p) => p.nome,
          },
          {
            key: "entradas",
            label: "Entradas",
            filter: { type: "range" },
            getValue: (p) => p.entradas,
          },
          {
            key: "prestacoes",
            label: "Prestações",
            filter: { type: "range" },
            getValue: (p) => p.prestacoes,
          },
          {
            key: "moeda",
            label: "Moeda",
            filter: { type: "text" },
            getValue: (p) => `${p.moedaRef} / resíduo ${p.moedaResiduo}`,
          },
          {
            key: "series",
            label: "Séries",
            filter: { type: "text" },
            getValue: (p) => p.series,
          },
          {
            key: "ativo",
            label: "Ativo",
            filter: {
              type: "status",
              options: [
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ],
            },
            getValue: (p) => (p.ativo ? "sim" : "nao"),
            render: (p) => (
              <StatusPill tone={p.ativo ? "ok" : "neutral"}>
                {p.ativo ? "Sim" : "Não"}
              </StatusPill>
            ),
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo plano de pagamento"
        onSubmit={() => {
          const plan = addPaymentPlan({
            nome: form.nome,
            developmentId: form.developmentId || undefined,
            entradas: form.entradas,
            prestacoes: form.prestacoes,
            moedaRef: form.moedaRef,
            series: form.series,
          });
          if (!plan) {
            notify("Informe o nome do plano");
            return;
          }
          notify("Plano cadastrado", plan.nome);
          setForm({
            nome: "",
            developmentId: "",
            entradas: 1,
            prestacoes: 48,
            moedaRef: "BRL",
            series: "mensal",
          });
          setOpen(false);
        }}
      >
        <Field label="Nome">
          <Input
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            placeholder="Ex.: Entrada + 48x"
          />
        </Field>
        <Field label="Empreendimento (opcional)">
          <select
            className={fieldControlClass}
            value={form.developmentId}
            onChange={(e) =>
              setForm((f) => ({ ...f, developmentId: e.target.value }))
            }
          >
            <option value="">Todos / geral</option>
            {state.developments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Entradas">
            <Input
              type="number"
              min={0}
              value={form.entradas}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  entradas: Number(e.target.value) || 0,
                }))
              }
            />
          </Field>
          <Field label="Prestações">
            <Input
              type="number"
              min={1}
              value={form.prestacoes}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  prestacoes: Number(e.target.value) || 1,
                }))
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Moeda">
            <Input
              value={form.moedaRef}
              onChange={(e) =>
                setForm((f) => ({ ...f, moedaRef: e.target.value }))
              }
            />
          </Field>
          <Field label="Série">
            <Input
              value={form.series}
              onChange={(e) =>
                setForm((f) => ({ ...f, series: e.target.value }))
              }
            />
          </Field>
        </div>
      </FormDialog>
    </div>
  );
}
