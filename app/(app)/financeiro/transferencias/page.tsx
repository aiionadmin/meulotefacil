"use client";

import { useMemo, useState } from "react";
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
import { downloadExcel, printList } from "@/lib/export/list-export";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";

export default function TransferenciasPage() {
  const { state, transferir, conciliarTransferencias } = useFinanceiro();
  const [open, setOpen] = useState(false);
  const [situacao, setSituacao] = useState<"todas" | "pagas" | "abertas">(
    "todas"
  );
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
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

  const filtered = useMemo(() => {
    return state.transferencias.filter((t) => {
      if (situacao === "pagas" && !t.pago) return false;
      if (situacao === "abertas" && t.pago) return false;
      if (de && t.data < de) return false;
      if (ate && t.data > ate) return false;
      return true;
    });
  }, [state.transferencias, situacao, de, ate]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Transferências"
        description="G15 — período, situação, conciliar em lote, imprimir e exportar."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/contas">Contas</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadExcel(
                  "transferencias",
                  ["Data", "Descrição", "Origem", "Destino", "Valor", "Pago"],
                  filtered.map((t) => [
                    t.data,
                    t.descricao,
                    nome(t.deContaId),
                    nome(t.paraContaId),
                    t.valor,
                    t.pago ? "sim" : "não",
                  ])
                );
                notify("Excel exportado");
              }}
            >
              Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => printList("Transferências")}
            >
              Imprimir
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-end gap-2">
        <Field label="De">
          <Input
            type="date"
            value={de}
            onChange={(e) => setDe(e.target.value)}
          />
        </Field>
        <Field label="Até">
          <Input
            type="date"
            value={ate}
            onChange={(e) => setAte(e.target.value)}
          />
        </Field>
        <Field label="Situação">
          <select
            className={fieldControlClass}
            value={situacao}
            onChange={(e) =>
              setSituacao(e.target.value as typeof situacao)
            }
          >
            <option value="todas">Todas</option>
            <option value="pagas">Pagas</option>
            <option value="abertas">Em aberto</option>
          </select>
        </Field>
        <Button
          size="sm"
          variant="outline"
          disabled={selected.size === 0}
          onClick={() => {
            const n = conciliarTransferencias([...selected]);
            notify(
              n ? "Conciliadas" : "Nada a conciliar",
              n ? `${n} transferência(s)` : undefined
            );
            setSelected(new Set());
          }}
        >
          Conciliar seleção ({selected.size})
        </Button>
      </div>

      <ModuleSection title="Lista">
        <PaginatedTable
          exportName="transferencias"
          columns={[
            { key: "sel", label: "" },
            { key: "data", label: "Data" },
            { key: "desc", label: "Descrição" },
            { key: "de", label: "Origem" },
            { key: "para", label: "Destino" },
            { key: "valor", label: "Valor" },
            { key: "pago", label: "Pago" },
          ]}
          rows={filtered.map((t) => ({
            sel: (
              <input
                type="checkbox"
                checked={selected.has(t.id)}
                disabled={t.pago}
                onChange={() => toggle(t.id)}
                aria-label={`Selecionar ${t.descricao}`}
              />
            ),
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
          const deC = form.deContaId || state.contas[0]?.id;
          const para = form.paraContaId || state.contas[1]?.id;
          if (!deC || !para) {
            notify("Selecione as contas");
            return;
          }
          const tr = transferir({
            data: form.data,
            descricao: form.descricao || "Transferência",
            deContaId: deC,
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
