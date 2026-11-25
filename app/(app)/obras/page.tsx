"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  Field,
  FilterBar,
  FormDialog,
  notify,
} from "@/components/app/ModuleToolkit";
import { brl } from "@/lib/data/sistema";
import { useDemoStore, type Obra } from "@/lib/store/demo-store";

export default function ObrasPage() {
  const { state, updateObra } = useDemoStore();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Obra | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [fisico, setFisico] = useState(0);
  const [realizado, setRealizado] = useState(0);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.obras;
    return state.obras.filter((o) =>
      [o.nome, o.status].join(" ").toLowerCase().includes(term)
    );
  }, [state.obras, q]);

  const orcado = state.obras.reduce((a, o) => a + o.orcado, 0);
  const real = state.obras.reduce((a, o) => a + o.realizado, 0);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Obras e orçamento"
        description="Insumos, orçamento, avanço físico-financeiro e comparação orçado × realizado."
      />
      <KpiGrid
        items={[
          {
            label: "Obras ativas",
            value: state.obras.filter((o) => o.status === "Em execução").length,
          },
          { label: "Orçado", value: brl(orcado) },
          { label: "Realizado", value: brl(real) },
          {
            label: "Saldo orçamentário",
            value: brl(orcado - real),
          },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar obra…" />
      <DataTable
        onRowClick={(i) => setSelected(filtered[i])}
        columns={[
          { key: "nome", label: "Obra" },
          { key: "fisico", label: "Físico %" },
          { key: "orcado", label: "Orçado" },
          { key: "realizado", label: "Realizado" },
          { key: "saldo", label: "Saldo" },
          { key: "status", label: "Status" },
        ]}
        rows={filtered.map((o) => ({
          nome: <span className="font-medium">{o.nome}</span>,
          fisico: `${o.fisico}%`,
          orcado: brl(o.orcado),
          realizado: brl(o.realizado),
          saldo: brl(o.saldo),
          status: (
            <StatusPill tone={o.status === "Concluída" ? "ok" : "info"}>
              {o.status}
            </StatusPill>
          ),
        }))}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.nome ?? "Obra"}
        footer={
          selected && selected.status !== "Concluída" ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFisico(selected.fisico);
                  setRealizado(selected.realizado);
                  setEditOpen(true);
                }}
              >
                Atualizar avanço
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  updateObra(selected.id, {
                    status: "Concluída",
                    fisico: 100,
                    saldo: Math.max(0, selected.orcado - selected.realizado),
                  });
                  setSelected({
                    ...selected,
                    status: "Concluída",
                    fisico: 100,
                  });
                  notify("Obra concluída");
                }}
              >
                Marcar concluída
              </Button>
            </>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="Físico" value={`${selected.fisico}%`} />
            <DetailRow label="Orçado" value={brl(selected.orcado)} />
            <DetailRow label="Realizado" value={brl(selected.realizado)} />
            <DetailRow label="Saldo" value={brl(selected.saldo)} />
            <DetailRow label="Status" value={selected.status} />
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-muted">
              <div
                className="h-full bg-brand-accent-strong"
                style={{ width: `${selected.fisico}%` }}
              />
            </div>
          </>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Atualizar avanço"
        submitLabel="Salvar"
        onSubmit={() => {
          if (!selected) return;
          const saldo = Math.max(0, selected.orcado - realizado);
          updateObra(selected.id, {
            fisico: Math.min(100, Math.max(0, fisico)),
            realizado,
            saldo,
          });
          setSelected({
            ...selected,
            fisico: Math.min(100, Math.max(0, fisico)),
            realizado,
            saldo,
          });
          notify("Avanço atualizado");
          setEditOpen(false);
        }}
      >
        <Field label="Avanço físico (%)">
          <Input
            type="number"
            min={0}
            max={100}
            value={fisico}
            onChange={(e) => setFisico(Number(e.target.value))}
          />
        </Field>
        <Field label="Realizado (R$)">
          <Input
            type="number"
            value={realizado}
            onChange={(e) => setRealizado(Number(e.target.value))}
          />
        </Field>
      </FormDialog>
    </div>
  );
}
