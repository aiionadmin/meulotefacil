"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFluxo } from "@/lib/store/fluxo-store";

export default function VendasPage() {
  const { state, addProposal, converterProposal } = useFluxo();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    leadId: state.leads[0]?.id ?? "",
    cliente: "",
    empNome: "Residencial Horizonte",
    loteLabel: "A/02",
    valor: 185000,
    parcelas: 120,
    entrada: 20000,
    validade: new Date().toISOString().slice(0, 10),
    responsavel: "Comercial",
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.proposals;
    return state.proposals.filter((p) =>
      [p.cliente, p.empNome, p.loteLabel, p.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.proposals, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Propostas e reservas"
        description="simular plano, reservar lote e converter em venda/contrato."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/contratos">Contratos</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova proposta
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Propostas", value: state.proposals.length },
          {
            label: "Abertas",
            value: state.proposals.filter((p) => p.status === "aberta").length,
          },
          {
            label: "Reservadas",
            value: state.proposals.filter((p) => p.status === "reservada").length,
          },
          {
            label: "Convertidas",
            value: state.proposals.filter((p) => p.status === "convertida").length,
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar cliente, lote…" />

      <DataTable
        columns={[
          { key: "cliente", label: "Cliente" },
          { key: "lote", label: "Lote" },
          { key: "valor", label: "Valor" },
          { key: "validade", label: "Validade" },
          { key: "status", label: "Status" },
          { key: "acao", label: "" },
        ]}
        rows={filtered.map((p) => ({
          cliente: p.cliente,
          lote: `${p.empNome} · ${p.loteLabel}`,
          valor: formatBRL(p.valor),
          validade: formatDateBR(p.validade),
          status: <StatusPill tone="info">{p.status}</StatusPill>,
          acao:
            p.status === "aberta" || p.status === "reservada" ? (
              <Button
                size="sm"
                onClick={() => {
                  converterProposal(p.id);
                  notify("Convertida · card → Contrato");
                }}
              >
                Converter
              </Button>
            ) : (
              "—"
            ),
        }))}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova proposta"
        onSubmit={() => {
          const lead = state.leads.find((l) => l.id === form.leadId);
          addProposal({
            ...form,
            cliente: form.cliente || lead?.nome || "Cliente",
            leadId: form.leadId || undefined,
          });
          notify("Proposta criada");
          setOpen(false);
        }}
      >
        <Field label="Lead">
          <select
            className={fieldControlClass}
            value={form.leadId}
            onChange={(e) => {
              const lead = state.leads.find((l) => l.id === e.target.value);
              setForm({
                ...form,
                leadId: e.target.value,
                cliente: lead?.nome ?? form.cliente,
                empNome: lead?.empInteresse ?? form.empNome,
              });
            }}
          >
            {state.leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Lote">
          <Input
            value={form.loteLabel}
            onChange={(e) => setForm({ ...form, loteLabel: e.target.value })}
          />
        </Field>
        <Field label="Valor">
          <Input
            type="number"
            value={form.valor}
            onChange={(e) =>
              setForm({ ...form, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Entrada">
          <Input
            type="number"
            value={form.entrada}
            onChange={(e) =>
              setForm({ ...form, entrada: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Parcelas">
          <Input
            type="number"
            value={form.parcelas}
            onChange={(e) =>
              setForm({ ...form, parcelas: Number(e.target.value) || 1 })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
