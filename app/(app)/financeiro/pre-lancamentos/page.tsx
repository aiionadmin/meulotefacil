"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import type { PreLancamento } from "@/lib/domain/financeiro-types";

export default function PreLancamentosPage() {
  const { state, addPreLancamento, aprovarPre, recusarPre } = useFinanceiro();
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    descricao: "",
    valor: 100,
    solicitante: "Admin Demo",
    centroLabel: "Meu Lote Fácil",
  });

  const STATUS_COLS = [
    { id: "pendente", label: "Pendente" },
    { id: "aprovado", label: "Aprovado" },
    { id: "recusado", label: "Recusado" },
  ];

  const toCard = useCallback(
    (p: PreLancamento) => ({
      id: p.id,
      columnId: p.status,
      title: p.descricao,
      subtitle: p.solicitante,
      badge: formatBRL(p.valor),
      meta: p.centro.label,
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Pré-lançamentos"
        description="Kanban | Lista (C19) — despesa com comprovante aguarda revisão."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro">Pagamentos</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Novo
            </Button>
          </>
        }
      />

      <ProcessBoard
        storageKey="pre-lancamentos"
        columns={STATUS_COLS}
        rows={state.preLancamentos}
        toCard={toCard}
        columnTotals={(_, items) => items.reduce((a, p) => a + p.valor, 0)}
        onMove={(id, to) => {
          const row = state.preLancamentos.find((p) => p.id === id);
          if (!row || row.status !== "pendente") {
            notify("Só pendentes podem mudar de coluna");
            return false;
          }
          if (to === "aprovado") {
            const ok = aprovarPre(id);
            if (ok) notify("Aprovado → lançamento");
            return ok;
          }
          if (to === "recusado") {
            const m = motivo[id]?.trim() || "Recusado no quadro";
            const ok = recusarPre(id, m);
            if (ok) notify("Recusado", m);
            return ok;
          }
          return false;
        }}
        exportName="pre-lancamentos"
        listColumns={[
          {
            key: "data",
            label: "Data",
            filter: { type: "period" },
            getValue: (p) => p.criadoEm,
            render: (p) => formatDateBR(p.criadoEm),
          },
          {
            key: "desc",
            label: "Descrição",
            filter: { type: "text" },
            getValue: (p) => p.descricao,
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (p) => p.valor,
            render: (p) => formatBRL(p.valor),
          },
          {
            key: "centro",
            label: "Centro",
            filter: { type: "text" },
            getValue: (p) => p.centro.label,
          },
          {
            key: "sol",
            label: "Solicitante",
            filter: { type: "text" },
            getValue: (p) => p.solicitante,
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: STATUS_COLS.map((c) => ({
                value: c.id,
                label: c.label,
              })),
            },
            getValue: (p) => p.status,
            render: (p) => (
              <div className="space-y-1">
                <StatusPill
                  tone={
                    p.status === "aprovado"
                      ? "ok"
                      : p.status === "recusado"
                        ? "danger"
                        : "info"
                  }
                >
                  {p.status}
                </StatusPill>
                {p.status === "pendente" ? (
                  <Input
                    className="h-7 w-28"
                    placeholder="Motivo"
                    value={motivo[p.id] ?? ""}
                    onChange={(e) =>
                      setMotivo({ ...motivo, [p.id]: e.target.value })
                    }
                  />
                ) : null}
              </div>
            ),
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo pré-lançamento"
        onSubmit={() => {
          if (!form.descricao.trim() || form.valor <= 0) {
            notify("Descrição e valor obrigatórios");
            return;
          }
          addPreLancamento({
            descricao: form.descricao,
            valor: form.valor,
            solicitante: form.solicitante,
            centro: { tipo: "empresa", label: form.centroLabel },
          });
          notify("Pré-lançamento criado");
          setOpen(false);
        }}
      >
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        <Field label="Valor *">
          <Input
            type="number"
            value={form.valor}
            onChange={(e) =>
              setForm({ ...form, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Solicitante">
          <Input
            value={form.solicitante}
            onChange={(e) =>
              setForm({ ...form, solicitante: e.target.value })
            }
          />
        </Field>
        <Field label="Centro de custo">
          <Input
            value={form.centroLabel}
            onChange={(e) =>
              setForm({ ...form, centroLabel: e.target.value })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
