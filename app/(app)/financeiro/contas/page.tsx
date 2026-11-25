"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  ModuleSection,
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

export default function ContasPage() {
  const { state, addConta } = useFinanceiro();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    banco: "",
    tipo: "corrente" as "corrente" | "poupanca" | "caixa",
    proprietario: "empresa" as "empresa" | "cliente",
    dataInicial: "2026-01-01",
    valorInicial: 0,
    boleto: false,
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Contas bancárias"
        description="Saldo atual, tipo e proprietário (empresa ou cliente)."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro">Pagamentos</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova conta
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          {
            label: "Saldo total",
            value: formatBRL(
              state.contas.reduce((a, c) => a + c.saldo, 0)
            ),
          },
          { label: "Contas", value: state.contas.length },
          {
            label: "Ativas",
            value: state.contas.filter((c) => c.ativa).length,
          },
          {
            label: "Com boleto",
            value: state.contas.filter((c) => c.boleto).length,
          },
        ]}
      />
      <ModuleSection title="Lista">
        <PaginatedTable
          columns={[
            { key: "banco", label: "Banco / Tipo" },
            { key: "nome", label: "Nome" },
            { key: "prop", label: "Proprietário" },
            { key: "saldo", label: "Valor atual" },
            { key: "ini", label: "Data inicial" },
          ]}
          rows={state.contas.map((c) => ({
            banco: `${c.banco} · ${c.tipo}`,
            nome: (
              <Link
                href={`/financeiro/contas/${c.id}`}
                className="font-medium hover:text-brand-orange"
              >
                {c.nome}
              </Link>
            ),
            prop: c.proprietario,
            saldo: formatBRL(c.saldo),
            ini: formatDateBR(c.dataInicial),
          }))}
        />
      </ModuleSection>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova conta"
        onSubmit={() => {
          if (!form.nome.trim()) {
            notify("Nome obrigatório");
            return;
          }
          addConta({
            nome: form.nome,
            banco: form.banco || "—",
            tipo: form.tipo,
            proprietario: form.proprietario,
            dataInicial: form.dataInicial,
            valorInicial: form.valorInicial,
            boleto: form.boleto,
          });
          notify("Conta criada");
          setOpen(false);
        }}
      >
        <Field label="Nome *">
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </Field>
        <Field label="Banco">
          <Input
            value={form.banco}
            onChange={(e) => setForm({ ...form, banco: e.target.value })}
          />
        </Field>
        <Field label="Tipo">
          <select
            className={fieldControlClass}
            value={form.tipo}
            onChange={(e) =>
              setForm({
                ...form,
                tipo: e.target.value as typeof form.tipo,
              })
            }
          >
            <option value="corrente">Corrente</option>
            <option value="poupanca">Poupança</option>
            <option value="caixa">Caixa/Dinheiro</option>
          </select>
        </Field>
        <Field label="Proprietário *">
          <select
            className={fieldControlClass}
            value={form.proprietario}
            onChange={(e) =>
              setForm({
                ...form,
                proprietario: e.target.value as typeof form.proprietario,
              })
            }
          >
            <option value="empresa">Empresa</option>
            <option value="cliente">Cliente</option>
          </select>
        </Field>
        <Field label="Valor inicial *">
          <Input
            type="number"
            value={form.valorInicial}
            onChange={(e) =>
              setForm({
                ...form,
                valorInicial: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
