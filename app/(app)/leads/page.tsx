"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { SearchSelect } from "@/components/app/SearchSelect";
import { useServerPage } from "@/lib/ui/use-server-page";
import { useFluxo } from "@/lib/store/fluxo-store";
import { useCarteira } from "@/lib/store/carteira-store";
import type { Lead, LeadOrigem } from "@/lib/domain/fluxo-types";
import { statusLabel } from "@/lib/status/labels";
import { JORNADA_COLS } from "@/lib/domain/fluxo-seed";
import { useNovoParam } from "@/lib/ui/use-novo-param";
import {
  EMPTY_GEO_EMP,
  GeoEmpFilters,
  developmentIdsMatching,
  type GeoEmpFilterValues,
} from "@/components/app/GeoEmpFilters";
import { FilterBar } from "@/components/app/ModuleToolkit";

type LeadForm = {
  nome: string;
  telefone: string;
  email: string;
  empInteresse: string;
  origem: LeadOrigem;
  campanha: string;
  corretor: string;
  tipoInteresse: string;
  finalidade: string;
  faixaValor: string;
  entradaDisponivel: number;
  parcelaCabe: number;
  formaPagamento: string;
  prazoDecidir: string;
  cidade: string;
  bairro: string;
  visitou: boolean;
  dataVisita: string;
  melhorHorario: string;
  canalPreferido: string;
  objecoes: string;
  observacoes: string;
};

const EMPTY_FORM: LeadForm = {
  nome: "",
  telefone: "",
  email: "",
  empInteresse: "Residencial Horizonte",
  origem: "whatsapp",
  campanha: "",
  corretor: "",
  tipoInteresse: "lote",
  finalidade: "moradia",
  faixaValor: "",
  entradaDisponivel: 0,
  parcelaCabe: 0,
  formaPagamento: "parcelado",
  prazoDecidir: "",
  cidade: "",
  bairro: "",
  visitou: false,
  dataVisita: "",
  melhorHorario: "",
  canalPreferido: "whatsapp",
  objecoes: "",
  observacoes: "",
};

function leadToForm(l: Lead): LeadForm {
  return {
    nome: l.nome,
    telefone: l.telefone,
    email: l.email ?? "",
    empInteresse: l.empInteresse ?? "",
    origem: l.origem,
    campanha: l.campanha ?? "",
    corretor: l.corretor ?? "",
    tipoInteresse: l.tipoInteresse ?? "lote",
    finalidade: l.finalidade ?? "moradia",
    faixaValor: l.faixaValor ?? "",
    entradaDisponivel: l.entradaDisponivel ?? 0,
    parcelaCabe: l.parcelaCabe ?? 0,
    formaPagamento: l.formaPagamento ?? "parcelado",
    prazoDecidir: l.prazoDecidir ?? "",
    cidade: l.cidade ?? "",
    bairro: l.bairro ?? "",
    visitou: Boolean(l.visitou),
    dataVisita: l.dataVisita ?? "",
    melhorHorario: l.melhorHorario ?? "",
    canalPreferido: l.canalPreferido ?? "whatsapp",
    objecoes: l.objecoes ?? "",
    observacoes: l.observacoes ?? "",
  };
}

export default function LeadsPage() {
  const { state, addLead, updateLead, removeLead, moveLead } = useFluxo();
  const { state: carteira } = useCarteira();
  const [open, setOpen] = useNovoParam();
  const [geo, setGeo] = useState<GeoEmpFilterValues>(EMPTY_GEO_EMP);
  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM);
  const server = useServerPage({
    url: "/api/list/leads",
    page: 1,
    pageSize: 25,
  });

  const geoIds = useMemo(
    () => developmentIdsMatching(carteira.developments, geo),
    [carteira.developments, geo]
  );

  const empNamesAllowed = useMemo(() => {
    if (!geoIds) return null;
    return new Set(
      carteira.developments
        .filter((d) => geoIds.has(d.id))
        .map((d) => d.nome.toLowerCase())
    );
  }, [carteira.developments, geoIds]);

  const activeLeads = useMemo(
    () =>
      state.leads.filter((l) => {
        if (
          l.etapa === "perdido" ||
          l.etapa === "cancelado" ||
          l.etapa === "distrato" ||
          l.etapa === "retomado" ||
          l.etapa === "quitado" ||
          l.etapa === "escritura"
        ) {
          return false;
        }
        if (empNamesAllowed) {
          const nome = (l.empInteresse || "").toLowerCase();
          if (!nome || !empNamesAllowed.has(nome)) return false;
        }
        if (geo.cidade !== "todas" && l.cidade && l.cidade !== geo.cidade) {
          return false;
        }
        if (geo.bairro !== "todos" && l.bairro && l.bairro !== geo.bairro) {
          return false;
        }
        const term = q.trim().toLowerCase();
        if (!term) return true;
        return [l.nome, l.empInteresse, l.cidade, l.bairro, l.telefone, l.email]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      }),
    [state.leads, empNamesAllowed, geo, q]
  );

  const leadSuggestions = useMemo(
    () =>
      state.leads.flatMap((l) => [
        l.nome,
        l.empInteresse ?? "",
        l.cidade ?? "",
        l.bairro ?? "",
      ]),
    [state.leads]
  );

  const toCard = useCallback(
    (l: Lead) => ({
      id: l.id,
      columnId: l.etapa,
      title: l.nome,
      subtitle: l.empInteresse,
      badge: l.emAtraso
        ? "Em atraso"
        : l.classificacao
          ? `${l.classificacao} · ${l.score ?? 0}`
          : l.origem,
      meta: l.responsavel,
    }),
    []
  );

  const columns = JORNADA_COLS.filter((c) =>
    [
      "novo_contato",
      "em_atendimento",
      "proposta_reserva",
      "contrato",
      "carteira_em_dia",
    ].includes(c.id)
  ).map((c) => ({ id: c.id, label: c.label }));

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(id: string) {
    const lead = state.leads.find((l) => l.id === id);
    if (!lead) {
      notify("Lead não encontrado");
      return;
    }
    setEditingId(id);
    setForm(leadToForm(lead));
    setOpen(true);
  }

  function closeForm(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Leads"
        description="CRUD completo — qualificação, score e Kanban | Lista."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/quadros/jornada">Abrir quadro</Link>
            </Button>
            <Button size="sm" onClick={openCreate}>
              Novo lead
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Leads", value: activeLeads.length },
          {
            label: "Quentes",
            value: activeLeads.filter((l) => l.classificacao === "quente")
              .length,
          },
          {
            label: "Em atendimento",
            value: activeLeads.filter((l) => l.etapa === "em_atendimento")
              .length,
          },
          {
            label: "API B17",
            value: server.loading
              ? "…"
              : server.data
                ? `${server.data.total} · ${Math.round(server.data.elapsedMs ?? 0)}ms`
                : (server.error ?? "—"),
          },
        ]}
      />

      <FilterBar
        value={q}
        onChange={setQ}
        placeholder="Buscar lead, empreendimento, cidade…"
        suggestions={leadSuggestions}
      >
        <GeoEmpFilters
          developments={carteira.developments}
          value={geo}
          onChange={setGeo}
        />
      </FilterBar>

      <p className="text-sm text-muted-foreground">
        Clique no card ou na linha para editar · use Excluir no formulário.
      </p>

      <ProcessBoard
        storageKey="leads"
        columns={columns}
        rows={activeLeads}
        toCard={toCard}
        onOpen={openEdit}
        onMove={(id, to) => {
          const ok = moveLead(id, to as Lead["etapa"]);
          if (!ok) notify("Movimento bloqueado", "Jornada só avança");
          return ok;
        }}
        exportName="leads"
        listColumns={[
          {
            key: "nome",
            label: "Nome",
            filter: { type: "text" },
            getValue: (l) => l.nome,
          },
          {
            key: "tel",
            label: "Telefone",
            filter: { type: "text" },
            getValue: (l) => l.telefone,
          },
          {
            key: "emp",
            label: "Interesse",
            filter: { type: "text" },
            getValue: (l) => l.empInteresse ?? "",
          },
          {
            key: "origem",
            label: "Origem",
            filter: {
              type: "list",
              options: [
                { value: "whatsapp", label: "WhatsApp" },
                { value: "anuncio", label: "Anúncio" },
                { value: "indicacao", label: "Indicação" },
                { value: "site", label: "Site" },
                { value: "manual", label: "Manual" },
              ],
            },
            getValue: (l) => l.origem,
            render: (l) => statusLabel(l.origem),
          },
          {
            key: "score",
            label: "Score",
            filter: { type: "range" },
            getValue: (l) => l.score ?? 0,
          },
          {
            key: "class",
            label: "Classe",
            filter: {
              type: "status",
              options: [
                { value: "frio", label: "Frio" },
                { value: "morno", label: "Morno" },
                { value: "quente", label: "Quente" },
              ],
            },
            getValue: (l) => l.classificacao ?? "",
            render: (l) => (
              <StatusPill
                tone={
                  l.classificacao === "quente"
                    ? "ok"
                    : l.classificacao === "morno"
                      ? "warn"
                      : "neutral"
                }
              >
                {statusLabel(l.classificacao)}
              </StatusPill>
            ),
          },
          {
            key: "etapa",
            label: "Etapa",
            filter: {
              type: "status",
              options: columns.map((c) => ({
                value: c.id,
                label: c.label,
              })),
            },
            getValue: (l) => l.etapa,
            render: (l) => (
              <StatusPill tone="info">{statusLabel(l.etapa)}</StatusPill>
            ),
          },
        ]}
        bulkActions={[
          {
            label: "Atribuir Atendimento",
            onClick: () => notify("Responsável atualizado (auditoria)"),
          },
          {
            label: "Exportar seleção",
            onClick: () => notify("Exportação da seleção"),
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={closeForm}
        title={editingId ? "Editar lead" : "Novo lead"}
        submitLabel={editingId ? "Salvar" : "Cadastrar"}
        onSubmit={() => {
          if (!form.nome.trim() || !form.telefone.trim()) {
            notify("Nome e telefone obrigatórios");
            return;
          }
          const payload = {
            ...form,
            nome: form.nome.trim(),
            telefone: form.telefone.trim(),
            email: form.email.trim() || undefined,
            empInteresse: form.empInteresse.trim() || undefined,
            campanha: form.campanha.trim() || undefined,
            corretor: form.corretor.trim() || undefined,
            faixaValor: form.faixaValor.trim() || undefined,
            prazoDecidir: form.prazoDecidir.trim() || undefined,
            cidade: form.cidade.trim() || undefined,
            bairro: form.bairro.trim() || undefined,
            dataVisita: form.dataVisita.trim() || undefined,
            melhorHorario: form.melhorHorario.trim() || undefined,
            objecoes: form.objecoes.trim() || undefined,
            observacoes: form.observacoes.trim() || undefined,
          };
          if (editingId) {
            const updated = updateLead(editingId, payload);
            if (!updated) {
              notify("Não foi possível salvar", "Lead não encontrado");
              return;
            }
            notify("Lead atualizado", updated.nome);
          } else {
            addLead(payload);
            notify("Lead criado · score calculado");
          }
          closeForm(false);
        }}
      >
        <Field label="Nome *">
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </Field>
        <Field label="Telefone *">
          <Input
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          />
        </Field>
        <Field label="E-mail">
          <Input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Origem">
          <select
            className={fieldControlClass}
            value={form.origem}
            onChange={(e) =>
              setForm({ ...form, origem: e.target.value as LeadOrigem })
            }
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="anuncio">Anúncio</option>
            <option value="indicacao">Indicação</option>
            <option value="site">Site</option>
            <option value="manual">Manual</option>
          </select>
        </Field>
        <Field label="Campanha">
          <Input
            value={form.campanha}
            onChange={(e) => setForm({ ...form, campanha: e.target.value })}
          />
        </Field>
        <Field label="Corretor">
          <Input
            value={form.corretor}
            onChange={(e) => setForm({ ...form, corretor: e.target.value })}
          />
        </Field>
        <Field label="Empreendimento de interesse">
          <SearchSelect
            options={carteira.developments.map((d) => ({
              value: d.nome,
              label: d.nome,
              meta: d.modalidade,
            }))}
            value={form.empInteresse}
            onChange={(v) => setForm({ ...form, empInteresse: v })}
          />
        </Field>
        <Field label="Finalidade">
          <select
            className={fieldControlClass}
            value={form.finalidade}
            onChange={(e) => setForm({ ...form, finalidade: e.target.value })}
          >
            <option value="moradia">Moradia</option>
            <option value="investimento">Investimento</option>
            <option value="outro">Outro</option>
          </select>
        </Field>
        <Field label="Faixa de valor">
          <Input
            value={form.faixaValor}
            onChange={(e) => setForm({ ...form, faixaValor: e.target.value })}
          />
        </Field>
        <Field label="Entrada disponível">
          <Input
            type="number"
            value={form.entradaDisponivel}
            onChange={(e) =>
              setForm({
                ...form,
                entradaDisponivel: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
        <Field label="Parcela que cabe">
          <Input
            type="number"
            value={form.parcelaCabe}
            onChange={(e) =>
              setForm({ ...form, parcelaCabe: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Cidade / Bairro">
          <div className="flex gap-2">
            <Input
              placeholder="Cidade"
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
            />
            <Input
              placeholder="Bairro"
              value={form.bairro}
              onChange={(e) => setForm({ ...form, bairro: e.target.value })}
            />
          </div>
        </Field>
        <Field label="Visitou?">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.visitou}
              onChange={(e) =>
                setForm({ ...form, visitou: e.target.checked })
              }
            />
            Sim
          </label>
        </Field>
        <Field label="Observações / Objeções">
          <Input
            value={form.objecoes}
            onChange={(e) => setForm({ ...form, objecoes: e.target.value })}
          />
        </Field>
        {editingId ? (
          <div className="flex justify-between gap-2 border-t border-linha pt-3">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (
                  !window.confirm(
                    `Excluir o lead "${form.nome}"? Esta ação remove o registro da lista.`
                  )
                ) {
                  return;
                }
                const res = removeLead(editingId);
                if (!res.ok) {
                  notify("Não excluído", res.reason ?? "");
                  return;
                }
                notify("Lead excluído", form.nome);
                closeForm(false);
              }}
            >
              Excluir lead
            </Button>
          </div>
        ) : null}
      </FormDialog>
    </div>
  );
}
