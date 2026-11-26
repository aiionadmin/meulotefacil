"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";

export default function TransferenciasPage() {
  const { state, transferir } = useFinanceiro();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    data: new Date().toISOString().slice(0, 10),
    valor: 500,
    descricao: "",
    deContaId: "",
    paraContaId: "",
    pago: true,
  });

  const nome = (id: string) =>
    state.contas.find((c) => c.id === id)?.nome ?? "—";

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Transferências"
        description="Movimenta saldo entre contas quando marcada como paga."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/contas">Contas</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova
            </Button>
          </>
        }
      />
      <ModuleSection title="Lista">
        <PaginatedTable
          columns={[
            { key: "data", label: "Data" },
            { key: "desc", label: "Descrição" },
            { key: "de", label: "Origem" },
            { key: "para", label: "Destino" },
            { key: "valor", label: "Valor" },
            { key: "pago", label: "Pago" },
          ]}
          rows={state.transferencias.map((t) => ({
            data: formatDateBR(t.data),
            desc: t.descricao,
            de: nome(t.deContaId),
            para: nome(t.paraContaId),
            valor: formatBRL(t.valor),
            pago: (
              <StatusPill tone={t.pago ? "ok" : "info"}>
                {t.pago ? "Paga" : "Em aberto"}
              </StatusPill>
            ),
          }))}
          empty="Nenhuma transferência."
        />
      </ModuleSection>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova transferência"
        onSubmit={() => {
          const de = form.deContaId || state.contas[0]?.id;
          const para = form.paraContaId || state.contas[1]?.id;
          if (!de || !para) {
            notify("Selecione as contas");
            return;
          }
          const tr = transferir({
            data: form.data,
            descricao: form.descricao || "Transferência",
            deContaId: de,
            paraContaId: para,
            valor: form.valor,
            pago: form.pago,
          });
          if (!tr) {
            notify("Contas iguais ou valor inválido");
            return;
          }
          notify("Transferência registrada");
          setOpen(false);
        }}
      >
        <Field label="Data *">
          <Input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
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
        <Field label="Conta origem *">
          <select
            className={fieldControlClass}
            value={form.deContaId || state.contas[0]?.id}
            onChange={(e) => setForm({ ...form, deContaId: e.target.value })}
          >
            {state.contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Conta destino *">
          <select
            className={fieldControlClass}
            value={form.paraContaId || state.contas[1]?.id}
            onChange={(e) =>
              setForm({ ...form, paraContaId: e.target.value })
            }
          >
            {state.contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Descrição">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.pago}
            onChange={(e) => setForm({ ...form, pago: e.target.checked })}
          />
          Marcar como pago
        </label>
      </FormDialog>
    </div>
  );
}
