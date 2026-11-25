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
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFluxo } from "@/lib/store/fluxo-store";
import { useCarteira } from "@/lib/store/carteira-store";
import { leadProntoParaProposta } from "@/lib/domain/lead-score";

export default function VendasPage() {
  const { state, addProposal, converterProposal } = useFluxo();
  const { state: carteira, addContract } = useCarteira();
  const [q, setQ] = useState("");
  const [empFilter, setEmpFilter] = useState("todos");
  const [open, setOpen] = useState(false);

  const vendaEmps = carteira.developments.filter(
    (d) => d.modalidade !== "regularizacao"
  );
  const [form, setForm] = useState({
    leadId: state.leads[0]?.id ?? "",
    cliente: "",
    developmentId: vendaEmps[0]?.id ?? "",
    empNome: vendaEmps[0]?.nome ?? "",
    lotId: "",
    loteLabel: "",
    servicoRegularizacao: false,
    valor: 185000,
    parcelas: 120,
    entrada: 20000,
    validade: new Date().toISOString().slice(0, 10),
    responsavel: "Comercial",
  });

  const lotsDisponiveis = useMemo(
    () =>
      carteira.lots.filter(
        (l) =>
          l.developmentId === form.developmentId && l.status === "disponivel"
      ),
    [carteira.lots, form.developmentId]
  );

  const filtered = useMemo(() => {
    let list = state.proposals;
    if (empFilter !== "todos") {
      list = list.filter((p) => p.empNome === empFilter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((p) =>
        [p.cliente, p.empNome, p.loteLabel, p.status]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [state.proposals, q, empFilter]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Propostas e reservas"
        description="Empreendimento obrigatório. Fluxo: Proposta → Contrato."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/contratos">Contratos</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova proposta
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Propostas", value: state.proposals.length },
          {
            label: "Abertas",
            value: state.proposals.filter((p) => p.status === "aberta").length,
          },
          {
            label: "Reservadas",
            value: state.proposals.filter((p) => p.status === "reservada")
              .length,
          },
          {
            label: "Convertidas",
            value: state.proposals.filter((p) => p.status === "convertida")
              .length,
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar cliente, lote…">
        <select
          className={fieldControlClass + " max-w-[220px]"}
          value={empFilter}
          onChange={(e) => setEmpFilter(e.target.value)}
        >
          <option value="todos">Todos empreendimentos</option>
          {carteira.developments.map((d) => (
            <option key={d.id} value={d.nome}>
              {d.nome}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setQ("");
            setEmpFilter("todos");
          }}
        >
          Limpar filtros
        </Button>
      </FilterBar>

      <PaginatedTable
        columns={[
          { key: "cliente", label: "Cliente" },
          { key: "emp", label: "Empreendimento" },
          { key: "lote", label: "Lote / serviço" },
          { key: "valor", label: "Valor" },
          { key: "validade", label: "Validade" },
          { key: "status", label: "Status" },
          { key: "acao", label: "" },
        ]}
        rows={filtered.map((p) => ({
          cliente: p.cliente,
          emp: p.empNome,
          lote: p.servicoRegularizacao
            ? "Regularização"
            : p.loteLabel,
          valor: formatBRL(p.valor),
          validade: formatDateBR(p.validade),
          status: <StatusPill tone="info">{p.status}</StatusPill>,
          acao:
            p.status === "aberta" || p.status === "reservada" ? (
              <Button
                size="sm"
                onClick={() => {
                  if (p.servicoRegularizacao) {
                    converterProposal(p.id);
                    notify("Convertida · jornada → Contrato (regularização)");
                    return;
                  }
                  const valorParcela =
                    p.parcelas > 0
                      ? Math.round(
                          ((p.valor - p.entrada) / p.parcelas) * 100
                        ) / 100
                      : 0;
                  const lot =
                    (p.lotId &&
                      carteira.lots.find((l) => l.id === p.lotId)) ||
                    carteira.lots.find(
                      (l) =>
                        l.empNome === p.empNome &&
                        `${l.quadra}/${l.lote}` === p.loteLabel
                    );
                  const emp =
                    (p.developmentId &&
                      carteira.developments.find(
                        (d) => d.id === p.developmentId
                      )) ||
                    carteira.developments.find((d) => d.nome === p.empNome);
                  if (!lot || !emp) {
                    notify(
                      "Sem lote no estoque",
                      "Vincule um lote disponível à proposta"
                    );
                    return;
                  }
                  const ct = addContract({
                    developmentId: emp.id,
                    lotId: lot.id,
                    compradorNome: p.cliente,
                    preco: p.valor,
                    entrada: p.entrada,
                    qtdParcelas: p.parcelas,
                    valorParcela,
                  });
                  if (!ct) {
                    notify(
                      "Contrato não criado",
                      "Lote indisponível ou bloqueado"
                    );
                    return;
                  }
                  converterProposal(p.id);
                  notify(
                    "Contrato criado",
                    `${ct.numero} · herdou proposta`
                  );
                }}
              >
                Converter
              </Button>
            ) : (
              "—"
            ),
        }))}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova proposta"
        onSubmit={() => {
          const lead = state.leads.find((l) => l.id === form.leadId);
          if (lead && !leadProntoParaProposta(lead)) {
            notify(
              "Lead incompleto",
              "Preencha empreendimento, tipo de interesse e telefone antes da proposta."
            );
            return;
          }
          if (!form.empNome) {
            notify("Empreendimento obrigatório");
            return;
          }
          if (!form.servicoRegularizacao && !form.loteLabel) {
            notify("Selecione quadra/lote ou marque regularização");
            return;
          }
          const created = addProposal({
            ...form,
            cliente: form.cliente || lead?.nome || "Cliente",
            leadId: form.leadId || undefined,
          });
          if (!created) {
            notify("Proposta recusada", "Empreendimento e lote/serviço exigidos");
            return;
          }
          notify("Proposta criada");
          setOpen(false);
        }}
      >
        <Field label="Lead">
          <select
            className={fieldControlClass}
            value={form.leadId}
            onChange={(e) => {
              const lead = state.leads.find((l) => l.id === e.target.value);
              const emp = carteira.developments.find(
                (d) => d.nome === lead?.empInteresse
              );
              setForm({
                ...form,
                leadId: e.target.value,
                cliente: lead?.nome ?? form.cliente,
                empNome: emp?.nome ?? form.empNome,
                developmentId: emp?.id ?? form.developmentId,
              });
            }}
          >
            {state.leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
                {l.temperatura ? ` · ${l.temperatura}` : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Empreendimento *">
          <select
            className={fieldControlClass}
            value={form.developmentId}
            onChange={(e) => {
              const emp = carteira.developments.find(
                (d) => d.id === e.target.value
              );
              setForm({
                ...form,
                developmentId: e.target.value,
                empNome: emp?.nome ?? "",
                lotId: "",
                loteLabel: "",
                servicoRegularizacao: emp?.modalidade === "regularizacao",
              });
            }}
          >
            {carteira.developments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome} · {d.modalidade}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.servicoRegularizacao}
            onChange={(e) =>
              setForm({
                ...form,
                servicoRegularizacao: e.target.checked,
                loteLabel: e.target.checked ? "Regularização" : "",
                lotId: "",
              })
            }
          />
          Serviço de regularização (sem lote)
        </label>
        {!form.servicoRegularizacao ? (
          <Field label="Quadra / Lote *">
            <select
              className={fieldControlClass}
              value={form.lotId}
              onChange={(e) => {
                const lot = lotsDisponiveis.find((l) => l.id === e.target.value);
                setForm({
                  ...form,
                  lotId: e.target.value,
                  loteLabel: lot ? `${lot.quadra}/${lot.lote}` : "",
                  valor: lot?.valor ?? form.valor,
                });
              }}
            >
              <option value="">Selecione lote disponível</option>
              {lotsDisponiveis.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.quadra}/{l.lote} · {formatBRL(l.valor)}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field label="Valor">
          <Input
            type="number"
            value={form.valor}
            onChange={(e) =>
              setForm({ ...form, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Entrada">
          <Input
            type="number"
            value={form.entrada}
            onChange={(e) =>
              setForm({ ...form, entrada: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Parcelas">
          <Input
            type="number"
            value={form.parcelas}
            onChange={(e) =>
              setForm({ ...form, parcelas: Number(e.target.value) || 1 })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
