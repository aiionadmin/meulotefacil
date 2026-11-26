"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { SearchSelect } from "@/components/app/SearchSelect";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useEmpresa } from "@/lib/empresa/context";
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
  const { filterByEmpresa, filterByDevelopmentEmpresa } = useEmpresa();
  const developments = useMemo(
    () => filterByEmpresa(state.developments),
    [filterByEmpresa, state.developments]
  );
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

  const filtrados = useMemo(
    () => filterByDevelopmentEmpresa(itens, state.developments),
    [filterByDevelopmentEmpresa, itens, state.developments]
  );

  const total = useMemo(
    () => filtrados.reduce((a, i) => a + i.valor, 0),
    [filtrados]
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Despesas do empreendimento"
        description="H24 — custos rateados; filtro por empresa (C01) e lista (C14/C15)."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadCsv(
                  "despesas-empreendimento.csv",
                  ["data", "empreendimento", "categoria", "descricao", "valor"],
                  filtrados.map((i) => [
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
          { label: "Despesas", value: filtrados.length },
          { label: "Total", value: formatBRL(total) },
        ]}
      />
      <ProcessList
        storageKey="despesas-empreendimento"
        exportName="despesas-empreendimento"
        rows={filtrados}
        empty="Sem despesas."
        columns={[
          {
            key: "data",
            label: "Data",
            filter: { type: "period" },
            getValue: (i) => i.data,
            render: (i) => formatDateBR(i.data),
          },
          {
            key: "emp",
            label: "Empreendimento",
            filter: { type: "text" },
            getValue: (i) => i.empNome,
          },
          {
            key: "cat",
            label: "Categoria",
            filter: { type: "text" },
            getValue: (i) => i.categoria,
          },
          {
            key: "desc",
            label: "Descrição",
            filter: { type: "text" },
            getValue: (i) => i.descricao,
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (i) => i.valor,
            render: (i) => formatBRL(i.valor),
          },
        ]}
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
          const emp = developments.find((d) => d.id === form.developmentId);
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
          <SearchSelect
            value={form.developmentId}
            onChange={(developmentId) => setForm({ ...form, developmentId })}
            placeholder="Buscar empreendimento…"
            options={developments.map((d) => ({
              value: d.id,
              label: d.nome,
            }))}
          />
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
