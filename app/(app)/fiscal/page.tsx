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
import { useDemoStore, type NotaFiscal } from "@/lib/store/demo-store";

export default function FiscalPage() {
  const { state, vincularNota, emitirNfse } = useDemoStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<NotaFiscal | null>(null);
  const [form, setForm] = useState({ cliente: "Prefeitura de Amparo", valor: 15000 });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.fiscal;
    return state.fiscal.filter((n) =>
      [n.tipo, n.numero, n.emitente, n.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.fiscal, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Fiscal e contábil"
        description="Captura de NFe, emissão de NFSe, vinculação a lançamentos e exportações."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                notify(
                  "Exportação DIMOB/SPED",
                  "Arquivo demo gerado (sem envio real)"
                )
              }
            >
              Exportar
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Emitir NFSe
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Notas", value: state.fiscal.length },
          {
            label: "Sem lançamento",
            value: state.fiscal.filter((n) => n.status === "Sem lançamento")
              .length,
          },
          {
            label: "Emitidas",
            value: state.fiscal.filter((n) => n.status === "Emitida").length,
          },
          {
            label: "Vinculadas",
            value: state.fiscal.filter((n) => n.status === "Vinculada").length,
          },
        ]}
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar nota…" />
      <DataTable
        onRowClick={(i) => setSelected(filtered[i])}
        columns={[
          { key: "tipo", label: "Tipo" },
          { key: "numero", label: "Número" },
          { key: "emitente", label: "Emitente" },
          { key: "valor", label: "Valor" },
          { key: "status", label: "Status" },
        ]}
        rows={filtered.map((n) => ({
          tipo: n.tipo,
          numero: <span className="font-medium">{n.numero}</span>,
          emitente: n.emitente,
          valor: brl(n.valor),
          status: (
            <StatusPill
              tone={
                n.status === "Vinculada" || n.status === "Emitida"
                  ? "ok"
                  : "warn"
              }
            >
              {n.status}
            </StatusPill>
          ),
        }))}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Emitir NFSe"
        submitLabel="Emitir"
        onSubmit={() => {
          const n = emitirNfse(form.cliente, Number(form.valor) || 0);
          notify("NFSe emitida", `Nº ${n.numero}`);
          setOpen(false);
        }}
      >
        <Field label="Tomador">
          <Input
            value={form.cliente}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
          />
        </Field>
        <Field label="Valor">
          <Input
            type="number"
            value={form.valor}
            onChange={(e) =>
              setForm({ ...form, valor: Number(e.target.value) })
            }
          />
        </Field>
      </FormDialog>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${selected.tipo} ${selected.numero}` : "Nota"}
        footer={
          selected && selected.status === "Sem lançamento" ? (
            <Button
              size="sm"
              onClick={() => {
                vincularNota(selected.id);
                setSelected({ ...selected, status: "Vinculada" });
                notify("Nota vinculada ao financeiro");
              }}
            >
              Vincular lançamento
            </Button>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="Emitente" value={selected.emitente} />
            <DetailRow label="Valor" value={brl(selected.valor)} />
            <DetailRow label="Status" value={selected.status} />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
