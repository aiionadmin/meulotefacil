"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  DataTable,
  KpiGrid,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import { downloadCsv } from "@/lib/export/list-export";

type DespesaEmp = {
  id: string;
  developmentId: string;
  empNome: string;
  data: string;
  descricao: string;
  valor: number;
  categoria: string;
};

export default function DespesasEmpreendimentoPage() {
  const { state } = useCarteira();
  const [itens, setItens] = useState<DespesaEmp[]>([
    {
      id: "de-1",
      developmentId: state.developments[0]?.id ?? "",
      empNome: state.developments[0]?.nome ?? "—",
      data: "2026-10-12",
      descricao: "Taxa de limpeza de vias",
      valor: 1850,
      categoria: "Manutenção",
    },
  ]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    developmentId: state.developments[0]?.id ?? "",
    descricao: "",
    valor: 0,
    categoria: "Manutenção",
    data: new Date().toISOString().slice(0, 10),
  });

  const total = useMemo(
    () => itens.reduce((a, i) => a + i.valor, 0),
    [itens]
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Despesas do empreendimento"
        description="Custos rateados por empreendimento (H24)."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadCsv(
                  "despesas-empreendimento.csv",
                  ["data", "empreendimento", "categoria", "descricao", "valor"],
                  itens.map((i) => [
                    i.data,
                    i.empNome,
                    i.categoria,
                    i.descricao,
                    i.valor,
                  ])
                );
                notify("Exportado");
              }}
            >
              Exportar
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova despesa
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Despesas", value: itens.length },
          { label: "Total", value: formatBRL(total) },
        ]}
      />
      <DataTable
        columns={[
          { key: "data", label: "Data" },
          { key: "emp", label: "Empreendimento" },
          { key: "cat", label: "Categoria" },
          { key: "desc", label: "Descrição" },
          { key: "valor", label: "Valor" },
        ]}
        rows={itens.map((i) => ({
          data: formatDateBR(i.data),
          emp: i.empNome,
          cat: i.categoria,
          desc: i.descricao,
          valor: formatBRL(i.valor),
        }))}
        empty="Sem despesas."
      />
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova despesa"
        onSubmit={() => {
          if (!form.descricao || form.valor <= 0) {
            notify("Descrição e valor obrigatórios");
            return;
          }
          const emp = state.developments.find((d) => d.id === form.developmentId);
          setItens((list) => [
            {
              id: `de-${Date.now()}`,
              developmentId: form.developmentId,
              empNome: emp?.nome ?? "—",
              data: form.data,
              descricao: form.descricao,
              valor: form.valor,
              categoria: form.categoria,
            },
            ...list,
          ]);
          notify("Despesa lançada");
          setOpen(false);
        }}
      >
        <Field label="Empreendimento">
          <select
            className={fieldControlClass}
            value={form.developmentId}
            onChange={(e) =>
              setForm({ ...form, developmentId: e.target.value })
            }
          >
            {state.developments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data">
          <Input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
          />
        </Field>
        <Field label="Categoria">
          <Input
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          />
        </Field>
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
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
      </FormDialog>
    </div>
  );
}
