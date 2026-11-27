"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  processos as seedProcessos,
  statusProcessoLabel,
} from "@/lib/data/processos";
import { faseLabel, nucleos } from "@/lib/data/nucleos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
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
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { SearchSelect } from "@/components/app/SearchSelect";
import {
  EMPTY_GEO_EMP,
  GeoEmpFilters,
  type GeoEmpFilterValues,
} from "@/components/app/GeoEmpFilters";
import type { Processo, StatusProcesso } from "@/lib/data/processos";
import type { FaseProcesso } from "@/lib/data/nucleos";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { useNovoParam } from "@/lib/ui/use-novo-param";

const STATUS_COLS: { id: StatusProcesso; label: string }[] = [
  { id: "diagnostico", label: statusProcessoLabel.diagnostico },
  { id: "projetos", label: statusProcessoLabel.projetos },
  { id: "aprovacao_crf", label: statusProcessoLabel.aprovacao_crf },
  { id: "registro", label: statusProcessoLabel.registro },
  { id: "concluido", label: statusProcessoLabel.concluido },
];

type FormState = {
  protocolo: string;
  nucleoId: string;
  developmentId: string;
  moradorPersonId: string;
  fase: FaseProcesso;
  status: StatusProcesso;
};

const EMPTY_FORM: FormState = {
  protocolo: "",
  nucleoId: "",
  developmentId: "",
  moradorPersonId: "",
  fase: "diagnostico",
  status: "diagnostico",
};

export default function ProcessosPage() {
  const { state: carteira } = useCarteira();
  const { state: fase1 } = useFase1();
  const pessoas = useMemo(
    () => fase1.people.filter((p) => p.status !== "excluido"),
    [fase1.people]
  );
  const [q, setQ] = useState("");
  const [geo, setGeo] = useState<GeoEmpFilterValues>(EMPTY_GEO_EMP);
  const [rows, setRows] = useState(seedProcessos);
  const [selected, setSelected] = useState<Processo | null>(null);
  const [open, setOpen] = useNovoParam();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const suggestions = useMemo(
    () =>
      rows.flatMap((p) => [
        p.protocolo,
        p.nucleoNome,
        p.moradorNome,
        p.cidade,
        p.empNome ?? "",
      ]),
    [rows]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((p) => {
      if (geo.cidade !== "todas" && p.cidade !== geo.cidade) return false;
      if (geo.bairro !== "todos") {
        const nucleo = nucleos.find((n) => n.id === p.nucleoId);
        const bairro = nucleo?.bairro || nucleo?.nome || p.nucleoNome;
        if (bairro !== geo.bairro) return false;
      }
      if (geo.developmentId !== "todos") {
        if (p.developmentId !== geo.developmentId) return false;
      }
      if (!term) return true;
      return [p.protocolo, p.nucleoNome, p.moradorNome, p.cidade, p.empNome]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [q, rows, geo]);

  const empsDoNucleo = useMemo(() => {
    if (!form.nucleoId) return carteira.developments;
    return carteira.developments.filter((d) => d.nucleoId === form.nucleoId);
  }, [carteira.developments, form.nucleoId]);

  const toCard = useCallback(
    (p: Processo) => ({
      id: p.id,
      columnId: p.status,
      title: p.protocolo,
      subtitle: p.moradorNome,
      badge: p.docsPendentes ? `${p.docsPendentes} docs` : "Em dia",
      meta: p.empNome ? `${p.nucleoNome} · ${p.empNome}` : p.nucleoNome,
    }),
    []
  );

  function openCreate() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      protocolo: `MLF-${new Date().getFullYear()}-${String(rows.length + 1).padStart(4, "0")}`,
      nucleoId: nucleos[0]?.id ?? "",
      moradorPersonId: pessoas[0]?.id ?? "",
    });
    setOpen(true);
  }

  function openEdit(p: Processo) {
    setEditingId(p.id);
    setForm({
      protocolo: p.protocolo,
      nucleoId: p.nucleoId ?? "",
      developmentId: p.developmentId ?? "",
      moradorPersonId: p.moradorPersonId ?? "",
      fase: p.fase,
      status: p.status,
    });
    setOpen(true);
  }

  function saveProcesso() {
    const nucleo = nucleos.find((n) => n.id === form.nucleoId);
    const pessoa = pessoas.find((p) => p.id === form.moradorPersonId);
    const emp = carteira.developments.find((d) => d.id === form.developmentId);
    if (!nucleo) {
      notify("Selecione o bairro/núcleo");
      return;
    }
    if (!pessoa) {
      notify("Selecione o morador");
      return;
    }
    const base: Processo = {
      id: editingId ?? `proc-${Math.random().toString(36).slice(2, 8)}`,
      protocolo: form.protocolo.trim() || `MLF-${Date.now()}`,
      nucleoId: nucleo.id,
      nucleoNome: nucleo.nome,
      nucleoSlug: nucleo.slug,
      cidade: nucleo.cidade,
      developmentId: emp?.id,
      empNome: emp?.nome,
      moradorPersonId: pessoa.id,
      moradorNome: pessoa.nome,
      fase: form.fase,
      status: form.status,
      atualizadoEm: new Date().toISOString().slice(0, 10),
      docsPendentes: editingId
        ? (rows.find((r) => r.id === editingId)?.docsPendentes ?? 0)
        : 0,
    };
    setRows((list) =>
      editingId
        ? list.map((p) => (p.id === editingId ? base : p))
        : [base, ...list]
    );
    notify(
      editingId ? "Processo atualizado" : "Processo REURB criado",
      `${base.protocolo} · ${base.nucleoNome} · ${base.moradorNome}`
    );
    setOpen(false);
    setEditingId(null);
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Processos REURB"
        description="Cada processo = bairro/núcleo + morador (+ empreendimento). Kanban | Lista por fase."
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href="/protocolo">Consultar protocolo</Link>
            </Button>
            <Button size="sm" onClick={openCreate}>
              Novo processo
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Processos", value: rows.length },
          {
            label: "Com docs pendentes",
            value: rows.filter((p) => p.docsPendentes > 0).length,
          },
          {
            label: "Núcleos",
            value: new Set(rows.map((p) => p.nucleoNome)).size,
          },
          { label: "Filtrados", value: filtered.length },
        ]}
      />
      <FilterBar
        value={q}
        onChange={setQ}
        placeholder="Buscar protocolo, núcleo, morador…"
        suggestions={suggestions}
      >
        <GeoEmpFilters
          developments={carteira.developments}
          value={geo}
          onChange={setGeo}
        />
      </FilterBar>
      <ProcessBoard
        storageKey="processos-reurb"
        columns={STATUS_COLS}
        rows={filtered}
        toCard={toCard}
        onOpen={(id) => setSelected(rows.find((p) => p.id === id) ?? null)}
        onMove={(id, to) => {
          setRows((list) =>
            list.map((p) =>
              p.id === id
                ? {
                    ...p,
                    status: to as StatusProcesso,
                    atualizadoEm: new Date().toISOString().slice(0, 10),
                  }
                : p
            )
          );
          return true;
        }}
        exportName="processos-reurb"
        listColumns={[
          {
            key: "protocolo",
            label: "Protocolo",
            filter: { type: "text" },
            getValue: (p) => p.protocolo,
          },
          {
            key: "nucleo",
            label: "Núcleo/bairro",
            filter: { type: "text" },
            getValue: (p) => p.nucleoNome,
          },
          {
            key: "emp",
            label: "Empreendimento",
            filter: { type: "text" },
            getValue: (p) => p.empNome ?? "—",
          },
          {
            key: "morador",
            label: "Morador",
            filter: { type: "text" },
            getValue: (p) => p.moradorNome,
          },
          {
            key: "fase",
            label: "Fase",
            filter: { type: "text" },
            getValue: (p) => faseLabel[p.fase],
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
              <StatusPill tone="info">
                {statusProcessoLabel[p.status]}
              </StatusPill>
            ),
          },
          {
            key: "docs",
            label: "Docs",
            filter: { type: "range" },
            getValue: (p) => p.docsPendentes,
            render: (p) =>
              p.docsPendentes > 0 ? (
                <span className="text-brand-accent-strong">
                  {p.docsPendentes} pendente(s)
                </span>
              ) : (
                <span className="text-emerald-700">Em dia</span>
              ),
          },
        ]}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.protocolo ?? ""}
        footer={
          selected ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  openEdit(selected);
                  setSelected(null);
                }}
              >
                Editar
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/documentos">Documentos do morador</Link>
              </Button>
            </>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Núcleo/bairro" value={selected.nucleoNome} />
            <DetailRow
              label="Empreendimento"
              value={selected.empNome ?? "—"}
            />
            <DetailRow label="Morador" value={selected.moradorNome} />
            <DetailRow label="Cidade" value={selected.cidade} />
            <DetailRow label="Fase" value={faseLabel[selected.fase]} />
            <DetailRow
              label="Status"
              value={statusProcessoLabel[selected.status]}
            />
            <DetailRow
              label="Docs pendentes"
              value={String(selected.docsPendentes)}
            />
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingId ? "Editar processo REURB" : "Novo processo REURB"}
        onSubmit={saveProcesso}
      >
        <Field label="Protocolo">
          <Input
            value={form.protocolo}
            onChange={(e) => setForm({ ...form, protocolo: e.target.value })}
          />
        </Field>
        <Field label="Bairro / núcleo *">
          <SearchSelect
            value={form.nucleoId}
            onChange={(nucleoId) =>
              setForm({ ...form, nucleoId, developmentId: "" })
            }
            placeholder="Buscar núcleo…"
            options={nucleos.map((n) => ({
              value: n.id,
              label: n.nome,
              meta: n.cidade,
            }))}
          />
        </Field>
        <Field label="Empreendimento">
          <SearchSelect
            value={form.developmentId}
            onChange={(developmentId) => setForm({ ...form, developmentId })}
            placeholder="Opcional — vincular empreendimento"
            options={[
              { value: "", label: "Sem empreendimento" },
              ...empsDoNucleo.map((d) => ({
                value: d.id,
                label: d.nome,
                meta: d.cidade,
              })),
            ]}
          />
        </Field>
        <Field label="Morador *">
          <SearchSelect
            value={form.moradorPersonId}
            onChange={(moradorPersonId) =>
              setForm({ ...form, moradorPersonId })
            }
            placeholder="Buscar pessoa…"
            options={pessoas.map((p) => ({
              value: p.id,
              label: p.nome,
              meta: p.documento,
            }))}
          />
        </Field>
        <Field label="Fase">
          <select
            className={fieldControlClass}
            value={form.fase}
            onChange={(e) =>
              setForm({ ...form, fase: e.target.value as FaseProcesso })
            }
          >
            {(Object.keys(faseLabel) as FaseProcesso[]).map((f) => (
              <option key={f} value={f}>
                {faseLabel[f]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className={fieldControlClass}
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as StatusProcesso })
            }
          >
            {STATUS_COLS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </FormDialog>
    </div>
  );
}
