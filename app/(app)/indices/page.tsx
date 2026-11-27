"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleHeader } from "@/components/app/ModulePage";
import { ProcessList } from "@/components/app/ProcessList";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useCarteira } from "@/lib/store/carteira-store";
import { useSystemSettings } from "@/lib/store/system-settings-store";
import { normalizeCompetencia } from "@/lib/money/index-quote";
import type { IndexQuote } from "@/lib/domain/carteira-types";

export default function IndicesPage() {
  const { state, upsertIndexQuote, removeIndexQuote } = useCarteira();
  const { indicePadrao, state: settings } = useSystemSettings();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IndexQuote | null>(null);
  const [form, setForm] = useState({
    indice: indicePadrao,
    competencia: new Date().toISOString().slice(0, 7),
    fator: 1.0,
  });

  function openCreate() {
    setEditing(null);
    setForm({
      indice: indicePadrao,
      competencia: new Date().toISOString().slice(0, 7),
      fator: 1.0,
    });
    setOpen(true);
  }

  function openEdit(q: IndexQuote) {
    setEditing(q);
    setForm({
      indice: q.indice,
      competencia: q.competencia,
      fator: q.fator,
    });
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Índices e cotações"
        description={`Padrão do sistema: ${indicePadrao}. Cotações de mercado por competência — entram no contrato e no reajuste.`}
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/configuracoes/indices">Configurar índices</Link>
            </Button>
            <Button size="sm" onClick={openCreate}>
              Nova cotação
            </Button>
          </>
        }
      />
      <ProcessList
        storageKey="indices"
        exportName="indices"
        rows={state.indices}
        empty="Sem cotações. Cadastre o fator atual do mercado."
        onRowClick={(row) => openEdit(row)}
        columns={[
          {
            key: "indice",
            label: "Índice",
            filter: { type: "text" },
            getValue: (i) => i.indice,
          },
          {
            key: "comp",
            label: "Competência",
            filter: { type: "period" },
            getValue: (i) => i.competencia,
          },
          {
            key: "fator",
            label: "Fator",
            filter: { type: "range" },
            getValue: (i) => i.fator,
            render: (i) => i.fator.toFixed(4),
          },
          {
            key: "acoes",
            label: "",
            getValue: () => "",
            render: (i) => (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  if (removeIndexQuote(i.id)) {
                    notify("Cotação removida", `${i.indice} ${i.competencia}`);
                  }
                }}
              >
                Excluir
              </Button>
            ),
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Editar cotação" : "Nova cotação de mercado"}
        onSubmit={() => {
          const competencia = normalizeCompetencia(form.competencia);
          if (!form.indice.trim() || !competencia) {
            notify("Informe índice e competência");
            return;
          }
          if (!(form.fator > 0)) {
            notify("Fator inválido");
            return;
          }
          const q = upsertIndexQuote({
            id: editing?.id,
            indice: form.indice,
            competencia,
            fator: form.fator,
          });
          notify(
            editing ? "Cotação atualizada" : "Cotação cadastrada",
            `${q.indice} · ${q.competencia} · ${q.fator.toFixed(4)}`
          );
          setOpen(false);
        }}
      >
        <Field label="Índice">
          <select
            className={fieldControlClass}
            value={form.indice}
            onChange={(e) => setForm({ ...form, indice: e.target.value })}
          >
            {settings.indices
              .filter((i) => i.ativo)
              .map((i) => (
                <option key={i.codigo} value={i.codigo}>
                  {i.abreviatura} — {i.nome}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Competência (AAAA-MM)">
          <Input
            value={form.competencia}
            onChange={(e) =>
              setForm({ ...form, competencia: e.target.value })
            }
            placeholder="2026-11"
          />
        </Field>
        <Field label="Fator de mercado (ex.: 1.0031)">
          <Input
            type="number"
            step="0.0001"
            value={form.fator}
            onChange={(e) =>
              setForm({ ...form, fator: Number(e.target.value) || 1 })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
