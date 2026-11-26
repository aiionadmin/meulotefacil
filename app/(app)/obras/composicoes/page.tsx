"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleHeader, DataTable, StatusPill } from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { formatBRL } from "@/lib/masks/br";
import { useObras } from "@/lib/store/obras-store";
import { custoPorGrupo, precoComBdi } from "@/lib/money/orcamento";
import type { Composicao } from "@/lib/domain/obras-types";

export default function ComposicoesPage() {
  const { state, addComposicao } = useObras();
  const [selected, setSelected] = useState<Composicao | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    descricao: "",
    unidade: "m³",
    base: "SINAPI",
    bdiPct: 0.25,
    insumoId: state.insumos[0]?.id ?? "",
    coeficiente: 1,
  });

  const custoComp = (c: Composicao) =>
    c.itens.reduce((a, it) => {
      const ins = state.insumos.find((i) => i.id === it.insumoId);
      return a + (ins?.custoUnitario ?? 0) * it.coeficiente;
    }, 0);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Composições"
        description="Insumos com coeficiente, totais por grupo e BDI — lista filtrável (C14)."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Nova composição
          </Button>
        }
      />
      <ProcessList
        storageKey="composicoes"
        exportName="composicoes"
        rows={state.composicoes}
        empty="Sem composições."
        onRowClick={(c) => setSelected(c)}
        columns={[
          {
            key: "codigo",
            label: "Código",
            filter: { type: "text" },
            getValue: (c) => c.codigo,
            render: (c) => (
              <span className="font-medium text-brand-orange">{c.codigo}</span>
            ),
          },
          {
            key: "desc",
            label: "Descrição",
            filter: { type: "text" },
            getValue: (c) => c.descricao,
          },
          {
            key: "un",
            label: "Un.",
            filter: { type: "text" },
            getValue: (c) => c.unidade,
          },
          {
            key: "base",
            label: "Base",
            filter: { type: "text" },
            getValue: (c) => c.base,
          },
          {
            key: "custo",
            label: "Custo unit.",
            filter: { type: "range" },
            getValue: (c) => custoComp(c),
            render: (c) => formatBRL(custoComp(c)),
          },
          {
            key: "preco",
            label: "Preço c/ BDI",
            filter: { type: "range" },
            getValue: (c) => precoComBdi(custoComp(c), c.bdiPct),
            render: (c) => formatBRL(precoComBdi(custoComp(c), c.bdiPct)),
          },
        ]}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${selected.codigo} · ${selected.descricao}` : ""}
      >
        {selected ? (
          <div className="space-y-3">
            <DetailRow label="Unidade" value={selected.unidade} />
            <DetailRow label="BDI" value={`${selected.bdiPct * 100}%`} />
            <DataTable
              columns={[
                { key: "ins", label: "Insumo" },
                { key: "g", label: "Grupo" },
                { key: "coef", label: "Coef." },
                { key: "cu", label: "Custo" },
                { key: "ct", label: "Total" },
              ]}
              rows={selected.itens.map((it) => {
                const ins = state.insumos.find((i) => i.id === it.insumoId);
                const total = (ins?.custoUnitario ?? 0) * it.coeficiente;
                return {
                  ins: ins?.descricao ?? it.insumoId,
                  g: (
                    <StatusPill tone="neutral">
                      {ins?.grupo.replace(/_/g, " ") ?? "—"}
                    </StatusPill>
                  ),
                  coef: it.coeficiente,
                  cu: formatBRL(ins?.custoUnitario ?? 0),
                  ct: formatBRL(total),
                };
              })}
            />
            {(() => {
              const grupos = custoPorGrupo(
                selected.itens.map((it) => {
                  const ins = state.insumos.find((i) => i.id === it.insumoId);
                  return {
                    grupo: ins?.grupo ?? "outros",
                    custo: (ins?.custoUnitario ?? 0) * it.coeficiente,
                  };
                })
              );
              return (
                <div className="space-y-1 text-sm">
                  {Object.entries(grupos).map(([g, v]) => (
                    <DetailRow
                      key={g}
                      label={g.replace(/_/g, " ")}
                      value={formatBRL(v)}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova composição"
        onSubmit={() => {
          if (!form.codigo || !form.descricao || !form.insumoId) {
            notify("Preencha código, descrição e um insumo");
            return;
          }
          addComposicao({
            codigo: form.codigo,
            descricao: form.descricao,
            unidade: form.unidade,
            base: form.base,
            favorito: false,
            ativo: true,
            bdiPct: form.bdiPct,
            itens: [
              {
                id: `ci-${Date.now()}`,
                insumoId: form.insumoId,
                coeficiente: form.coeficiente,
              },
            ],
          });
          notify("Composição criada");
          setOpen(false);
        }}
      >
        <Field label="Código *">
          <Input
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />
        </Field>
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        <Field label="Unidade *">
          <Input
            value={form.unidade}
            onChange={(e) => setForm({ ...form, unidade: e.target.value })}
          />
        </Field>
        <Field label="Insumo inicial">
          <select
            className={fieldControlClass}
            value={form.insumoId}
            onChange={(e) => setForm({ ...form, insumoId: e.target.value })}
          >
            {state.insumos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.codigo} · {i.descricao}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Coeficiente">
          <Input
            type="number"
            value={form.coeficiente}
            onChange={(e) =>
              setForm({
                ...form,
                coeficiente: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
