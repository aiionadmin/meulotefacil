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
import { useFase1 } from "@/lib/store/fase1-store";
import { peopleOptions } from "@/lib/ui/people-options";
import Link from "next/link";

type MedicaoContratoStatus = "em_elaboracao" | "aprovada" | "lancada";

type MedicaoContrato = {
  id: string;
  numero: number;
  periodo: string;
  fornecedor: string;
  obraId: string;
  obraNome: string;
  objeto: string;
  valorContrato: number;
  valorMedido: number;
  retencaoPct: number;
  status: MedicaoContratoStatus;
};

const STATUS_OPTS: { value: MedicaoContratoStatus; label: string }[] = [
  { value: "em_elaboracao", label: "Em elaboração" },
  { value: "aprovada", label: "Aprovada" },
  { value: "lancada", label: "Lançada" },
];

const SEED: MedicaoContrato[] = [
  {
    id: "mc-1",
    numero: 1,
    periodo: "2026-11",
    fornecedor: "Terraplenagem Campinas Ltda",
    obraId: "obra-1",
    obraNome: "Residencial Horizonte",
    objeto: "Terraplenagem e drenagem",
    valorContrato: 420000,
    valorMedido: 84000,
    retencaoPct: 5,
    status: "aprovada",
  },
];

export default function MedicaoContratosPage() {
  const { state } = useObras();
  const { state: fase1 } = useFase1();
  const [rows, setRows] = useState(SEED);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    obraId: state.obras[0]?.id ?? "",
    periodo: new Date().toISOString().slice(0, 7),
    fornecedor: "",
    objeto: "",
    valorContrato: 0,
    valorMedido: 0,
    retencaoPct: 5,
  });

  const obraOpts = useMemo(
    () =>
      state.obras.map((o) => ({
        value: o.id,
        label: `${o.codigo} · ${o.nome}`,
      })),
    [state.obras]
  );
  const fornecedorOpts = useMemo(
    () => peopleOptions(fase1.people, "fornecedor"),
    [fase1.people]
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Medição de Contratos"
        description="Medição de empreiteiros e fornecedores — retenção e geração de lançamento a pagar (a validar com o cliente)."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Nova medição
          </Button>
        }
      />
      <ProcessList
        storageKey="medicoes-contratos"
        exportName="medicoes-contratos"
        rows={rows}
        empty="Nenhuma medição de contratos."
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
            key: "fornecedor",
            label: "Fornecedor",
            filter: { type: "text" },
            getValue: (r) => r.fornecedor,
          },
          {
            key: "obra",
            label: "Obra",
            filter: { type: "text" },
            getValue: (r) => r.obraNome,
          },
          {
            key: "objeto",
            label: "Objeto",
            filter: { type: "text" },
            getValue: (r) => r.objeto,
          },
          {
            key: "contrato",
            label: "Valor contrato",
            filter: { type: "range" },
            getValue: (r) => r.valorContrato,
            render: (r) => formatBRL(r.valorContrato),
          },
          {
            key: "medido",
            label: "Valor medido",
            filter: { type: "range" },
            getValue: (r) => r.valorMedido,
            render: (r) => formatBRL(r.valorMedido),
          },
          {
            key: "ret",
            label: "Retenção %",
            filter: { type: "range" },
            getValue: (r) => r.retencaoPct,
            render: (r) => `${r.retencaoPct}%`,
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
                  r.status === "lancada"
                    ? "ok"
                    : r.status === "aprovada"
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
        title="Nova medição de contrato"
        onSubmit={() => {
          const obra =
            state.obras.find((o) => o.id === form.obraId) ?? state.obras[0];
          if (!obra || !form.fornecedor || form.valorMedido <= 0) {
            notify("Fornecedor, obra e valor medido são obrigatórios");
            return;
          }
          const numero = Math.max(0, ...rows.map((r) => r.numero)) + 1;
          setRows((prev) => [
            {
              id: `mc-${Date.now()}`,
              numero,
              periodo: form.periodo,
              fornecedor: form.fornecedor,
              obraId: obra.id,
              obraNome: obra.nome,
              objeto: form.objeto || "Contrato de serviço",
              valorContrato: form.valorContrato,
              valorMedido: form.valorMedido,
              retencaoPct: form.retencaoPct,
              status: "em_elaboracao",
            },
            ...prev,
          ]);
          notify("Medição de contrato criada", `Nº ${numero}`);
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
        <Field label="Fornecedor *">
          <SearchSelect
            value={form.fornecedor}
            onChange={(fornecedor) => setForm((f) => ({ ...f, fornecedor }))}
            options={fornecedorOpts}
            placeholder="Selecionar fornecedor cadastrado…"
          />
          {fornecedorOpts.length === 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Nenhum fornecedor.{" "}
              <Link className="underline" href="/cadastros/fornecedores">
                Cadastrar
              </Link>
            </p>
          ) : null}
        </Field>
        <Field label="Objeto">
          <input
            className={fieldControlClass}
            value={form.objeto}
            onChange={(e) =>
              setForm((f) => ({ ...f, objeto: e.target.value }))
            }
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
        <Field label="Valor do contrato">
          <input
            type="number"
            className={fieldControlClass}
            value={form.valorContrato || ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                valorContrato: Number(e.target.value) || 0,
              }))
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
        <Field label="Retenção %">
          <input
            type="number"
            className={fieldControlClass}
            value={form.retencaoPct || ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                retencaoPct: Number(e.target.value) || 0,
              }))
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
