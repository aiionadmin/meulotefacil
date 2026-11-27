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
import { downloadPropostaObra } from "@/lib/obras/proposta-obra-html";
import { canSeeObra } from "@/lib/obras/visibilidade";
import { useFase1 } from "@/lib/store/fase1-store";
import { useObras } from "@/lib/store/obras-store";
import { precoComBdi } from "@/lib/money/orcamento";
import type { PropostaStatus } from "@/lib/domain/obras-types";

type AbaObra =
  | "orcamento"
  | "proposta"
  | "contrato"
  | "cronograma"
  | "fisico"
  | "arquivos"
  | "relatorios";

const ABAS: { id: AbaObra; label: string }[] = [
  { id: "orcamento", label: "Orçamento" },
  { id: "proposta", label: "Proposta" },
  { id: "contrato", label: "Contrato" },
  { id: "cronograma", label: "Cronograma" },
  { id: "fisico", label: "Físico-Financeiro" },
  { id: "arquivos", label: "Arquivos" },
  { id: "relatorios", label: "Relatórios" },
];

const PROPOSTA_STATUS: Record<PropostaStatus, string> = {
  contato_inicial: "Contato Inicial",
  em_elaboracao: "Em Elaboração",
  em_revisao: "Em Revisão",
  enviada: "Enviada",
  aprovada: "Aprovada",
  perdida: "Perdida",
};

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
  const { currentUser, currentProfileName: perfilNome } = useFase1();
  const obraRaw = state.obras.find((o) => o.id === id);
  const obra =
    obraRaw && canSeeObra(obraRaw, currentUser, perfilNome) ? obraRaw : undefined;
  const nodes = nodesDaObra(id);
  const tot = totaisDaObra(id);
  const [aba, setAba] = useState<AbaObra>("orcamento");
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

      <div className="flex flex-wrap gap-1.5 border-b border-linha pb-2">
        {ABAS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAba(t.id)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
              aba === t.id
                ? "bg-brand-green text-white"
                : "bg-muted text-muted-foreground hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {aba === "orcamento" ? (
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
      ) : null}

      {aba === "proposta" ? (
        <ModuleSection title="Proposta">
          <div className="grid max-w-xl gap-3">
            <Field label="Status da proposta">
              <select
                className={fieldControlClass}
                value={obra.propostaStatus}
                onChange={(e) =>
                  updateObra(obra.id, {
                    propostaStatus: e.target.value as PropostaStatus,
                  })
                }
              >
                {(Object.keys(PROPOSTA_STATUS) as PropostaStatus[]).map(
                  (s) => (
                    <option key={s} value={s}>
                      {PROPOSTA_STATUS[s]}
                    </option>
                  )
                )}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Data de criação">
                <Input
                  type="date"
                  value={obra.proposta?.dataCriacao ?? ""}
                  onChange={(e) =>
                    updateObra(obra.id, {
                      proposta: {
                        ...obra.proposta,
                        dataCriacao: e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Data de entrega">
                <Input
                  type="date"
                  value={obra.proposta?.dataEntrega ?? ""}
                  onChange={(e) =>
                    updateObra(obra.id, {
                      proposta: {
                        ...obra.proposta,
                        dataEntrega: e.target.value,
                      },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Responsável">
              <Input
                value={obra.proposta?.responsavel ?? ""}
                onChange={(e) =>
                  updateObra(obra.id, {
                    proposta: {
                      ...obra.proposta,
                      responsavel: e.target.value,
                    },
                  })
                }
              />
            </Field>
            <Field label="Condição de pagamento">
              <Input
                value={obra.proposta?.condicaoPagamento ?? ""}
                onChange={(e) =>
                  updateObra(obra.id, {
                    proposta: {
                      ...obra.proposta,
                      condicaoPagamento: e.target.value,
                    },
                  })
                }
              />
            </Field>
            <Field label="Desconto (%)">
              <Input
                type="number"
                value={obra.proposta?.descontoPct ?? 0}
                onChange={(e) =>
                  updateObra(obra.id, {
                    proposta: {
                      ...obra.proposta,
                      descontoPct: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
            <p className="text-sm">
              Preço total:{" "}
              <strong>
                {formatBRL(
                  Math.round(
                    tot.preco *
                      (1 - (obra.proposta?.descontoPct ?? 0) / 100) *
                      100
                  ) / 100
                )}
              </strong>
            </p>
            <Button
              size="sm"
              onClick={() => {
                downloadPropostaObra({
                  obra,
                  nodes,
                  custo: tot.custo,
                  preco: tot.preco,
                });
                notify("Proposta gerada (HTML/PDF)");
              }}
            >
              Gerar proposta (PDF)
            </Button>
          </div>
        </ModuleSection>
      ) : null}

      {aba === "contrato" ? (
        <ModuleSection title="Contrato">
          <p className="mb-3 text-sm text-muted-foreground">
            Documentos a partir de modelos. Gerenciar Modelos em Ajustes.
          </p>
          <ul className="space-y-2 text-sm">
            {[
              "Contrato de empreitada padrão",
              "Aditivo de prazo",
              "Termo de recebimento",
            ].map((m) => (
              <li
                key={m}
                className="flex items-center justify-between rounded-md border border-linha px-3 py-2"
              >
                <span>{m}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => notify("Modelo aplicado (stub)", m)}
                >
                  Usar modelo
                </Button>
              </li>
            ))}
          </ul>
        </ModuleSection>
      ) : null}

      {aba === "fisico" ? (
        <>
          <ModuleSection title="Físico-financeiro por período">
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
        </>
      ) : null}

      {aba === "cronograma" ? (
        <ModuleSection title="Cronograma / Gantt (caminho crítico)">
          {(() => {
            const raw = state.cronograma.filter((c) => c.obraId === obra.id);
            const itensG = computeGanttCritico(
              raw,
              state.expedienteHoras ?? 8
            );
            if (!itensG.length) {
              return (
                <p className="text-sm text-muted-foreground">
                  Sem atividades no cronograma desta obra.
                </p>
              );
            }
            const min = Math.min(
              ...itensG.map((c) => new Date(c.inicio + "T12:00:00").getTime())
            );
            const max = Math.max(
              ...itensG.map((c) => new Date(c.fim + "T12:00:00").getTime())
            );
            const span = Math.max(1, max - min);
            return (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Expediente {state.expedienteHoras ?? 8}h/dia ·{" "}
                  {itensG.filter((i) => i.caminhoCritico).length} no caminho
                  crítico
                </p>
                {itensG.map((c) => {
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
              </div>
            );
          })()}
        </ModuleSection>
      ) : null}

      {aba === "arquivos" ? (
        <ModuleSection title="Arquivos do orçamento">
          <p className="text-sm text-muted-foreground">
            Anexos por arrastar e soltar (até 10 MB) — integração de storage
            preparada.
          </p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 10 * 1024 * 1024) {
                  notify("Arquivo acima de 10 MB");
                  return;
                }
                notify("Arquivo registrado", f.name);
                e.target.value = "";
              }}
            />
            <span className="rounded-sm border border-border bg-card px-3 py-1.5 hover:bg-paper-muted">
              Enviar arquivo
            </span>
          </label>
        </ModuleSection>
      ) : null}

      {aba === "relatorios" ? (
        <ModuleSection title="Relatórios">
          <div className="flex flex-wrap gap-2">
            {[
              "Orçamento Sintético",
              "Orçamento Analítico",
              "Por Etapa",
              "Curva ABC",
            ].map((r) => (
              <Button
                key={r}
                size="sm"
                variant="outline"
                onClick={() => {
                  printList(`${r} · ${obra.nome}`);
                  notify(r);
                }}
              >
                {r}
              </Button>
            ))}
          </div>
        </ModuleSection>
      ) : null}

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
