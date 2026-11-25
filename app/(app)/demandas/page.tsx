"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import { BoardViews } from "@/components/kanban/BoardViews";
import {
  DetailRow,
  DetailSheet,
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { downloadCsv, rowsToCsv } from "@/lib/domain/export-csv";
import { useParte5 } from "@/lib/store/parte5-store";
import { useCompras } from "@/lib/store/compras-store";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import { relatorioDemandas } from "@/lib/domain/parte5-seed";
import type {
  Demanda,
  DemandaPrioridade,
  DemandaStatus,
} from "@/lib/domain/parte5-types";
import { useCarteira } from "@/lib/store/carteira-store";

const COLS: { id: DemandaStatus; label: string }[] = [
  { id: "aberta", label: "Aberta" },
  { id: "em_analise", label: "Em análise" },
  { id: "agendada", label: "Agendada" },
  { id: "em_execucao", label: "Em execução" },
  { id: "concluida", label: "Concluída" },
  { id: "cancelada", label: "Cancelada" },
];

function DemandasInner() {
  const search = useSearchParams();
  const statusQ = search.get("status") as DemandaStatus | null;
  const {
    state,
    addDemanda,
    moverDemanda,
    vincularSc,
    vincularFaturamento,
    addComentario,
    moverDemandasLote,
  } = useParte5();
  const { addSolicitacao } = useCompras();
  const { addFaturamento, state: fin } = useFinanceiro();
  const { state: cart } = useCarteira();
  const [q, setQ] = useState("");
  const [view, setView] = useState<"lista" | "quadro">(
    statusQ ? "lista" : "quadro"
  );
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Demanda | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");
  const [form, setForm] = useState({
    tipoId: "",
    empreendimentoId: "",
    quadra: "",
    lote: "",
    clienteNome: "",
    descricao: "",
    prioridade: "normal" as DemandaPrioridade,
  });

  const hoje = new Date().toISOString().slice(0, 10);
  const atrasadas = state.demandas.filter(
    (d) =>
      d.prazo < hoje &&
      d.status !== "concluida" &&
      d.status !== "cancelada"
  ).length;

  const rel = useMemo(
    () => relatorioDemandas({ ...state, hoje }),
    [state, hoje]
  );

  const live = selected
    ? state.demandas.find((d) => d.id === selected.id) ?? selected
    : null;

  const filtered = useMemo(() => {
    let list = state.demandas;
    if (statusQ === "aberta") {
      list = list.filter(
        (d) => d.status !== "concluida" && d.status !== "cancelada"
      );
    } else if (statusQ && COLS.some((c) => c.id === statusQ)) {
      list = list.filter((d) => d.status === statusQ);
    }
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((d) =>
      [
        d.numero,
        d.descricao,
        d.clienteNome,
        d.empreendimentoNome,
        d.responsavel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.demandas, q, statusQ]);

  const tipoNome = (id: string) =>
    state.demandaTipos.find((t) => t.id === id)?.nome ?? "—";

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Demandas"
        description="Pedidos operacionais (água, energia, marcação…) — interno e portais."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setView((v) => (v === "lista" ? "quadro" : "lista"))
              }
            >
              {view === "lista" ? "Quadro" : "Lista"}
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/portal/cliente">Portal cliente</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const csv = rowsToCsv(
                  [
                    "Numero",
                    "Tipo",
                    "Empreendimento",
                    "Cliente",
                    "Prioridade",
                    "Responsavel",
                    "Prazo",
                    "Origem",
                    "Status",
                  ],
                  filtered.map((d) => [
                    d.numero,
                    tipoNome(d.tipoId),
                    d.empreendimentoNome,
                    d.clienteNome ?? "",
                    d.prioridade,
                    d.responsavel,
                    d.prazo,
                    d.origem,
                    d.status,
                  ])
                );
                downloadCsv("demandas.csv", csv);
                notify(`Exportados ${filtered.length} registro(s)`);
              }}
            >
              Exportar CSV
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova demanda
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Abertas", value: state.demandas.filter((d) => d.status === "aberta").length },
          { label: "Em execução", value: state.demandas.filter((d) => d.status === "em_execucao").length },
          { label: "Atrasadas", value: atrasadas },
          { label: "Tipos", value: state.demandaTipos.length },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar demanda…" />

      {view === "quadro" ? (
        <BoardViews
          storageKey="demandas"
          columns={COLS}
          cards={filtered.map((d) => ({
            id: d.id,
            columnId: d.status,
            title: d.numero,
            subtitle: `${tipoNome(d.tipoId)} · ${d.descricao}`,
            meta: `${d.empreendimentoNome}${d.quadra ? ` ${d.quadra}-${d.lote}` : ""}`,
            badge:
              d.prazo < hoje &&
              d.status !== "concluida" &&
              d.status !== "cancelada"
                ? "atrasada"
                : d.prioridade === "urgente" || d.prioridade === "alta"
                  ? d.prioridade
                  : undefined,
          }))}
          onMove={(cardId, to) => {
            moverDemanda(cardId, to as DemandaStatus);
            notify(`Status → ${to.replace(/_/g, " ")}`);
            return true;
          }}
        />
      ) : (
        <ModuleSection title="Lista">
          {checked.length > 0 ? (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 p-2 text-sm">
              <span>{checked.length} selecionada(s)</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const n = moverDemandasLote(checked, "em_analise");
                  notify(`${n} demanda(s) → em análise`);
                  setChecked([]);
                }}
              >
                Mover p/ Em análise
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const n = moverDemandasLote(checked, "concluida");
                  notify(`${n} demanda(s) concluída(s)`);
                  setChecked([]);
                }}
              >
                Concluir
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setChecked([])}
              >
                Limpar
              </Button>
            </div>
          ) : null}
          <PaginatedTable
            columns={[
              { key: "sel", label: "" },
              { key: "num", label: "Nº" },
              { key: "tipo", label: "Tipo" },
              { key: "emp", label: "Empreendimento" },
              { key: "cli", label: "Cliente" },
              { key: "prio", label: "Prioridade" },
              { key: "resp", label: "Responsável" },
              { key: "prazo", label: "Prazo" },
              { key: "origem", label: "Origem" },
              { key: "status", label: "Status" },
            ]}
            rows={filtered.map((d) => ({
              sel: (
                <input
                  type="checkbox"
                  checked={checked.includes(d.id)}
                  onChange={(e) => {
                    setChecked((prev) =>
                      e.target.checked
                        ? [...prev, d.id]
                        : prev.filter((id) => id !== d.id)
                    );
                  }}
                  aria-label={`Selecionar ${d.numero}`}
                />
              ),
              num: (
                <button
                  type="button"
                  className="font-medium hover:text-brand-orange"
                  onClick={() => setSelected(d)}
                >
                  {d.numero}
                </button>
              ),
              tipo: tipoNome(d.tipoId),
              emp: `${d.empreendimentoNome}${d.quadra ? ` · ${d.quadra}-${d.lote}` : ""}`,
              cli: d.clienteNome ?? "—",
              prio: d.prioridade,
              resp: d.responsavel,
              prazo: formatDateBR(d.prazo),
              origem: d.origem.replace(/_/g, " "),
              status: (
                <StatusPill tone="info">
                  {d.status.replace(/_/g, " ")}
                </StatusPill>
              ),
            }))}
          />
        </ModuleSection>
      )}

      <ModuleSection title="Relatório">
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <div className="text-muted-foreground">Por tipo</div>
            <ul>
              {rel.porTipo
                .filter((t) => t.qtd > 0)
                .map((t) => (
                  <li key={t.tipo}>
                    {t.tipo}: {t.qtd}
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <div className="text-muted-foreground">Tempo médio (concluídas)</div>
            <div className="font-display text-xl">{rel.tempoMedioDias} dias</div>
          </div>
          <div>
            <div className="text-muted-foreground">
              Atrasadas ({rel.atrasadas})
            </div>
            <ul>
              {rel.atrasadasPorResponsavel.map((r) => (
                <li key={r.responsavel}>
                  {r.responsavel}: {r.qtd}
                </li>
              ))}
              {!rel.atrasadasPorResponsavel.length ? (
                <li className="text-muted-foreground">Nenhuma</li>
              ) : null}
            </ul>
          </div>
        </div>
      </ModuleSection>

      <DetailSheet
        open={!!live}
        onOpenChange={(o) => !o && setSelected(null)}
        title={live?.numero ?? ""}
      >
        {live ? (
          <div className="space-y-3">
            <DetailRow label="Tipo" value={tipoNome(live.tipoId)} />
            <DetailRow label="Descrição" value={live.descricao} />
            <DetailRow
              label="Empreendimento"
              value={`${live.empreendimentoNome}${live.quadra ? ` · ${live.quadra}-${live.lote}` : ""}`}
            />
            <DetailRow label="Cliente" value={live.clienteNome ?? "—"} />
            <DetailRow
              label="Custo previsto"
              value={
                live.custoPrevisto != null
                  ? formatBRL(live.custoPrevisto)
                  : "—"
              }
            />
            <DetailRow
              label="SC"
              value={live.purchaseRequestId ?? "—"}
            />
            <DetailRow
              label="Faturamento"
              value={live.faturamentoId ?? "—"}
            />
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Comentários
              </div>
              <ul className="mb-2 space-y-1 text-sm">
                {(live.comentarios ?? []).map((c) => (
                  <li key={c.id} className="border-b py-1">
                    <span className="font-medium">{c.autor}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {formatDateBR(c.criadoEm)}
                    </span>
                    <div>{c.texto}</div>
                  </li>
                ))}
                {!(live.comentarios ?? []).length ? (
                  <li className="text-muted-foreground">Nenhum comentário</li>
                ) : null}
              </ul>
              <div className="flex gap-2">
                <Input
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Novo comentário"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (!addComentario(live.id, "Atendimento", comentario)) {
                      notify("Informe o texto");
                      return;
                    }
                    notify("Comentário registrado");
                    setComentario("");
                  }}
                >
                  Enviar
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {!live.purchaseRequestId ? (
                <Button
                  size="sm"
                  onClick={() => {
                    const sc = addSolicitacao({
                      descricao: `Demanda ${live.numero} · ${live.descricao}`,
                      centro: {
                        tipo: "obra",
                        obraId: "obr-1",
                        label: live.empreendimentoNome,
                      },
                      necessidade: live.prazo,
                      urgente:
                        live.prioridade === "alta" ||
                        live.prioridade === "urgente",
                      solicitante: live.responsavel,
                      itens: [
                        {
                          descricao: live.descricao,
                          unidade: "un",
                          quantidade: 1,
                        },
                      ],
                    });
                    if (!sc) {
                      notify("Falha ao criar SC (centro obrigatório)");
                      return;
                    }
                    vincularSc(live.id, sc.id);
                    notify(`SC ${sc.numero} gerada e vinculada`);
                  }}
                >
                  Gerar SC
                </Button>
              ) : (
                <Button size="sm" variant="outline" asChild>
                  <Link href="/compras">Ver compras</Link>
                </Button>
              )}
              {!live.faturamentoId && (live.custoPrevisto ?? 0) > 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const r = addFaturamento({
                      descricao: `Cobrança demanda ${live.numero}`,
                      cliente: live.clienteNome ?? "Cliente demanda",
                      naturezaId: fin.naturezas[0]?.id ?? "nat-1",
                      competencia: `${hoje.slice(0, 7)}-01`,
                      vencimento: live.prazo,
                      centro: {
                        tipo: "obra",
                        obraId: "obr-1",
                        label: live.empreendimentoNome,
                      },
                      contaId: fin.contas[0]?.id ?? "cta-1",
                      valorBruto: live.custoPrevisto!,
                      forma: "boleto",
                    });
                    if (!r.ok || !r.faturamento) {
                      notify("Falha ao faturar");
                      return;
                    }
                    vincularFaturamento(live.id, r.faturamento.id);
                    notify(`Faturamento ${r.faturamento.id} gerado`);
                  }}
                >
                  Gerar cobrança
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova demanda"
        onSubmit={() => {
          const tipoId = form.tipoId || state.demandaTipos[0]?.id;
          const dev =
            cart.developments.find((d) => d.id === form.empreendimentoId) ??
            cart.developments[0];
          if (!tipoId || !dev || !form.descricao.trim()) {
            notify("Tipo, empreendimento e descrição obrigatórios");
            return;
          }
          const dem = addDemanda({
            tipoId,
            empreendimentoId: dev.id,
            empreendimentoNome: dev.nome,
            quadra: form.quadra || undefined,
            lote: form.lote || undefined,
            clienteNome: form.clienteNome || undefined,
            descricao: form.descricao,
            prioridade: form.prioridade,
            origem: "interno",
          });
          if (!dem) {
            notify("Falha ao criar");
            return;
          }
          notify(`${dem.numero} criada`);
          setOpen(false);
        }}
      >
        <Field label="Tipo *">
          <select
            className={fieldControlClass}
            value={form.tipoId || state.demandaTipos[0]?.id}
            onChange={(e) => setForm({ ...form, tipoId: e.target.value })}
          >
            {state.demandaTipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Empreendimento *">
          <select
            className={fieldControlClass}
            value={form.empreendimentoId || cart.developments[0]?.id}
            onChange={(e) =>
              setForm({ ...form, empreendimentoId: e.target.value })
            }
          >
            {cart.developments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Quadra">
            <Input
              value={form.quadra}
              onChange={(e) => setForm({ ...form, quadra: e.target.value })}
            />
          </Field>
          <Field label="Lote">
            <Input
              value={form.lote}
              onChange={(e) => setForm({ ...form, lote: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Cliente">
          <Input
            value={form.clienteNome}
            onChange={(e) =>
              setForm({ ...form, clienteNome: e.target.value })
            }
          />
        </Field>
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        <Field label="Prioridade">
          <select
            className={fieldControlClass}
            value={form.prioridade}
            onChange={(e) =>
              setForm({
                ...form,
                prioridade: e.target.value as DemandaPrioridade,
              })
            }
          >
            <option value="baixa">Baixa</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </Field>
      </FormDialog>
    </div>
  );
}

export default function DemandasPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}
    >
      <DemandasInner />
    </Suspense>
  );
}
