"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { downloadExcel, printList } from "@/lib/export/list-export";
import { formatBRL } from "@/lib/masks/br";
import { buildFisicoFinanceiro } from "@/lib/obras/fisico-financeiro";
import { computeGanttCritico } from "@/lib/obras/gantt-critico";
import { useObras } from "@/lib/store/obras-store";
import { precoComBdi } from "@/lib/money/orcamento";

export default function ObraDetalhePage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const {
    state,
    nodesDaObra,
    totaisDaObra,
    addNode,
    apropriarDespesa,
    gerarCurvaS,
    updateObra,
  } = useObras();
  const obra = state.obras.find((o) => o.id === id);
  const nodes = nodesDaObra(id);
  const tot = totaisDaObra(id);
  const [openItem, setOpenItem] = useState(false);
  const [openDespesa, setOpenDespesa] = useState(false);
  const [form, setForm] = useState({
    kind: "item" as "etapa" | "subetapa" | "item",
    parentId: "",
    codigo: "",
    descricao: "",
    unidade: "un",
    quantidade: 1,
    custoUnit: 0,
    composicaoId: "",
    insumoId: "",
  });
  const [despesa, setDespesa] = useState({ nodeId: "", valor: 0 });

  const curva = state.curvaS[id] ?? [];
  const cronogramaObra = useMemo(
    () => state.cronograma.filter((c) => c.obraId === id),
    [state.cronograma, id]
  );
  const fisicoFin = useMemo(
    () =>
      buildFisicoFinanceiro({
        cronograma: cronogramaObra,
        curvaS: curva,
        nodes,
      }),
    [cronogramaObra, curva, nodes]
  );

  const itens = useMemo(
    () => nodes.filter((n) => n.kind === "item"),
    [nodes]
  );

  if (!obra) {
    return (
      <p className="text-sm text-muted-foreground">
        Obra não encontrada.{" "}
        <Link href="/obras" className="underline">
          Voltar
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title={obra.nome}
        description={`${obra.codigo} · ${obra.clienteNome}${
          obra.developmentNome ? ` · ${obra.developmentNome}` : " · sem empreendimento"
        }`}
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/obras">Lista</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/obras/rdo?obra=${obra.id}`}>RDO</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                gerarCurvaS(obra.id);
                notify("Curva S gerada");
              }}
            >
              Gerar Curva S
            </Button>
            <Button size="sm" onClick={() => setOpenItem(true)}>
              + Item / etapa
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Custo", value: formatBRL(tot.custo) },
          {
            label: "Preço c/ BDI",
            value: formatBRL(tot.preco),
          },
          { label: "Realizado", value: formatBRL(obra.realizado) },
          { label: "Físico", value: `${obra.fisicoPct}%` },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <select
          className={fieldControlClass + " max-w-[220px]"}
          value={obra.status}
          onChange={(e) =>
            updateObra(obra.id, {
              status: e.target.value as typeof obra.status,
            })
          }
        >
          <option value="em_orcamento">Em orçamento</option>
          <option value="em_andamento">Em andamento</option>
          <option value="paralisada">Paralisada</option>
          <option value="finalizada">Finalizada</option>
        </select>
        <Button size="sm" variant="outline" onClick={() => setOpenDespesa(true)}>
          Apropriar despesa
        </Button>
      </div>

      <ModuleSection title="Árvore do orçamento">
        <DataTable
          columns={[
            { key: "codigo", label: "Código" },
            { key: "desc", label: "Descrição" },
            { key: "kind", label: "Tipo" },
            { key: "qtd", label: "Qtd" },
            { key: "custo", label: "Custo" },
            { key: "preco", label: "Preço" },
            { key: "real", label: "Realizado" },
            { key: "fis", label: "Físico" },
          ]}
          rows={nodes.map((n) => ({
            codigo: n.codigo,
            desc: n.descricao,
            kind: <StatusPill tone="neutral">{n.kind}</StatusPill>,
            qtd: n.kind === "item" ? `${n.quantidade} ${n.unidade}` : "—",
            custo: formatBRL(n.orcado),
            preco: formatBRL(precoComBdi(n.orcado, n.bdiPct)),
            real: formatBRL(n.realizado),
            fis: `${n.fisicoPct}%`,
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Físico-financeiro por período (D12)">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadExcel(
                `fisico-financeiro-${obra.codigo}`,
                [
                  "Período",
                  "Atividades",
                  "Físico plan. %",
                  "Físico real. %",
                  "Fin. plan.",
                  "Fin. real.",
                  "Saldo fin.",
                ],
                fisicoFin.map((r) => [
                  r.periodo,
                  r.atividades,
                  r.fisicoPlanPct,
                  r.fisicoRealPct,
                  r.finPlan,
                  r.finReal,
                  r.saldoFin,
                ])
              );
              notify("Excel exportado");
            }}
          >
            Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => printList(`Físico-financeiro · ${obra.nome}`)}
          >
            Imprimir
          </Button>
        </div>
        {fisicoFin.length ? (
          <DataTable
            columns={[
              { key: "p", label: "Período" },
              { key: "at", label: "Ativ." },
              { key: "pf", label: "Físico plan." },
              { key: "rf", label: "Físico real." },
              { key: "pfin", label: "Fin. plan." },
              { key: "rfin", label: "Fin. real." },
              { key: "sal", label: "Saldo" },
            ]}
            rows={fisicoFin.map((r) => ({
              p: r.periodo,
              at: String(r.atividades),
              pf: `${r.fisicoPlanPct}%`,
              rf: `${r.fisicoRealPct}%`,
              pfin: formatBRL(r.finPlan),
              rfin: formatBRL(r.finReal),
              sal: formatBRL(r.saldoFin),
            }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Sem períodos — gere a Curva S ou cadastre o cronograma.
          </p>
        )}
      </ModuleSection>

      <ModuleSection title="Curva S">
        {curva.length ? (
          <DataTable
            columns={[
              { key: "p", label: "Período" },
              { key: "pf", label: "Físico plan." },
              { key: "rf", label: "Físico real." },
              { key: "pfin", label: "Fin. plan." },
              { key: "rfin", label: "Fin. real." },
            ]}
            rows={curva.map((c) => ({
              p: c.periodo,
              pf: `${c.planejadoFisico}%`,
              rf: `${c.realizadoFisico}%`,
              pfin: formatBRL(c.planejadoFinanceiro),
              rfin: formatBRL(c.realizadoFinanceiro),
            }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Gere a Curva S a partir do orçamento.
          </p>
        )}
      </ModuleSection>

      <ModuleSection title="Cronograma / Gantt (caminho crítico)">
        {(() => {
          const raw = state.cronograma.filter((c) => c.obraId === obra.id);
          const itens = computeGanttCritico(
            raw,
            state.expedienteHoras ?? 8
          );
          if (!itens.length) {
            return (
              <p className="text-sm text-muted-foreground">
                Sem atividades no cronograma desta obra.
              </p>
            );
          }
          const min = Math.min(
            ...itens.map((c) => new Date(c.inicio + "T12:00:00").getTime())
          );
          const max = Math.max(
            ...itens.map((c) => new Date(c.fim + "T12:00:00").getTime())
          );
          const span = Math.max(1, max - min);
          return (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                D11 — expediente {state.expedienteHoras ?? 8}h/dia ·{" "}
                {itens.filter((i) => i.caminhoCritico).length} no caminho
                crítico
              </p>
              {itens.map((c) => {
                const a = new Date(c.inicio + "T12:00:00").getTime();
                const b = new Date(c.fim + "T12:00:00").getTime();
                const left = ((a - min) / span) * 100;
                const width = Math.max(4, ((b - a) / span) * 100);
                return (
                  <div
                    key={c.id}
                    className="grid grid-cols-[12rem_1fr] gap-2 text-xs"
                  >
                    <span
                      className={
                        c.caminhoCritico
                          ? "font-semibold text-destructive"
                          : ""
                      }
                    >
                      {c.label}
                      {c.caminhoCritico ? " ★" : ""}
                      <span className="ml-1 text-muted-foreground">
                        folga {c.folgaDias}d
                      </span>
                    </span>
                    <div className="relative h-6 rounded bg-muted">
                      <div
                        className={`absolute top-0.5 h-5 rounded ${
                          c.caminhoCritico
                            ? "bg-destructive/80"
                            : "bg-brand-orange/80"
                        }`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`${c.inicio} → ${c.fim} · ${c.duracaoDias}d · folga ${c.folgaDias}d`}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground">
                ★ caminho crítico (folga 0) · datas recalculadas por
                predecessores
              </p>
            </div>
          );
        })()}
      </ModuleSection>

      <FormDialog
        open={openItem}
        onOpenChange={setOpenItem}
        title="Adicionar à árvore"
        onSubmit={() => {
          if (!form.codigo || !form.descricao) {
            notify("Código e descrição obrigatórios");
            return;
          }
          let custoUnit = form.custoUnit;
          let unidade = form.unidade;
          let composicaoId = form.composicaoId || undefined;
          let insumoId = form.insumoId || undefined;
          let grupo = undefined as undefined | "material" | "mao_de_obra" | "equipamento" | "outros";

          if (form.composicaoId) {
            const c = state.composicoes.find((x) => x.id === form.composicaoId);
            if (c) {
              const custo = c.itens.reduce((a, it) => {
                const ins = state.insumos.find((i) => i.id === it.insumoId);
                return a + (ins?.custoUnitario ?? 0) * it.coeficiente;
              }, 0);
              custoUnit = Math.round(custo * 100) / 100;
              unidade = c.unidade;
              composicaoId = c.id;
              grupo = "material";
            }
          } else if (form.insumoId) {
            const ins = state.insumos.find((i) => i.id === form.insumoId);
            if (ins) {
              custoUnit = ins.custoUnitario;
              unidade = ins.unidade;
              insumoId = ins.id;
              grupo = ins.grupo;
            }
          }

          addNode({
            obraId: obra.id,
            parentId: form.parentId || undefined,
            kind: form.kind,
            codigo: form.codigo,
            descricao: form.descricao,
            unidade,
            quantidade: form.quantidade,
            custoUnit,
            bdiPct: obra.bdiPct,
            composicaoId,
            insumoId,
            grupo,
            ordem: nodes.length + 1,
          });
          notify("Linha adicionada");
          setOpenItem(false);
        }}
      >
        <Field label="Tipo">
          <select
            className={fieldControlClass}
            value={form.kind}
            onChange={(e) =>
              setForm({
                ...form,
                kind: e.target.value as typeof form.kind,
              })
            }
          >
            <option value="etapa">Etapa</option>
            <option value="subetapa">Subetapa</option>
            <option value="item">Item</option>
          </select>
        </Field>
        <Field label="Pai">
          <select
            className={fieldControlClass}
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          >
            <option value="">Raiz</option>
            {nodes
              .filter((n) => n.kind !== "item")
              .map((n) => (
                <option key={n.id} value={n.id}>
                  {n.codigo} · {n.descricao}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Código *">
          <Input
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />
        </Field>
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        {form.kind === "item" ? (
          <>
            <Field label="Composição">
              <select
                className={fieldControlClass}
                value={form.composicaoId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    composicaoId: e.target.value,
                    insumoId: "",
                    descricao:
                      state.composicoes.find((c) => c.id === e.target.value)
                        ?.descricao ?? form.descricao,
                  })
                }
              >
                <option value="">—</option>
                {state.composicoes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} · {c.descricao}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ou insumo">
              <select
                className={fieldControlClass}
                value={form.insumoId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    insumoId: e.target.value,
                    composicaoId: "",
                    descricao:
                      state.insumos.find((i) => i.id === e.target.value)
                        ?.descricao ?? form.descricao,
                  })
                }
              >
                <option value="">—</option>
                {state.insumos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.codigo} · {i.descricao}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quantidade">
              <Input
                type="number"
                value={form.quantidade}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantidade: Number(e.target.value) || 0,
                  })
                }
              />
            </Field>
          </>
        ) : null}
      </FormDialog>

      <FormDialog
        open={openDespesa}
        onOpenChange={setOpenDespesa}
        title="Apropriar despesa ao item"
        onSubmit={() => {
          if (!despesa.nodeId || despesa.valor <= 0) {
            notify("Selecione item e valor");
            return;
          }
          const ok = apropriarDespesa(despesa.nodeId, despesa.valor);
          if (!ok) {
            notify("Falha ao apropriar");
            return;
          }
          notify("Realizado atualizado na gestão");
          setOpenDespesa(false);
        }}
      >
        <Field label="Item">
          <select
            className={fieldControlClass}
            value={despesa.nodeId}
            onChange={(e) =>
              setDespesa({ ...despesa, nodeId: e.target.value })
            }
          >
            <option value="">Selecione</option>
            {itens.map((n) => (
              <option key={n.id} value={n.id}>
                {n.codigo} · {n.descricao}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Valor">
          <Input
            type="number"
            value={despesa.valor}
            onChange={(e) =>
              setDespesa({
                ...despesa,
                valor: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
