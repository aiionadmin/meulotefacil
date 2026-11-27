"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  FormSheet,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { formatBRL } from "@/lib/masks/br";
import { useFase1 } from "@/lib/store/fase1-store";
import type { ApprovalRule } from "@/lib/domain/fase1-types";

const TIPOS = [
  "Solicitação de compra",
  "Ordem de compra",
  "RDO",
  "Relatório Gerencial",
  "Conciliação bancária",
  "Desconciliar",
  "Estorno de recebimento",
  "Desconto acima do limite",
  "Correção de avanço de card",
] as const;

const EMPTY = {
  tipo: "Ordem de compra",
  perfilNome: "Financeiro",
  valorMinimo: "" as string | number,
  valorMaximo: "" as string | number,
  centroTipo: "qualquer" as "obra" | "empresa" | "qualquer",
  ativo: true,
};

export default function AlcadasPage() {
  const {
    state,
    toggleApprovalRule,
    addApprovalRule,
    updateApprovalRule,
  } = useFase1();
  const [open, setOpen] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  function patchForm(patch: Partial<typeof form>) {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function openCreate() {
    setFormDirty(false);
    setEditId(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(r: ApprovalRule) {
    setFormDirty(false);
    setEditId(r.id);
    setForm({
      tipo: r.tipo,
      perfilNome: r.perfilNome,
      valorMinimo: r.valorMinimo ?? "",
      valorMaximo: r.valorMaximo ?? "",
      centroTipo: r.centroTipo ?? "qualquer",
      ativo: r.ativo,
    });
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Alçadas"
        description="Aprovadores por faixa de valor e centro de custo (SC e OC). Demais rotinas também."
        actions={
          <Button size="sm" onClick={openCreate}>
            Nova alçada
          </Button>
        }
      />
      <ProcessList
        storageKey="alcadas"
        exportName="alcadas"
        rows={state.approvalRules}
        empty="Sem alçadas."
        bulkActions={[
          {
            label: "Ativar seleção",
            onClick: (ids) => {
              let n = 0;
              for (const id of ids) {
                const r = state.approvalRules.find((x) => x.id === id);
                if (r && !r.ativo) {
                  toggleApprovalRule(id);
                  n += 1;
                }
              }
              notify(n ? `${n} ativada(s)` : "Nenhuma inativa");
            },
          },
          {
            label: "Desativar seleção",
            onClick: (ids) => {
              let n = 0;
              for (const id of ids) {
                const r = state.approvalRules.find((x) => x.id === id);
                if (r && r.ativo) {
                  toggleApprovalRule(id);
                  n += 1;
                }
              }
              notify(n ? `${n} desativada(s)` : "Nenhuma ativa");
            },
          },
        ]}
        columns={[
          {
            key: "tipo",
            label: "Tipo",
            filter: { type: "text" },
            getValue: (r) => r.tipo,
            render: (r) => <span className="font-medium">{r.tipo}</span>,
          },
          {
            key: "perfil",
            label: "Perfil",
            filter: { type: "text" },
            getValue: (r) => r.perfilNome,
          },
          {
            key: "faixa",
            label: "Faixa",
            filter: { type: "range" },
            getValue: (r) => r.valorMinimo ?? 0,
            render: (r) => {
              if (r.valorMinimo == null && r.valorMaximo == null) return "—";
              const isPct = r.tipo.includes("Desconto");
              const fmt = (n: number) =>
                isPct ? `${n}%` : formatBRL(n);
              return `${r.valorMinimo != null ? fmt(r.valorMinimo) : "0"} – ${
                r.valorMaximo != null ? fmt(r.valorMaximo) : "∞"
              }`;
            },
          },
          {
            key: "centro",
            label: "Centro",
            filter: {
              type: "status",
              options: [
                { value: "obra", label: "Obra" },
                { value: "empresa", label: "Empresa" },
                { value: "qualquer", label: "Qualquer" },
              ],
            },
            getValue: (r) => r.centroTipo ?? "qualquer",
            render: (r) => {
              const c = r.centroTipo ?? "qualquer";
              return c === "obra"
                ? "Obra"
                : c === "empresa"
                  ? "Empresa"
                  : "Qualquer";
            },
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: [
                { value: "ativa", label: "Ativa" },
                { value: "inativa", label: "Inativa" },
              ],
            },
            getValue: (r) => (r.ativo ? "ativa" : "inativa"),
            render: (r) => (
              <StatusPill tone={r.ativo ? "ok" : "warn"}>
                {r.ativo ? "Ativa" : "Inativa"}
              </StatusPill>
            ),
          },
          {
            key: "acao",
            label: "",
            getValue: () => "",
            render: (r) => (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(r);
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleApprovalRule(r.id);
                    notify(r.ativo ? "Alçada desativada" : "Alçada ativada");
                  }}
                >
                  Alternar
                </Button>
              </div>
            ),
          },
        ]}
      />

      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title={editId ? "Editar alçada" : "Nova alçada"}
        submitLabel="Salvar"
        dirty={formDirty}
        onSubmit={() => {
          if (!form.perfilNome.trim()) {
            notify("Perfil obrigatório");
            return;
          }
          const payload: Omit<ApprovalRule, "id"> = {
            tipo: form.tipo,
            perfilNome: form.perfilNome.trim(),
            valorMinimo:
              form.valorMinimo === ""
                ? undefined
                : Number(form.valorMinimo),
            valorMaximo:
              form.valorMaximo === ""
                ? undefined
                : Number(form.valorMaximo),
            centroTipo: form.centroTipo,
            ativo: form.ativo,
          };
          if (editId) {
            updateApprovalRule(editId, payload);
            notify("Alçada atualizada");
          } else {
            addApprovalRule(payload);
            notify("Alçada criada");
          }
          setFormDirty(false);
          setOpen(false);
        }}
      >
        <Field label="Tipo / rotina *">
          <select
            className={fieldControlClass}
            value={form.tipo}
            onChange={(e) => patchForm({ tipo: e.target.value })}
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Perfil aprovador *">
          <select
            className={fieldControlClass}
            value={form.perfilNome}
            onChange={(e) =>
              patchForm({ perfilNome: e.target.value })
            }
          >
            {state.profiles.map((p) => (
              <option key={p.id} value={p.nome}>
                {p.nome}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Valor mínimo">
            <Input
              type="number"
              value={form.valorMinimo}
              onChange={(e) =>
                patchForm({ valorMinimo: e.target.value })
              }
              placeholder="Sem mínimo"
            />
          </Field>
          <Field label="Valor máximo">
            <Input
              type="number"
              value={form.valorMaximo}
              onChange={(e) =>
                patchForm({ valorMaximo: e.target.value })
              }
              placeholder="Sem teto"
            />
          </Field>
        </div>
        <Field label="Centro de custo">
          <select
            className={fieldControlClass}
            value={form.centroTipo}
            onChange={(e) =>
              patchForm({ centroTipo: e.target.value as typeof form.centroTipo,
              })
            }
          >
            <option value="qualquer">Qualquer</option>
            <option value="obra">Obra</option>
            <option value="empresa">Empresa</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={(e) => patchForm({ ativo: e.target.checked })}
          />
          Ativa
        </label>
      </FormSheet>
    </div>
  );
}
