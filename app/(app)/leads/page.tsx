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
import { useFluxo } from "@/lib/store/fluxo-store";
import type { LeadOrigem } from "@/lib/domain/fluxo-types";
import { statusLabel } from "@/lib/status/labels";

export default function LeadsPage() {
  const { state, addLead, moveLead } = useFluxo();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    empInteresse: "Residencial Horizonte",
    origem: "whatsapp" as LeadOrigem,
  });

  const activeLeads = useMemo(
    () =>
      // B15 — lead convertido (cobrança / carteira em dia) sai da lista
      state.leads.filter(
        (l) =>
          l.etapa !== "cobranca" &&
          l.etapa !== "carteira_em_dia" &&
          l.etapa !== "perdido" &&
          l.etapa !== "retomado"
      ),
    [state.leads]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return activeLeads;
    return activeLeads.filter((l) =>
      [l.nome, l.telefone, l.origem, l.etapa, l.empInteresse]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [activeLeads, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Leads"
        description="origem, responsável e etapa na jornada."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/quadros/jornada">Abrir quadro</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Novo lead
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Leads", value: activeLeads.length },
          {
            label: "Novos",
            value: activeLeads.filter((l) => l.etapa === "novo_contato").length,
          },
          {
            label: "Em atendimento",
            value: activeLeads.filter((l) => l.etapa === "em_atendimento")
              .length,
          },
          {
            label: "Propostas",
            value: state.proposals.filter((p) => p.status !== "cancelada").length,
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar nome, telefone, origem…" />

      <DataTable
        columns={[
          { key: "nome", label: "Nome" },
          { key: "tel", label: "Telefone" },
          { key: "emp", label: "Interesse" },
          { key: "origem", label: "Origem" },
          { key: "etapa", label: "Etapa" },
          { key: "acao", label: "" },
        ]}
        rows={filtered.map((l) => ({
          nome: l.nome,
          tel: l.telefone,
          emp: l.empInteresse ?? "—",
          origem: statusLabel(l.origem),
          etapa: (
            <StatusPill tone="info">{statusLabel(l.etapa)}</StatusPill>
          ),
          acao:
            l.etapa === "novo_contato" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  moveLead(l.id, "em_atendimento");
                  notify("Lead em atendimento");
                }}
              >
                Atender
              </Button>
            ) : (
              "—"
            ),
        }))}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo lead"
        onSubmit={() => {
          if (!form.nome || !form.telefone) {
            notify("Nome e telefone obrigatórios");
            return;
          }
          addLead(form);
          notify("Lead criado · card na jornada");
          setOpen(false);
        }}
      >
        <Field label="Nome *">
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </Field>
        <Field label="Telefone *">
          <Input
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          />
        </Field>
        <Field label="E-mail">
          <Input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Origem">
          <select
            className={fieldControlClass}
            value={form.origem}
            onChange={(e) =>
              setForm({ ...form, origem: e.target.value as LeadOrigem })
            }
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="anuncio">Anúncio</option>
            <option value="indicacao">Indicação</option>
            <option value="site">Site</option>
            <option value="manual">Manual</option>
          </select>
        </Field>
      </FormDialog>
    </div>
  );
}
