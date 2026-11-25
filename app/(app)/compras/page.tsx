"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
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
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useOperacoes } from "@/lib/store/operacoes-store";
import type { PurchaseRequest } from "@/lib/domain/operacoes-types";

export default function ComprasPage() {
  const {
    state,
    addPurchase,
    avancarPurchase,
    aprovarPurchase,
    gerarOrdemCompra,
  } = useOperacoes();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PurchaseRequest | null>(null);
  const [form, setForm] = useState({
    descricao: "",
    centroCusto: "Residencial Horizonte",
    necessidade: new Date().toISOString().slice(0, 10),
    urgente: false,
    itens: 3,
    valorEstimado: 10000,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.purchases;
    return state.purchases.filter((p) =>
      [p.numero, p.descricao, p.status, p.centroCusto]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.purchases, q]);

  const emAprovacao = state.purchases.filter(
    (p) => p.status === "em_aprovacao"
  ).length;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Compras"
        description="Fase 7 — solicitação → aprovação → ordem → lançamento a pagar."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Nova solicitação
          </Button>
        }
      />

      <KpiGrid
        items={[
          { label: "Solicitações", value: state.purchases.length },
          { label: "Em aprovação", value: emAprovacao },
          { label: "Ordens", value: state.orders.length },
          {
            label: "Aguardando OC",
            value: state.orders.filter((o) => o.status === "aguardando").length,
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar SC, descrição…" />

      <ModuleSection title="Solicitações">
        <DataTable
          columns={[
            { key: "numero", label: "Nº" },
            { key: "desc", label: "Descrição" },
            { key: "centro", label: "Centro" },
            { key: "nec", label: "Necessidade" },
            { key: "valor", label: "Estimado" },
            { key: "status", label: "Status" },
          ]}
          rows={filtered.map((p) => ({
            numero: (
              <button
                type="button"
                className="font-medium hover:text-brand-orange"
                onClick={() => setSelected(p)}
              >
                {p.numero}
              </button>
            ),
            desc: (
              <span>
                {p.descricao}
                {p.urgente ? (
                  <StatusPill tone="danger"> urgente</StatusPill>
                ) : null}
              </span>
            ),
            centro: p.centroCusto,
            nec: formatDateBR(p.necessidade),
            valor: formatBRL(p.valorEstimado),
            status: (
              <StatusPill tone="info">{p.status.replace(/_/g, " ")}</StatusPill>
            ),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Ordens de compra">
        <DataTable
          columns={[
            { key: "numero", label: "Nº" },
            { key: "forn", label: "Fornecedor" },
            { key: "centro", label: "Centro" },
            { key: "valor", label: "Valor" },
            { key: "status", label: "Status" },
          ]}
          rows={state.orders.map((o) => ({
            numero: o.numero,
            forn: o.fornecedor,
            centro: o.centroCusto,
            valor: formatBRL(o.valor),
            status: <StatusPill tone="ok">{o.status}</StatusPill>,
          }))}
        />
      </ModuleSection>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.numero ?? ""}
      >
        {selected ? (
          <div className="space-y-3">
            <DetailRow label="Descrição" value={selected.descricao} />
            <DetailRow label="Centro" value={selected.centroCusto} />
            <DetailRow label="Solicitante" value={selected.solicitante} />
            <DetailRow label="Itens" value={String(selected.itens)} />
            <DetailRow label="Estimado" value={formatBRL(selected.valorEstimado)} />
            <DetailRow label="Status" value={selected.status} />
            <div className="flex flex-wrap gap-2 pt-2">
              {selected.status === "em_aprovacao" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    aprovarPurchase(selected.id);
                    notify("Solicitação aprovada");
                    setSelected(null);
                  }}
                >
                  Aprovar
                </Button>
              ) : null}
              {selected.status !== "concluida" &&
              selected.status !== "recusada" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    avancarPurchase(selected.id);
                    notify("Status avançado");
                    setSelected(null);
                  }}
                >
                  Avançar fluxo
                </Button>
              ) : null}
              {selected.status === "a_atender" ||
              selected.status === "em_andamento" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    gerarOrdemCompra(
                      selected.id,
                      "Fornecedor Demo Ltda"
                    );
                    notify("OC gerada + lançamento a pagar");
                    setSelected(null);
                  }}
                >
                  Gerar OC
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova solicitação de compra"
        onSubmit={() => {
          if (!form.descricao) {
            notify("Informe a descrição");
            return;
          }
          addPurchase(form);
          notify("Solicitação criada");
          setOpen(false);
        }}
      >
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        <Field label="Centro de custo">
          <select
            className={fieldControlClass}
            value={form.centroCusto}
            onChange={(e) =>
              setForm({ ...form, centroCusto: e.target.value })
            }
          >
            <option>Residencial Horizonte</option>
            <option>Jardins do Sol</option>
            <option>Empresa</option>
          </select>
        </Field>
        <Field label="Necessidade">
          <Input
            type="date"
            value={form.necessidade}
            onChange={(e) =>
              setForm({ ...form, necessidade: e.target.value })
            }
          />
        </Field>
        <Field label="Itens">
          <Input
            type="number"
            value={form.itens}
            onChange={(e) =>
              setForm({ ...form, itens: Number(e.target.value) || 1 })
            }
          />
        </Field>
        <Field label="Valor estimado">
          <Input
            type="number"
            value={form.valorEstimado}
            onChange={(e) =>
              setForm({
                ...form,
                valorEstimado: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.urgente}
            onChange={(e) =>
              setForm({ ...form, urgente: e.target.checked })
            }
          />
          Urgente
        </label>
      </FormDialog>
    </div>
  );
}
