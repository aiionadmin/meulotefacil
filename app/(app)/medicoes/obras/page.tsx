"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { SearchSelect } from "@/components/app/SearchSelect";
import { formatBRL } from "@/lib/masks/br";
import { valorMedicaoItens } from "@/lib/money/orcamento";
import { useObras } from "@/lib/store/obras-store";
import { SelectAllCheckboxes } from "@/components/app/SelectAllCheckboxes";

type MedicaoStatus = "em_elaboracao" | "enviada" | "aprovada" | "faturada";

type MedicaoItemLinha = {
  nodeId: string;
  codigo: string;
  descricao: string;
  orcado: number;
  pctPeriodo: number;
  valorMedido: number;
};

type MedicaoObra = {
  id: string;
  numero: number;
  periodo: string;
  obraId: string;
  obraNome: string;
  clienteNome: string;
  valorMedido: number;
  pctAcumulado: number;
  status: MedicaoStatus;
  itens: MedicaoItemLinha[];
};

const STATUS_OPTS: { value: MedicaoStatus; label: string }[] = [
  { value: "em_elaboracao", label: "Em elaboração" },
  { value: "enviada", label: "Enviada" },
  { value: "aprovada", label: "Aprovada" },
  { value: "faturada", label: "Faturada" },
];

const SEED: MedicaoObra[] = [
  {
    id: "mo-1",
    numero: 1,
    periodo: "2026-10",
    obraId: "obr-1",
    obraNome: "Infraestrutura Residencial Horizonte",
    clienteNome: "Meu Lote Fácil Ltda",
    valorMedido: 185000,
    pctAcumulado: 32,
    status: "aprovada",
    itens: [
      {
        nodeId: "n-i1",
        codigo: "1.1.1",
        descricao: "Concreto fck 20 MPa",
        orcado: 54000,
        pctPeriodo: 20,
        valorMedido: 10800,
      },
    ],
  },
  {
    id: "mo-2",
    numero: 2,
    periodo: "2026-11",
    obraId: "obr-1",
    obraNome: "Infraestrutura Residencial Horizonte",
    clienteNome: "Meu Lote Fácil Ltda",
    valorMedido: 92000,
    pctAcumulado: 48,
    status: "em_elaboracao",
    itens: [],
  },
];

export default function MedicaoObrasPage() {
  const { state, nodesDaObra, aplicarMedicao } = useObras();
  const [rows, setRows] = useState(SEED);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    obraId: state.obras[0]?.id ?? "",
    periodo: new Date().toISOString().slice(0, 7),
  });
  /** nodeId → % do período */
  const [pctPorItem, setPctPorItem] = useState<Record<string, number>>({});
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({});

  const obraOpts = useMemo(
    () =>
      state.obras.map((o) => ({
        value: o.id,
        label: `${o.codigo} · ${o.nome}`,
      })),
    [state.obras]
  );

  const itensObra = useMemo(() => {
    if (!form.obraId) return [];
    return nodesDaObra(form.obraId).filter((n) => n.kind === "item");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute when nodes change
  }, [form.obraId, state.nodes]);

  const linhasSelecionadas = useMemo(() => {
    return itensObra
      .filter((n) => selecionados[n.id])
      .map((n) => {
        const pct = Math.max(0, Math.min(100, pctPorItem[n.id] ?? 0));
        const valor = valorMedicaoItens([{ orcado: n.orcado, pctPeriodo: pct }]);
        return {
          nodeId: n.id,
          codigo: n.codigo,
          descricao: n.descricao,
          orcado: n.orcado,
          pctPeriodo: pct,
          valorMedido: valor,
        } satisfies MedicaoItemLinha;
      });
  }, [itensObra, selecionados, pctPorItem]);

  const valorTotal = useMemo(
    () => valorMedicaoItens(linhasSelecionadas),
    [linhasSelecionadas]
  );

  const pctMedio = useMemo(() => {
    if (!linhasSelecionadas.length) return 0;
    const sum = linhasSelecionadas.reduce((a, i) => a + i.pctPeriodo, 0);
    return Math.round((sum / linhasSelecionadas.length) * 100) / 100;
  }, [linhasSelecionadas]);

  function resetSelecao(obraId: string) {
    const itens = nodesDaObra(obraId).filter((n) => n.kind === "item");
    const sel: Record<string, boolean> = {};
    const pct: Record<string, number> = {};
    for (const n of itens) {
      sel[n.id] = false;
      pct[n.id] = 0;
    }
    setSelecionados(sel);
    setPctPorItem(pct);
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Medição de Obras"
        description="Medição para o cliente — boletim por período atrelado aos itens do orçamento."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const obraId = state.obras[0]?.id ?? "";
              setForm({
                obraId,
                periodo: new Date().toISOString().slice(0, 7),
              });
              resetSelecao(obraId);
              setOpen(true);
            }}
          >
            Nova medição
          </Button>
        }
      />
      <ProcessList
        storageKey="medicoes-obras"
        exportName="medicoes-obras"
        rows={rows}
        empty="Nenhuma medição de obras."
        columns={[
          {
            key: "numero",
            label: "Número",
            filter: { type: "range" },
            getValue: (r) => r.numero,
          },
          {
            key: "periodo",
            label: "Período",
            filter: { type: "text" },
            getValue: (r) => r.periodo,
          },
          {
            key: "obra",
            label: "Obra",
            filter: { type: "text" },
            getValue: (r) => r.obraNome,
          },
          {
            key: "cliente",
            label: "Cliente",
            filter: { type: "text" },
            getValue: (r) => r.clienteNome,
          },
          {
            key: "itens",
            label: "Itens",
            filter: { type: "range" },
            getValue: (r) => r.itens.length,
            render: (r) =>
              r.itens.length
                ? r.itens.map((i) => i.codigo).join(", ")
                : "—",
          },
          {
            key: "valor",
            label: "Valor medido",
            filter: { type: "range" },
            getValue: (r) => r.valorMedido,
            render: (r) => formatBRL(r.valorMedido),
          },
          {
            key: "pct",
            label: "% período",
            filter: { type: "range" },
            getValue: (r) => r.pctAcumulado,
            render: (r) => `${r.pctAcumulado}%`,
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: STATUS_OPTS.map((s) => ({
                value: s.value,
                label: s.label,
              })),
            },
            getValue: (r) => r.status,
            render: (r) => (
              <StatusPill
                tone={
                  r.status === "aprovada" || r.status === "faturada"
                    ? "ok"
                    : r.status === "enviada"
                      ? "warn"
                      : "neutral"
                }
              >
                {STATUS_OPTS.find((s) => s.value === r.status)?.label ??
                  r.status}
              </StatusPill>
            ),
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova medição de obra"
        onSubmit={() => {
          const obra =
            state.obras.find((o) => o.id === form.obraId) ?? state.obras[0];
          if (!obra) {
            notify("Selecione a obra");
            return;
          }
          if (!linhasSelecionadas.length || valorTotal <= 0) {
            notify("Selecione ao menos um item do orçamento com % > 0");
            return;
          }
          const ok = aplicarMedicao(
            linhasSelecionadas.map((i) => ({
              nodeId: i.nodeId,
              valorMedido: i.valorMedido,
              pctPeriodo: i.pctPeriodo,
            }))
          );
          if (!ok) {
            notify("Não foi possível aplicar a medição nos itens");
            return;
          }
          const numero = Math.max(0, ...rows.map((r) => r.numero)) + 1;
          setRows((prev) => [
            {
              id: `mo-${Date.now()}`,
              numero,
              periodo: form.periodo,
              obraId: obra.id,
              obraNome: obra.nome,
              clienteNome: obra.clienteNome,
              valorMedido: valorTotal,
              pctAcumulado: pctMedio,
              status: "em_elaboracao",
              itens: linhasSelecionadas,
            },
            ...prev,
          ]);
          notify(
            "Medição criada",
            `Nº ${numero} · ${linhasSelecionadas.length} item(ns) · ${formatBRL(valorTotal)}`
          );
          setOpen(false);
        }}
      >
        <Field label="Obra *">
          <SearchSelect
            value={form.obraId}
            onChange={(obraId) => {
              setForm((f) => ({ ...f, obraId }));
              resetSelecao(obraId);
            }}
            options={obraOpts}
            placeholder="Buscar obra…"
          />
        </Field>
        <Field label="Período *">
          <input
            type="month"
            className={fieldControlClass}
            value={form.periodo}
            onChange={(e) =>
              setForm((f) => ({ ...f, periodo: e.target.value }))
            }
          />
        </Field>

        <div className="space-y-2 rounded-md border border-linha/70 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Itens do orçamento *</p>
            <div className="flex flex-wrap items-center gap-2">
              <SelectAllCheckboxes
                allIds={itensObra.map((n) => n.id)}
                selected={selecionados}
                onChange={(next) => {
                  if (Array.isArray(next)) {
                    const map: Record<string, boolean> = {};
                    for (const id of itensObra.map((n) => n.id)) {
                      map[id] = next.includes(id);
                    }
                    setSelecionados(map);
                    return;
                  }
                  setSelecionados(next);
                }}
              />
              <span className="text-xs text-muted-foreground">
                {linhasSelecionadas.length} selecionado(s) ·{" "}
                {formatBRL(valorTotal)}
              </span>
            </div>
          </div>
          {itensObra.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Esta obra ainda não tem itens no orçamento. Cadastre itens em
              Orçamento ou na ficha da obra.
            </p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
              {itensObra.map((n) => {
                const checked = !!selecionados[n.id];
                return (
                  <li
                    key={n.id}
                    className="grid gap-2 rounded-sm border border-linha/50 p-2 sm:grid-cols-[auto_1fr_6rem]"
                  >
                    <label className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={checked}
                        onChange={(e) =>
                          setSelecionados((s) => ({
                            ...s,
                            [n.id]: e.target.checked,
                          }))
                        }
                      />
                      <span className="sr-only">Selecionar {n.codigo}</span>
                    </label>
                    <div className="min-w-0">
                      <p className="font-medium">
                        {n.codigo} · {n.descricao}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Orçado {formatBRL(n.orcado)} · físico {n.fisicoPct}% ·
                        realizado {formatBRL(n.realizado)}
                      </p>
                    </div>
                    <Field label="% período">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        disabled={!checked}
                        value={checked ? pctPorItem[n.id] ?? 0 : ""}
                        onChange={(e) =>
                          setPctPorItem((p) => ({
                            ...p,
                            [n.id]: Number(e.target.value) || 0,
                          }))
                        }
                      />
                    </Field>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">
            O valor medido é calculado como orçado × % do período em cada item
            marcado. Ao salvar, o realizado e o % físico dos itens são
            atualizados.
          </p>
        </div>
      </FormDialog>
    </div>
  );
}
