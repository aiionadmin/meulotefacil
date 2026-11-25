"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useDemoStore, type Compra } from "@/lib/store/demo-store";

const fluxo = [
  "Solicitação",
  "Cotação",
  "Ordem de compra",
  "Lançamento financeiro",
];

export default function ComprasPage() {
  const { state, addCompra, avancarCompra, aprovarCompra } = useDemoStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Compra | null>(null);
  const [form, setForm] = useState({
    centro: "Horizonte",
    urgencia: "Normal",
    itens: 3,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.compras;
    return state.compras.filter((c) =>
      [c.id, c.tipo, c.centro, c.status].join(" ").toLowerCase().includes(term)
    );
  }, [state.compras, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Compras"
        description="Fluxo SC → Cotação → OC → lançamento financeiro, com alçada de aprovação."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Nova solicitação
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Documentos", value: state.compras.length },
          {
            label: "Solicitações",
            value: state.compras.filter((c) => c.tipo === "Solicitação").length,
          },
          {
            label: "Cotações",
            value: state.compras.filter((c) => c.tipo === "Cotação").length,
          },
          {
            label: "OCs",
            value: state.compras.filter((c) => c.tipo.includes("Ordem")).length,
          },
        ]}
      />

      <ModuleSection title="Fluxo">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {fluxo.map((f) => (
            <Card key={f}>
              <CardContent className="py-4 text-sm font-medium text-ink">
                {f}
              </CardContent>
            </Card>
          ))}
        </div>
      </ModuleSection>

      <FilterBar value={q} onChange={setQ} placeholder="Buscar compra…" />
      <DataTable
        onRowClick={(i) => setSelected(filtered[i])}
        columns={[
          { key: "id", label: "Código" },
          { key: "tipo", label: "Tipo" },
          { key: "centro", label: "Centro" },
          { key: "itens", label: "Itens" },
          { key: "urgencia", label: "Urgência" },
          { key: "status", label: "Status" },
        ]}
        rows={filtered.map((c) => ({
          id: <span className="font-medium">{c.id}</span>,
          tipo: c.tipo,
          centro: c.centro,
          itens: c.itens,
          urgencia: c.urgencia,
          status: (
            <StatusPill
              tone={
                c.status === "Aprovada"
                  ? "ok"
                  : c.status.includes("aprovação")
                    ? "warn"
                    : "info"
              }
            >
              {c.status}
            </StatusPill>
          ),
        }))}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova solicitação de compra"
        submitLabel="Criar SC"
        onSubmit={() => {
          addCompra({
            tipo: "Solicitação",
            centro: form.centro,
            status: "Em aprovação",
            urgencia: form.urgencia,
            itens: Number(form.itens) || 1,
          });
          notify("Solicitação criada");
          setOpen(false);
        }}
      >
        <Field label="Centro / obra">
          <select
            className={fieldControlClass}
            value={form.centro}
            onChange={(e) => setForm({ ...form, centro: e.target.value })}
          >
            {["Horizonte", "Colinas", "Aurora", "Vila Paula", "Empresa"].map(
              (c) => (
                <option key={c}>{c}</option>
              )
            )}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Urgência">
            <select
              className={fieldControlClass}
              value={form.urgencia}
              onChange={(e) => setForm({ ...form, urgencia: e.target.value })}
            >
              <option>Normal</option>
              <option>Média</option>
              <option>Alta</option>
            </select>
          </Field>
          <Field label="Itens">
            <Input
              type="number"
              min={1}
              value={form.itens}
              onChange={(e) =>
                setForm({ ...form, itens: Number(e.target.value) })
              }
            />
          </Field>
        </div>
      </FormDialog>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.id ?? "Compra"}
        footer={
          selected ? (
            <>
              {selected.status === "Em aprovação" ||
              selected.tipo === "Ordem de compra" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    aprovarCompra(selected.id);
                    setSelected({ ...selected, status: "Aprovada" });
                    notify("Documento aprovado", selected.id);
                  }}
                >
                  Aprovar
                </Button>
              ) : null}
              {selected.tipo !== "Ordem de compra" ||
              selected.status === "Em aprovação" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    avancarCompra(selected.id);
                    setSelected(null);
                    notify("Fluxo avançado");
                  }}
                >
                  Avançar etapa
                </Button>
              ) : null}
            </>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="Tipo" value={selected.tipo} />
            <DetailRow label="Centro" value={selected.centro} />
            <DetailRow label="Itens" value={selected.itens} />
            <DetailRow label="Urgência" value={selected.urgencia} />
            <DetailRow label="Status" value={selected.status} />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
