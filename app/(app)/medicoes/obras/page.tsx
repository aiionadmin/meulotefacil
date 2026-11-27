"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { SearchSelect } from "@/components/app/SearchSelect";
import { formatBRL } from "@/lib/masks/br";
import { useObras } from "@/lib/store/obras-store";

type MedicaoStatus = "em_elaboracao" | "enviada" | "aprovada" | "faturada";

type MedicaoObra = {
  id: string;
  numero: number;
  periodo: string;
  obraId: string;
  obraNome: string;
  clienteNome: string;
  valorMedido: number;
  pctAcumulado: number;
  status: MedicaoStatus;
};

const STATUS_OPTS: { value: MedicaoStatus; label: string }[] = [
  { value: "em_elaboracao", label: "Em elaboração" },
  { value: "enviada", label: "Enviada" },
  { value: "aprovada", label: "Aprovada" },
  { value: "faturada", label: "Faturada" },
];

const SEED: MedicaoObra[] = [
  {
    id: "mo-1",
    numero: 1,
    periodo: "2026-10",
    obraId: "obra-1",
    obraNome: "Residencial Horizonte",
    clienteNome: "Construtora Horizonte",
    valorMedido: 185000,
    pctAcumulado: 32,
    status: "aprovada",
  },
  {
    id: "mo-2",
    numero: 2,
    periodo: "2026-11",
    obraId: "obra-1",
    obraNome: "Residencial Horizonte",
    clienteNome: "Construtora Horizonte",
    valorMedido: 92000,
    pctAcumulado: 48,
    status: "em_elaboracao",
  },
];

export default function MedicaoObrasPage() {
  const { state } = useObras();
  const [rows, setRows] = useState(SEED);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    obraId: state.obras[0]?.id ?? "",
    periodo: new Date().toISOString().slice(0, 7),
    valorMedido: 0,
    pctAcumulado: 0,
  });

  const obraOpts = useMemo(
    () =>
      state.obras.map((o) => ({
        value: o.id,
        label: `${o.codigo} · ${o.nome}`,
      })),
    [state.obras]
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Medição de Obras"
        description="Medição para o cliente — boletim por período, com % acumulado e faturamento (a validar com o cliente)."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Nova medição
          </Button>
        }
      />
      <ProcessList
        storageKey="medicoes-obras"
        exportName="medicoes-obras"
        rows={rows}
        empty="Nenhuma medição de obras."
        columns={[
          {
            key: "numero",
            label: "Número",
            filter: { type: "range" },
            getValue: (r) => r.numero,
          },
          {
            key: "periodo",
            label: "Período",
            filter: { type: "text" },
            getValue: (r) => r.periodo,
          },
          {
            key: "obra",
            label: "Obra",
            filter: { type: "text" },
            getValue: (r) => r.obraNome,
          },
          {
            key: "cliente",
            label: "Cliente",
            filter: { type: "text" },
            getValue: (r) => r.clienteNome,
          },
          {
            key: "valor",
            label: "Valor medido",
            filter: { type: "range" },
            getValue: (r) => r.valorMedido,
            render: (r) => formatBRL(r.valorMedido),
          },
          {
            key: "pct",
            label: "% acumulado",
            filter: { type: "range" },
            getValue: (r) => r.pctAcumulado,
            render: (r) => `${r.pctAcumulado}%`,
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: STATUS_OPTS.map((s) => ({
                value: s.value,
                label: s.label,
              })),
            },
            getValue: (r) => r.status,
            render: (r) => (
              <StatusPill
                tone={
                  r.status === "aprovada" || r.status === "faturada"
                    ? "ok"
                    : r.status === "enviada"
                      ? "warn"
                      : "neutral"
                }
              >
                {STATUS_OPTS.find((s) => s.value === r.status)?.label ??
                  r.status}
              </StatusPill>
            ),
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova medição de obra"
        onSubmit={() => {
          const obra =
            state.obras.find((o) => o.id === form.obraId) ?? state.obras[0];
          if (!obra || form.valorMedido <= 0) {
            notify("Obra e valor medido são obrigatórios");
            return;
          }
          const numero =
            Math.max(0, ...rows.map((r) => r.numero)) + 1;
          setRows((prev) => [
            {
              id: `mo-${Date.now()}`,
              numero,
              periodo: form.periodo,
              obraId: obra.id,
              obraNome: obra.nome,
              clienteNome: obra.clienteNome,
              valorMedido: form.valorMedido,
              pctAcumulado: form.pctAcumulado,
              status: "em_elaboracao",
            },
            ...prev,
          ]);
          notify("Medição criada", `Nº ${numero}`);
          setOpen(false);
        }}
      >
        <Field label="Obra *">
          <SearchSelect
            value={form.obraId}
            onChange={(obraId) => setForm((f) => ({ ...f, obraId }))}
            options={obraOpts}
            placeholder="Buscar obra…"
          />
        </Field>
        <Field label="Período *">
          <input
            type="month"
            className={fieldControlClass}
            value={form.periodo}
            onChange={(e) =>
              setForm((f) => ({ ...f, periodo: e.target.value }))
            }
          />
        </Field>
        <Field label="Valor medido *">
          <input
            type="number"
            className={fieldControlClass}
            value={form.valorMedido || ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                valorMedido: Number(e.target.value) || 0,
              }))
            }
          />
        </Field>
        <Field label="% acumulado">
          <input
            type="number"
            className={fieldControlClass}
            value={form.pctAcumulado || ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                pctAcumulado: Number(e.target.value) || 0,
              }))
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
