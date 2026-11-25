"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useObras } from "@/lib/store/obras-store";
import type { ObraStatus } from "@/lib/domain/obras-types";
import { useCarteira } from "@/lib/store/carteira-store";

const STATUS_LABEL: Record<ObraStatus, string> = {
  em_orcamento: "Em orçamento",
  em_andamento: "Em andamento",
  paralisada: "Paralisada",
  finalizada: "Finalizada",
};

export default function ObrasPage() {
  const { state, addObra, duplicateObra, softRemoveObra } = useObras();
  const { state: carteira } = useCarteira();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo: "infraestrutura",
    status: "em_orcamento" as ObraStatus,
    clienteNome: "",
    developmentId: "",
    responsavelObra: "Eng. Paula",
    areaTotal: 0,
    bdiPct: 0.25,
  });

  const filtered = useMemo(() => {
    let list = state.obras;
    if (statusFilter !== "todos") {
      list = list.filter((o) => o.status === statusFilter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((o) =>
        [o.codigo, o.nome, o.clienteNome, o.tipo, o.developmentNome]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [state.obras, q, statusFilter]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Minhas obras"
        description="Obra independente dos lotes — vínculo com empreendimento é opcional."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/obras/rdo">RDO</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova obra
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Obras", value: state.obras.length },
          {
            label: "Em andamento",
            value: state.obras.filter((o) => o.status === "em_andamento")
              .length,
          },
          {
            label: "Orçado",
            value: formatBRL(
              state.obras.reduce((a, o) => a + o.orcado, 0)
            ),
          },
          {
            label: "Realizado",
            value: formatBRL(
              state.obras.reduce((a, o) => a + o.realizado, 0)
            ),
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar código, obra, cliente…">
        <select
          className={fieldControlClass + " max-w-[180px]"}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos status</option>
          {(Object.keys(STATUS_LABEL) as ObraStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </FilterBar>

      <PaginatedTable
        columns={[
          { key: "codigo", label: "Código" },
          { key: "obra", label: "Obra" },
          { key: "cliente", label: "Cliente" },
          { key: "tipo", label: "Tipo" },
          { key: "status", label: "Status" },
          { key: "fisico", label: "Físico" },
          { key: "acoes", label: "" },
        ]}
        rows={filtered.map((o) => ({
          codigo: o.codigo,
          obra: (
            <Link
              href={`/obras/${o.id}`}
              className="font-medium hover:text-brand-orange"
            >
              {o.nome}
            </Link>
          ),
          cliente: o.clienteNome,
          tipo: o.tipo,
          status: (
            <StatusPill tone="info">{STATUS_LABEL[o.status]}</StatusPill>
          ),
          fisico: `${o.fisicoPct}%`,
          acoes: (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  duplicateObra(o.id);
                  notify("Obra duplicada");
                }}
              >
                Duplicar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  softRemoveObra(o.id);
                  notify("Obra removida da lista");
                }}
              >
                Remover
              </Button>
            </div>
          ),
        }))}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova obra"
        onSubmit={() => {
          if (!form.nome.trim() || !form.codigo.trim()) {
            notify("Código e nome obrigatórios");
            return;
          }
          const emp = carteira.developments.find(
            (d) => d.id === form.developmentId
          );
          addObra({
            codigo: form.codigo,
            nome: form.nome.slice(0, 200),
            tipo: form.tipo,
            status: form.status,
            clienteNome: form.clienteNome || "Cliente",
            developmentId: emp?.id,
            developmentNome: emp?.nome,
            areaTotal: form.areaTotal || undefined,
            unidade: "m²",
            responsavelObra: form.responsavelObra,
            visivelPara: ["u-admin"],
            bdiPct: form.bdiPct,
          });
          notify("Obra criada");
          setOpen(false);
        }}
      >
        <Field label="Código *">
          <Input
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />
        </Field>
        <Field label="Nome *">
          <Input
            value={form.nome}
            maxLength={200}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </Field>
        <Field label="Tipo">
          <Input
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          />
        </Field>
        <Field label="Status *">
          <select
            className={fieldControlClass}
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as ObraStatus })
            }
          >
            {(Object.keys(STATUS_LABEL) as ObraStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cliente">
          <Input
            value={form.clienteNome}
            onChange={(e) =>
              setForm({ ...form, clienteNome: e.target.value })
            }
          />
        </Field>
        <Field label="Empreendimento (opcional)">
          <select
            className={fieldControlClass}
            value={form.developmentId}
            onChange={(e) =>
              setForm({ ...form, developmentId: e.target.value })
            }
          >
            <option value="">Sem vínculo</option>
            {carteira.developments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </Field>
      </FormDialog>
    </div>
  );
}
