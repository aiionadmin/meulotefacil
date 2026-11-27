"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import {
  buildRdoText,
  downloadRdoPdfProxy,
} from "@/lib/export/rdo-report";
import { downloadTextTemplate } from "@/lib/export/list-export";
import { canApprove } from "@/lib/alcadas/check";
import { formatDateBR } from "@/lib/masks/br";
import { useObras } from "@/lib/store/obras-store";
import { useFase1 } from "@/lib/store/fase1-store";
import type { Rdo, RdoStatus } from "@/lib/domain/obras-types";
import { useNovoParam } from "@/lib/ui/use-novo-param";
import { cn } from "@/lib/utils";
import { SearchSelect } from "@/components/app/SearchSelect";
import { peopleOptions } from "@/lib/ui/people-options";
import { filterObrasVisiveis } from "@/lib/obras/visibilidade";

/** Calendário do mês corrente — destaca dias úteis sem RDO (D21). */
function ModuleSectionCalendario({
  obraId,
  rdos,
}: {
  obraId?: string;
  rdos: Rdo[];
}) {
  if (!obraId) return null;
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const withRdo = new Set(
    rdos.filter((r) => r.obraId === obraId).map((r) => r.data)
  );
  const cells: { iso: string; label: number; missing: boolean }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const wd = new Date(`${iso}T12:00:00`).getDay();
    const util = wd !== 0 && wd !== 6;
    cells.push({
      iso,
      label: d,
      missing: util && !withRdo.has(iso),
    });
  }
  return (
    <ModuleSection title="Calendário (dias úteis sem RDO)">
      <div className="grid grid-cols-7 gap-1 text-center text-xs sm:max-w-md">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((h) => (
          <span key={h} className="text-muted-foreground">
            {h}
          </span>
        ))}
        {Array.from({
          length: new Date(`${cells[0]?.iso}T12:00:00`).getDay(),
        }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {cells.map((c) => (
          <span
            key={c.iso}
            className={cn(
              "rounded-sm border px-1 py-1.5",
              c.missing
                ? "border-amber-500/50 bg-amber-50 text-amber-900"
                : withRdo.has(c.iso)
                  ? "border-emerald-500/40 bg-emerald-50"
                  : "border-border text-muted-foreground"
            )}
            title={
              c.missing
                ? "Dia útil sem RDO"
                : withRdo.has(c.iso)
                  ? "RDO registrado"
                  : ""
            }
          >
            {c.label}
          </span>
        ))}
      </div>
    </ModuleSection>
  );
}

function RdoInner() {
  const search = useSearchParams();
  const obraQ = search.get("obra") ?? "";
  const { state, addRdo, copyRdoFromPrevious, updateRdoStatus, nodesDaObra } =
    useObras();
  const { currentUser, state: f1 } = useFase1();
  const perfilNome =
    f1.profiles.find((p) => p.id === currentUser?.profileId)?.nome ?? "—";
  const obrasRdo = useMemo(() => {
    return filterObrasVisiveis(state.obras, currentUser, perfilNome).filter(
      (o) => !o.finalidade || o.finalidade === "rdo" || o.finalidade === "ambos"
    );
  }, [state.obras, currentUser, perfilNome]);
  const obraOpts = useMemo(
    () =>
      obrasRdo.map((o) => ({
        value: o.id,
        label: `${o.codigo} · ${o.nome}`,
      })),
    [obrasRdo]
  );
  const responsavelOpts = useMemo(() => {
    const fromPeople = peopleOptions(f1.people, "profissional");
    const fromUsers = f1.users
      .filter((u) => u.status === "ativo")
      .map((u) => ({ value: u.nome, label: u.nome, meta: "usuário" }));
    const seen = new Set<string>();
    return [...fromPeople, ...fromUsers].filter((o) => {
      if (seen.has(o.value)) return false;
      seen.add(o.value);
      return true;
    });
  }, [f1.people, f1.users]);
  const [q, setQ] = useState("");
  const [obraFilter, setObraFilter] = useState(obraQ || "todos");
  const [open, setOpen] = useNovoParam();
  const [form, setForm] = useState({
    obraId: obraQ || obrasRdo[0]?.id || "",
    data: new Date().toISOString().slice(0, 10),
    responsavel: "",
    nodeId: "",
    fisicoAcumulado: 50,
  });

  const STATUS_COLS = [
    { id: "rascunho", label: "Rascunho" },
    { id: "enviado", label: "Enviado" },
    { id: "aprovado", label: "Aprovado" },
    { id: "devolvido", label: "Devolvido" },
  ];

  const filtered = useMemo(() => {
    let list = state.rdos;
    if (obraFilter !== "todos") {
      list = list.filter((r) => r.obraId === obraFilter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((r) => {
        const obra = state.obras.find((o) => o.id === r.obraId);
        return [String(r.numero), r.data, r.responsavel, obra?.nome, r.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      });
    }
    return list;
  }, [state.rdos, state.obras, q, obraFilter]);

  const toCard = useCallback(
    (r: Rdo) => {
      const obra = state.obras.find((o) => o.id === r.obraId);
      return {
        id: r.id,
        columnId: r.status,
        title: `RDO ${r.numero}`,
        subtitle: obra?.nome ?? r.obraId,
        badge: formatDateBR(r.data),
        meta: r.responsavel,
      };
    },
    [state.obras]
  );

  const itensObra = nodesDaObra(form.obraId).filter((n) => n.kind === "item");

  function exportRdo(r: Rdo) {
    const obra = state.obras.find((o) => o.id === r.obraId);
    const nome = obra?.nome ?? r.obraId;
    downloadTextTemplate(
      `rdo-${r.numero}-${r.data}.txt`,
      buildRdoText(r, nome)
    );
    downloadRdoPdfProxy(r, nome);
    notify("RDO exportado", `nº ${r.numero} · TXT + PDF (impressão)`);
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="RDO — Relatório diário de obras"
        description="Kanban | Lista (C20) · PDF/TXT (D21). Aprovar atualiza a evolução física."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/obras">Obras</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const obraId =
                  obraFilter !== "todos"
                    ? obraFilter
                    : state.obras[0]?.id;
                if (!obraId) return;
                const data = new Date().toISOString().slice(0, 10);
                const r = copyRdoFromPrevious(obraId, data);
                if (!r) {
                  notify(
                    "Não copiado",
                    "Sem RDO anterior ou já existe RDO nesta data"
                  );
                  return;
                }
                notify("RDO copiado do dia anterior", `nº ${r.numero}`);
              }}
            >
              Copiar do dia anterior
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Novo RDO
            </Button>
          </>
        }
      />

      <ModuleSectionCalendario
        obraId={obraFilter !== "todos" ? obraFilter : state.obras[0]?.id}
        rdos={state.rdos}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar número, obra, responsável…">
        <select
          className={fieldControlClass + " max-w-[220px]"}
          value={obraFilter}
          onChange={(e) => setObraFilter(e.target.value)}
        >
          <option value="todos">Todas obras (RDO)</option>
          {obrasRdo.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
      </FilterBar>

      <ProcessBoard
        storageKey="rdo"
        columns={STATUS_COLS}
        rows={filtered}
        toCard={toCard}
        onMove={(id, to) => {
          const r = state.rdos.find((x) => x.id === id);
          if (!r) return false;
          const next = to as RdoStatus;
          if (r.status === "rascunho" && next === "enviado") {
            updateRdoStatus(id, "enviado");
            notify("RDO enviado");
            return true;
          }
          if (r.status === "enviado" && next === "aprovado") {
            const gate = canApprove({
              rules: f1.approvalRules,
              tipo: "RDO",
              perfilNome,
            });
            if (!gate.ok) {
              notify("Alçada insuficiente", gate.reason);
              return false;
            }
            updateRdoStatus(id, "aprovado");
            notify("RDO aprovado · físico atualizado");
            return true;
          }
          if (r.status === "enviado" && next === "devolvido") {
            const motivo = window.prompt("Motivo da devolução *");
            if (!motivo?.trim()) {
              notify("Motivo obrigatório");
              return false;
            }
            updateRdoStatus(id, "devolvido", motivo.trim());
            notify("RDO devolvido");
            return true;
          }
          notify("Transição não permitida");
          return false;
        }}
        exportName="rdos"
        listColumns={[
          {
            key: "n",
            label: "Nº",
            filter: { type: "text" },
            getValue: (r) => String(r.numero),
          },
          {
            key: "data",
            label: "Data",
            filter: { type: "period" },
            getValue: (r) => r.data,
            render: (r) => formatDateBR(r.data),
          },
          {
            key: "obra",
            label: "Obra",
            filter: { type: "text" },
            getValue: (r) =>
              state.obras.find((o) => o.id === r.obraId)?.nome ?? "",
          },
          {
            key: "resp",
            label: "Responsável",
            filter: { type: "text" },
            getValue: (r) => r.responsavel,
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
            getValue: (r) => r.status,
            render: (r) => (
              <StatusPill
                tone={
                  r.status === "aprovado"
                    ? "ok"
                    : r.status === "devolvido"
                      ? "danger"
                      : "warn"
                }
              >
                {r.status}
              </StatusPill>
            ),
          },
          {
            key: "pdf",
            label: "PDF",
            getValue: () => "",
            render: (r) => (
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportRdo(r)}
              >
                PDF/TXT
              </Button>
            ),
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo RDO"
        onSubmit={() => {
          if (!form.obraId || !form.data || !form.responsavel) {
            notify("Obra, data e responsável obrigatórios");
            return;
          }
          const created = addRdo({
            obraId: form.obraId,
            data: form.data,
            responsavel: form.responsavel,
            atividades: form.nodeId
              ? [
                  {
                    nodeId: form.nodeId,
                    descricao: "Execução do dia",
                    situacao: "em_andamento",
                    quantidade: 1,
                    fisicoAcumulado: form.fisicoAcumulado,
                  },
                ]
              : [],
          });
          if (!created) {
            notify("Já existe RDO nesta data para a obra");
            return;
          }
          notify(`RDO nº ${created.numero} criado`);
          setOpen(false);
        }}
      >
        <Field label="Obra *">
          <SearchSelect
            value={form.obraId}
            onChange={(obraId) => setForm({ ...form, obraId, nodeId: "" })}
            options={obraOpts}
            placeholder="Selecionar obra de RDO…"
          />
          {obraOpts.length === 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Nenhuma obra de RDO.{" "}
              <Link className="underline" href="/obras?novo=1">
                Cadastrar obra
              </Link>{" "}
              com finalidade RDO ou Ambos.
            </p>
          ) : null}
        </Field>
        <Field label="Data *">
          <Input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
          />
        </Field>
        <Field label="Responsável *">
          <SearchSelect
            value={form.responsavel}
            onChange={(responsavel) => setForm({ ...form, responsavel })}
            options={responsavelOpts}
            placeholder="Selecionar responsável cadastrado…"
          />
        </Field>
        <Field label="Atividade (item do orçamento)">
          <select
            className={fieldControlClass}
            value={form.nodeId}
            onChange={(e) => setForm({ ...form, nodeId: e.target.value })}
          >
            <option value="">Opcional</option>
            {itensObra.map((n) => (
              <option key={n.id} value={n.id}>
                {n.codigo} · {n.descricao}
              </option>
            ))}
          </select>
        </Field>
        <Field label="% físico acumulado">
          <Input
            type="number"
            value={form.fisicoAcumulado}
            onChange={(e) =>
              setForm({
                ...form,
                fisicoAcumulado: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}

export default function RdoPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
      <RdoInner />
    </Suspense>
  );
}
