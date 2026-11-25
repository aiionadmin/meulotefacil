"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
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
import { formatBRL } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import type { Contract } from "@/lib/domain/carteira-types";

export default function ContratosPage() {
  const { state, saldoDevedor, addContract, registrarOperacao } = useCarteira();
  const [q, setQ] = useState("");
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

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.contracts;
    return state.contracts.filter((c) =>
      [c.numero, c.compradorNome, c.empNome, c.quadra, c.lote, c.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.contracts, q]);

  const ativos = state.contracts.filter((c) => c.status === "ativo").length;
  const aReceber = state.contracts
    .filter((c) => c.status === "ativo")
    .reduce((a, c) => a + saldoDevedor(c.id), 0);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Contratos"
        description="venda, plano de parcelas e operações sobre o contrato."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/carteira">Ficha financeira</Link>
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

      <FilterBar
        value={q}
        onChange={setQ}
        placeholder="Buscar número, comprador, lote…"
      />

      <DataTable
        columns={[
          { key: "numero", label: "Nº" },
          { key: "cliente", label: "Cliente" },
          { key: "lote", label: "Lote" },
          { key: "preco", label: "Preço" },
          { key: "saldo", label: "Saldo" },
          { key: "status", label: "Situação" },
        ]}
        rows={filtered.map((c) => ({
          numero: (
            <button
              type="button"
              className="font-medium hover:text-brand-orange"
              onClick={() => setSelected(c)}
            >
              {c.numero}
            </button>
          ),
          cliente: c.compradorNome,
          lote: `${c.empNome} · ${c.quadra}/${c.lote}`,
          preco: formatBRL(c.preco),
          saldo: formatBRL(saldoDevedor(c.id)),
          status: (
            <StatusPill tone={c.status === "ativo" ? "ok" : "neutral"}>
              {c.status}
            </StatusPill>
          ),
        }))}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `Contrato ${selected.numero}` : ""}
      >
        {selected ? (
          <div className="space-y-3">
            <DetailRow label="Lote" value={`${selected.quadra}/${selected.lote}`} />
            <DetailRow label="Preço" value={formatBRL(selected.preco)} />
            <DetailRow label="Saldo" value={formatBRL(saldoDevedor(selected.id))} />
            <DetailRow label="Reajuste" value={selected.tipoReajuste} />
            <DetailRow label="Multa" value={`${(selected.multaPct * 100).toFixed(0)}%`} />
            <DetailRow
              label="Mora"
              value={`${(selected.taxaMoraMes * 100).toFixed(0)}% a.m.`}
            />
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
          <select
            className={fieldControlClass}
            value={form.developmentId}
            onChange={(e) =>
              setForm({ ...form, developmentId: e.target.value, lotId: "" })
            }
          >
            {state.developments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Lote disponível *">
          <select
            className={fieldControlClass}
            value={form.lotId}
            onChange={(e) => {
              const lot = disponiveis.find((l) => l.id === e.target.value);
              setForm({
                ...form,
                lotId: e.target.value,
                preco: lot?.valor ?? form.preco,
              });
            }}
          >
            <option value="">Selecione</option>
            {disponiveis.map((l) => (
              <option key={l.id} value={l.id}>
                {l.quadra}/{l.lote} · {formatBRL(l.valor)}
              </option>
            ))}
          </select>
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
