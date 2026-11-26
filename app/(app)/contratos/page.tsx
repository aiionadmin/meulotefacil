"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
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
  FormDialog,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { SearchSelect } from "@/components/app/SearchSelect";
import { formatBRL } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import { useClientCard } from "@/lib/client/client-card-context";
import type { Contract } from "@/lib/domain/carteira-types";

const STATUS_COLS = [
  { id: "ativo", label: "Ativo" },
  { id: "quitado", label: "Quitado" },
  { id: "cancelado", label: "Cancelado" },
  { id: "renegociado", label: "Renegociado" },
  { id: "transferido", label: "Transferido" },
  { id: "trocado", label: "Trocado" },
];

export default function ContratosPage() {
  const { state, saldoDevedor, addContract, registrarOperacao } = useCarteira();
  const { openClient } = useClientCard();
  const [selected, setSelected] = useState<Contract | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    developmentId: state.developments[0]?.id ?? "",
    lotId: "",
    compradorNome: "",
    preco: 180000,
    entrada: 20000,
    qtdParcelas: 60,
    valorParcela: 2500,
  });

  const disponiveis = state.lots.filter(
    (l) => l.developmentId === form.developmentId && l.status === "disponivel"
  );

  const ativos = state.contracts.filter((c) => c.status === "ativo").length;
  const aReceber = state.contracts
    .filter((c) => c.status === "ativo")
    .reduce((a, c) => a + saldoDevedor(c.id), 0);

  const toCard = useCallback(
    (c: Contract) => ({
      id: c.id,
      columnId: c.status,
      title: `${c.numero} · ${c.compradorNome}`,
      subtitle: `${c.empNome} · ${c.quadra}/${c.lote}`,
      badge: formatBRL(c.preco),
      meta: c.status,
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Contratos"
        description="Nascem da proposta aprovada (C12). Kanban por situação."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/carteira">Ficha financeira</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/vendas">Propostas</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova venda
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Contratos", value: state.contracts.length },
          { label: "Ativos", value: ativos },
          { label: "A receber de contratos", value: formatBRL(aReceber) },
        ]}
      />

      <ProcessBoard
        storageKey="contratos"
        columns={STATUS_COLS}
        rows={state.contracts}
        toCard={toCard}
        columnTotals={(_, items) =>
          items.reduce((a, c) => a + c.preco, 0)
        }
        onOpen={(id) => {
          const c = state.contracts.find((x) => x.id === id) ?? null;
          setSelected(c);
          if (c) {
            openClient({
              nome: c.compradorNome,
              personId: c.compradorId,
              contractId: c.id,
              tab: "contrato",
            });
          }
        }}
        onMove={() => {
          notify("Altere situação pela ficha / operação");
          return false;
        }}
        exportName="contratos"
        listColumns={[
          {
            key: "numero",
            label: "Nº",
            filter: { type: "text" },
            getValue: (c) => c.numero,
          },
          {
            key: "cliente",
            label: "Cliente",
            filter: { type: "text" },
            getValue: (c) => c.compradorNome,
          },
          {
            key: "lote",
            label: "Lote",
            filter: { type: "text" },
            getValue: (c) => `${c.empNome} · ${c.quadra}/${c.lote}`,
          },
          {
            key: "preco",
            label: "Preço",
            filter: { type: "range" },
            getValue: (c) => c.preco,
            render: (c) => formatBRL(c.preco),
          },
          {
            key: "saldo",
            label: "Saldo",
            filter: { type: "range" },
            getValue: (c) => saldoDevedor(c.id),
            render: (c) => formatBRL(saldoDevedor(c.id)),
          },
          {
            key: "status",
            label: "Situação",
            filter: {
              type: "status",
              options: STATUS_COLS.map((s) => ({
                value: s.id,
                label: s.label,
              })),
            },
            getValue: (c) => c.status,
            render: (c) => (
              <StatusPill tone={c.status === "ativo" ? "ok" : "neutral"}>
                {c.status}
              </StatusPill>
            ),
          },
        ]}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `Contrato ${selected.numero}` : ""}
      >
        {selected ? (
          <div className="space-y-3">
            <DetailRow
              label="Lote"
              value={`${selected.quadra}/${selected.lote}`}
            />
            <DetailRow label="Preço" value={formatBRL(selected.preco)} />
            <DetailRow
              label="Saldo"
              value={formatBRL(saldoDevedor(selected.id))}
            />
            <DetailRow label="Reajuste" value={selected.tipoReajuste} />
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" asChild>
                <Link href={`/carteira?contrato=${selected.id}`}>Ficha</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  registrarOperacao(
                    selected.id,
                    "retomada",
                    "Retomada demo — lote volta a disponível"
                  );
                  notify("Retomada registrada");
                  setSelected(null);
                }}
              >
                Retomar lote
              </Button>
            </div>
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova venda / contrato"
        onSubmit={() => {
          if (!form.lotId || !form.compradorNome) {
            notify("Selecione lote e informe o comprador");
            return;
          }
          const ct = addContract(form);
          if (!ct) {
            notify("Lote indisponível");
            return;
          }
          notify("Contrato criado", ct.numero);
          setOpen(false);
        }}
      >
        <Field label="Empreendimento">
          <SearchSelect
            options={state.developments.map((d) => ({
              value: d.id,
              label: d.nome,
              meta: d.modalidade,
            }))}
            value={form.developmentId}
            onChange={(v) =>
              setForm({ ...form, developmentId: v, lotId: "" })
            }
          />
        </Field>
        <Field label="Lote disponível *">
          <SearchSelect
            options={disponiveis.map((l) => ({
              value: l.id,
              label: `${l.quadra}/${l.lote}`,
              meta: formatBRL(l.valor),
            }))}
            value={form.lotId}
            onChange={(v) => {
              const lot = disponiveis.find((l) => l.id === v);
              setForm({
                ...form,
                lotId: v,
                preco: lot?.valor ?? form.preco,
              });
            }}
            placeholder="Buscar lote…"
          />
        </Field>
        <Field label="Comprador *">
          <Input
            value={form.compradorNome}
            onChange={(e) =>
              setForm({ ...form, compradorNome: e.target.value })
            }
            required
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
        <Field label="Qtd. prestações">
          <Input
            type="number"
            value={form.qtdParcelas}
            onChange={(e) =>
              setForm({ ...form, qtdParcelas: Number(e.target.value) || 1 })
            }
          />
        </Field>
        <Field label="Valor da prestação">
          <Input
            type="number"
            value={form.valorParcela}
            onChange={(e) =>
              setForm({ ...form, valorParcela: Number(e.target.value) || 0 })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
