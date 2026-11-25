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
import { useFluxo } from "@/lib/store/fluxo-store";
import { useCarteira } from "@/lib/store/carteira-store";
import type {
  LeadFinalidade,
  LeadOrigem,
  LeadTipoInteresse,
} from "@/lib/domain/fluxo-types";

export default function LeadsPage() {
  const { state, addLead, moveLead } = useFluxo();
  const { state: carteira } = useCarteira();
  const [q, setQ] = useState("");
  const [tempFilter, setTempFilter] = useState("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    empInteresse: carteira.developments[0]?.nome ?? "",
    origem: "whatsapp" as LeadOrigem,
    campanha: "",
    tipoInteresse: "comprar_lote" as LeadTipoInteresse,
    finalidade: "morar" as LeadFinalidade,
    faixaValorMin: 150000,
    faixaValorMax: 250000,
    entradaDisponivel: 20000,
    parcelaCabivel: 1500,
    formaPagamento: "parcelado",
    prazoDecidir: "30 dias",
    cidade: "",
    bairro: "",
    visitou: false,
    melhorHorario: "",
    canalPreferido: "whatsapp",
    objecoes: "",
    observacoes: "",
  });

  const filtered = useMemo(() => {
    let list = state.leads;
    if (tempFilter !== "todos") {
      list = list.filter((l) => l.temperatura === tempFilter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((l) =>
        [
          l.nome,
          l.telefone,
          l.origem,
          l.etapa,
          l.empInteresse,
          l.campanha,
          l.cidade,
          l.temperatura,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [state.leads, q, tempFilter]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Leads"
        description="Qualificação completa, score e temperatura. CPF/renda ficam na proposta."
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
          { label: "Leads", value: state.leads.length },
          {
            label: "Quentes",
            value: state.leads.filter((l) => l.temperatura === "quente").length,
          },
          {
            label: "Mornos",
            value: state.leads.filter((l) => l.temperatura === "morno").length,
          },
          {
            label: "Frios",
            value: state.leads.filter((l) => l.temperatura === "frio").length,
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar nome, telefone, campanha…">
        <select
          className={fieldControlClass + " max-w-[160px]"}
          value={tempFilter}
          onChange={(e) => setTempFilter(e.target.value)}
        >
          <option value="todos">Todas temperaturas</option>
          <option value="quente">Quente</option>
          <option value="morno">Morno</option>
          <option value="frio">Frio</option>
        </select>
        <Button size="sm" variant="ghost" onClick={() => { setQ(""); setTempFilter("todos"); }}>
          Limpar filtros
        </Button>
      </FilterBar>

      <PaginatedTable
        columns={[
          { key: "nome", label: "Nome" },
          { key: "tel", label: "Telefone" },
          { key: "emp", label: "Interesse" },
          { key: "score", label: "Score" },
          { key: "origem", label: "Origem" },
          { key: "etapa", label: "Etapa" },
          { key: "acao", label: "" },
        ]}
        rows={filtered.map((l) => ({
          nome: l.nome,
          tel: l.telefone,
          emp: l.empInteresse ?? "—",
          score: (
            <StatusPill
              tone={
                l.temperatura === "quente"
                  ? "ok"
                  : l.temperatura === "morno"
                    ? "warn"
                    : "neutral"
              }
            >
              {l.score ?? 0} · {l.temperatura ?? "—"}
            </StatusPill>
          ),
          origem: l.origem,
          etapa: (
            <StatusPill tone="info">{l.etapa.replace(/_/g, " ")}</StatusPill>
          ),
          acao:
            l.etapa === "novo_contato" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  moveLead(l.id, "em_atendimento");
                  notify("Lead em atendimento");
                }}
              >
                Atender
              </Button>
            ) : (
              "—"
            ),
        }))}
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
        <Field label="Empreendimento de interesse">
          <select
            className={fieldControlClass}
            value={form.empInteresse}
            onChange={(e) =>
              setForm({ ...form, empInteresse: e.target.value })
            }
          >
            {carteira.developments.map((d) => (
              <option key={d.id} value={d.nome}>
                {d.nome} ({d.modalidade})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tipo de interesse">
          <select
            className={fieldControlClass}
            value={form.tipoInteresse}
            onChange={(e) =>
              setForm({
                ...form,
                tipoInteresse: e.target.value as LeadTipoInteresse,
              })
            }
          >
            <option value="comprar_lote">Comprar lote</option>
            <option value="regularizar">Regularizar imóvel</option>
            <option value="ambos">Ambos</option>
          </select>
        </Field>
        <Field label="Finalidade">
          <select
            className={fieldControlClass}
            value={form.finalidade}
            onChange={(e) =>
              setForm({
                ...form,
                finalidade: e.target.value as LeadFinalidade,
              })
            }
          >
            <option value="morar">Morar</option>
            <option value="investir">Investir</option>
            <option value="construir_vender">Construir para vender</option>
          </select>
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Faixa mín.">
            <Input
              type="number"
              value={form.faixaValorMin}
              onChange={(e) =>
                setForm({
                  ...form,
                  faixaValorMin: Number(e.target.value) || 0,
                })
              }
            />
          </Field>
          <Field label="Faixa máx.">
            <Input
              type="number"
              value={form.faixaValorMax}
              onChange={(e) =>
                setForm({
                  ...form,
                  faixaValorMax: Number(e.target.value) || 0,
                })
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
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
          <Field label="Parcela cabível">
            <Input
              type="number"
              value={form.parcelaCabivel}
              onChange={(e) =>
                setForm({
                  ...form,
                  parcelaCabivel: Number(e.target.value) || 0,
                })
              }
            />
          </Field>
        </div>
        <Field label="Cidade / bairro">
          <div className="grid grid-cols-2 gap-2">
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.visitou}
            onChange={(e) => setForm({ ...form, visitou: e.target.checked })}
          />
          Já visitou o empreendimento
        </label>
      </FormDialog>
    </div>
  );
}
