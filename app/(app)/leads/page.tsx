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
import { useFluxo } from "@/lib/store/fluxo-store";
import { useCarteira } from "@/lib/store/carteira-store";
import type { Lead, LeadOrigem } from "@/lib/domain/fluxo-types";
import { statusLabel } from "@/lib/status/labels";
import { JORNADA_COLS } from "@/lib/domain/fluxo-seed";

export default function LeadsPage() {
  const { state, addLead, moveLead } = useFluxo();
  const { state: carteira } = useCarteira();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    empInteresse: "Residencial Horizonte",
    origem: "whatsapp" as LeadOrigem,
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
  });

  const activeLeads = useMemo(
    () =>
      state.leads.filter(
        (l) =>
          l.etapa !== "perdido" &&
          l.etapa !== "cancelado" &&
          l.etapa !== "distrato" &&
          l.etapa !== "retomado" &&
          l.etapa !== "quitado" &&
          l.etapa !== "escritura"
      ),
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
    ["novo_contato", "em_atendimento", "proposta_reserva", "contrato", "carteira_em_dia"].includes(
      c.id
    )
  ).map((c) => ({ id: c.id, label: c.label }));

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Leads"
        description="Qualificação completa, score e Kanban | Lista."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/quadros/jornada">Abrir quadro</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
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
            label: "Score médio",
            value: activeLeads.length
              ? Math.round(
                  activeLeads.reduce((a, l) => a + (l.score ?? 0), 0) /
                    activeLeads.length
                )
              : 0,
          },
        ]}
      />

      <ProcessBoard
        storageKey="leads"
        columns={columns}
        rows={activeLeads}
        toCard={toCard}
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
        onOpenChange={setOpen}
        title="Novo lead"
        onSubmit={() => {
          if (!form.nome || !form.telefone) {
            notify("Nome e telefone obrigatórios");
            return;
          }
          addLead(form);
          notify("Lead criado · score calculado");
          setOpen(false);
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
            onChange={(e) =>
              setForm({ ...form, finalidade: e.target.value })
            }
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
      </FormDialog>
    </div>
  );
}
