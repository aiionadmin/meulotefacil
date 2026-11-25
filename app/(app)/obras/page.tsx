"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  Field,
  FilterBar,
  FormDialog,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useOperacoes } from "@/lib/store/operacoes-store";
import type { WorkSite } from "@/lib/domain/operacoes-types";

export default function ObrasPage() {
  const { state, updateWorkProgress } = useOperacoes();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<WorkSite | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [fisico, setFisico] = useState(0);
  const [realizado, setRealizado] = useState(0);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.works;
    return state.works.filter((o) =>
      [o.nome, o.status].join(" ").toLowerCase().includes(term)
    );
  }, [state.works, q]);

  const orcado = state.works.reduce((a, o) => a + o.orcado, 0);
  const real = state.works.reduce((a, o) => a + o.realizado, 0);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Obras e orçamento"
        description="Fase 7 — gestão de custos por empreendimento (centro de custo compartilhado)."
      />

      <KpiGrid
        items={[
          { label: "Obras", value: state.works.length },
          { label: "Orçado", value: formatBRL(orcado) },
          { label: "Realizado", value: formatBRL(real) },
          {
            label: "Saldo",
            value: formatBRL(orcado - real),
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar obra…" />

      <DataTable
        columns={[
          { key: "nome", label: "Obra" },
          { key: "status", label: "Status" },
          { key: "fisico", label: "Físico" },
          { key: "orcado", label: "Orçado" },
          { key: "realizado", label: "Realizado" },
          { key: "saldo", label: "Saldo" },
        ]}
        rows={filtered.map((o) => ({
          nome: (
            <button
              type="button"
              className="font-medium hover:text-brand-orange"
              onClick={() => setSelected(o)}
            >
              {o.nome}
            </button>
          ),
          status: <StatusPill tone="info">{o.status}</StatusPill>,
          fisico: `${o.fisico}%`,
          orcado: formatBRL(o.orcado),
          realizado: formatBRL(o.realizado),
          saldo: formatBRL(o.orcado - o.realizado),
        }))}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.nome ?? ""}
        footer={
          selected ? (
            <Button
              size="sm"
              onClick={() => {
                setFisico(selected.fisico);
                setRealizado(selected.realizado);
                setEditOpen(true);
              }}
            >
              Atualizar progresso
            </Button>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-4">
            <DetailRow label="Orçamento" value={selected.budgetStatus} />
            <DetailRow label="Físico" value={`${selected.fisico}%`} />
            <DetailRow label="Orçado" value={formatBRL(selected.orcado)} />
            <DetailRow label="Realizado" value={formatBRL(selected.realizado)} />
            <ModuleSection title="Árvore do orçamento">
              <DataTable
                columns={[
                  { key: "codigo", label: "Cód." },
                  { key: "desc", label: "Item" },
                  { key: "orcado", label: "Orçado" },
                  { key: "real", label: "Real" },
                  { key: "pct", label: "%" },
                ]}
                rows={selected.nodes.map((n) => ({
                  codigo: n.codigo,
                  desc: n.descricao,
                  orcado: formatBRL(n.orcado),
                  real: formatBRL(n.realizado),
                  pct:
                    n.orcado > 0
                      ? `${Math.round((n.realizado / n.orcado) * 100)}%`
                      : "—",
                }))}
              />
            </ModuleSection>
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Atualizar evolução"
        onSubmit={() => {
          if (!selected) return;
          updateWorkProgress(selected.id, {
            fisico: Math.min(100, Math.max(0, fisico)),
            realizado,
          });
          notify("Progresso atualizado");
          setEditOpen(false);
          setSelected(null);
        }}
      >
        <Field label="Evolução física (%)">
          <Input
            type="number"
            value={fisico}
            onChange={(e) => setFisico(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Realizado (R$)">
          <Input
            type="number"
            value={realizado}
            onChange={(e) => setRealizado(Number(e.target.value) || 0)}
          />
        </Field>
      </FormDialog>
    </div>
  );
}
