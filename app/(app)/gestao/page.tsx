"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  FilterBar,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { canApprove } from "@/lib/alcadas/check";
import { downloadExcel } from "@/lib/export/list-export";
import { formatBRL } from "@/lib/masks/br";
import {
  curvaAbc,
  desempenhoCustos,
  insumosOrcadosXRealizados,
  orcamentoAnalitico,
  orcamentoSintetico,
} from "@/lib/obras/relatorios-d17";
import { statusLabel } from "@/lib/status/labels";
import { useObras } from "@/lib/store/obras-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { custoPorGrupo } from "@/lib/money/orcamento";

export default function GestaoObrasPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-ink/70">Carregando gestão…</p>}>
      <GestaoObrasInner />
    </Suspense>
  );
}

function GestaoObrasInner() {
  const { state, nodesDaObra, setRelatorioGerencialStatus } = useObras();
  const { currentUser, state: f1 } = useFase1();
  const search = useSearchParams();
  const perfilNome =
    f1.profiles.find((p) => p.id === currentUser?.profileId)?.nome ?? "—";
  const [q, setQ] = useState("");
  const [obraId, setObraId] = useState(
    search.get("obra") || state.obras[0]?.id || ""
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.obras;
    return state.obras.filter((o) =>
      [o.codigo, o.nome, o.clienteNome, o.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.obras, q]);

  const obra = state.obras.find((o) => o.id === obraId) ?? filtered[0];
  const nodes = obra ? nodesDaObra(obra.id) : [];
  const itens = nodes.filter((n) => n.kind === "item");
  const sint = useMemo(() => orcamentoSintetico(nodes), [nodes]);
  const ana = useMemo(() => orcamentoAnalitico(nodes), [nodes]);
  const abc = useMemo(() => curvaAbc(nodes), [nodes]);
  const oxr = useMemo(
    () =>
      insumosOrcadosXRealizados({
        nodes,
        insumos: state.insumos,
        composicoes: state.composicoes,
      }),
    [nodes, state.insumos, state.composicoes]
  );
  const desempenho = useMemo(() => desempenhoCustos(nodes), [nodes]);
  const grupos = custoPorGrupo(
    itens.map((n) => ({
      grupo: n.grupo ?? "outros",
      custo: n.realizado,
    }))
  );
  const curva = obra ? state.curvaS[obra.id] ?? [] : [];

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Gestão da obra"
        description="D17 — relatórios sintético/analítico, Curva ABC, insumos O×R e desempenho."
        actions={
          obra ? (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/obras/${obra.id}`}>Abrir orçamento</Link>
            </Button>
          ) : null
        }
      />

      <FilterBar value={q} onChange={setQ} placeholder="Filtrar obras…">
        <select
          className={fieldControlClass + " max-w-[260px]"}
          value={obra?.id ?? ""}
          onChange={(e) => setObraId(e.target.value)}
        >
          {filtered.map((o) => (
            <option key={o.id} value={o.id}>
              {o.codigo} · {o.nome}
            </option>
          ))}
        </select>
      </FilterBar>

      {obra ? (
        <>
          <KpiGrid
            items={[
              { label: "Orçado", value: formatBRL(obra.orcado) },
              { label: "Realizado", value: formatBRL(obra.realizado) },
              {
                label: "Saldo",
                value: formatBRL(obra.orcado - obra.realizado),
              },
              { label: "Físico", value: `${obra.fisicoPct}%` },
            ]}
          />

          <ModuleSection title="Por grupo (realizado)">
            <DataTable
              columns={[
                { key: "g", label: "Grupo" },
                { key: "v", label: "Valor" },
              ]}
              rows={Object.entries(grupos).map(([g, v]) => ({
                g: g.replace(/_/g, " "),
                v: formatBRL(v),
              }))}
            />
          </ModuleSection>

          <ModuleSection title="Gestão de custos">
            <DataTable
              columns={[
                { key: "cod", label: "Código" },
                { key: "desc", label: "Item" },
                { key: "orc", label: "Orçado" },
                { key: "rea", label: "Realizado" },
                { key: "sal", label: "Saldo" },
                { key: "fis", label: "% físico" },
              ]}
              rows={itens.map((n) => ({
                cod: n.codigo,
                desc: n.descricao,
                orc: formatBRL(n.orcado),
                rea: formatBRL(n.realizado),
                sal: formatBRL(n.orcado - n.realizado),
                fis: `${n.fisicoPct}%`,
              }))}
            />
          </ModuleSection>

          <ModuleSection title="Curva S">
            {curva.length ? (
              <DataTable
                columns={[
                  { key: "p", label: "Período" },
                  { key: "pf", label: "Físico plan." },
                  { key: "rf", label: "Físico real." },
                  { key: "ffin", label: "Fin. plan." },
                  { key: "rfin", label: "Fin. real." },
                ]}
                rows={curva.map((c) => ({
                  p: c.periodo,
                  pf: `${c.planejadoFisico}%`,
                  rf: `${c.realizadoFisico}%`,
                  ffin: formatBRL(c.planejadoFinanceiro),
                  rfin: formatBRL(c.realizadoFinanceiro),
                }))}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Abra a obra e clique em Gerar Curva S.
              </p>
            )}
          </ModuleSection>

          <ModuleSection title="Relatórios D17">
            <div className="mb-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  downloadExcel(
                    `orcamento-sintetico-${obra.codigo}`,
                    ["Código", "Descrição", "Orçado", "Realizado", "Saldo", "% físico"],
                    sint.map((r) => [
                      r.codigo,
                      r.descricao,
                      r.orcado,
                      r.realizado,
                      r.saldo,
                      r.fisicoPct,
                    ])
                  );
                  notify("Orçamento sintético exportado");
                }}
              >
                Sintético
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  downloadExcel(
                    `orcamento-analitico-${obra.codigo}`,
                    [
                      "Código",
                      "Descrição",
                      "Unidade",
                      "Qtd",
                      "Grupo",
                      "Orçado",
                      "Realizado",
                      "Saldo",
                      "% físico",
                    ],
                    ana.map((r) => [
                      r.codigo,
                      r.descricao,
                      r.unidade,
                      r.quantidade,
                      r.grupo,
                      r.orcado,
                      r.realizado,
                      r.saldo,
                      r.fisicoPct,
                    ])
                  );
                  notify("Orçamento analítico exportado");
                }}
              >
                Analítico
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  downloadExcel(
                    `curva-abc-${obra.codigo}`,
                    ["Código", "Descrição", "Orçado", "% acum.", "Classe"],
                    abc.map((r) => [
                      r.codigo,
                      r.descricao,
                      r.orcado,
                      r.acumuladoPct,
                      r.classe,
                    ])
                  );
                  notify("Curva ABC exportada");
                }}
              >
                Curva ABC
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  downloadExcel(
                    `insumos-oxr-${obra.codigo}`,
                    ["Código", "Nome", "Unidade", "Orçado", "Realizado", "Saldo"],
                    oxr.map((r) => [
                      r.codigo,
                      r.nome,
                      r.unidade,
                      r.orcado,
                      r.realizado,
                      r.saldo,
                    ])
                  );
                  notify("Insumos O×R exportados");
                }}
              >
                Insumos O×R
              </Button>
            </div>
            <KpiGrid
              items={[
                { label: "Itens", value: desempenho.itens },
                { label: "Orçado D17", value: formatBRL(desempenho.orcado) },
                {
                  label: "Realizado D17",
                  value: formatBRL(desempenho.realizado),
                },
                { label: "Físico médio", value: `${desempenho.fisicoMedio}%` },
              ]}
            />
            <DataTable
              columns={[
                { key: "cod", label: "Código" },
                { key: "desc", label: "Item" },
                { key: "orc", label: "Orçado" },
                { key: "cls", label: "ABC" },
                { key: "ac", label: "% acum." },
              ]}
              rows={abc.slice(0, 12).map((r) => ({
                cod: r.codigo,
                desc: r.descricao,
                orc: formatBRL(r.orcado),
                cls: r.classe,
                ac: `${r.acumuladoPct}%`,
              }))}
            />
          </ModuleSection>

          <ModuleSection title="Relatório gerencial (D18)">
            <DataTable
              exportName="relatorios-gerenciais"
              columns={[
                { key: "num", label: "Nº" },
                { key: "tit", label: "Título" },
                { key: "per", label: "Período" },
                { key: "st", label: "Status" },
                { key: "acao", label: "" },
              ]}
              rows={state.relatoriosGerenciais
                .filter((r) => r.obraId === obra.id)
                .map((r) => ({
                  num: r.numero,
                  tit: r.titulo,
                  per: r.periodo,
                  st: (
                    <StatusPill
                      tone={
                        r.status === "aprovado"
                          ? "ok"
                          : r.status === "recusado"
                            ? "danger"
                            : "warn"
                      }
                    >
                      {statusLabel(r.status)}
                    </StatusPill>
                  ),
                  acao:
                    r.status === "em_aprovacao" ? (
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          onClick={() => {
                            const gate = canApprove({
                              rules: f1.approvalRules,
                              tipo: "Relatório Gerencial",
                              perfilNome,
                            });
                            if (!gate.ok) {
                              notify("Alçada insuficiente", gate.reason);
                              return;
                            }
                            setRelatorioGerencialStatus(r.id, "aprovado");
                            notify("Relatório aprovado", r.numero);
                          }}
                        >
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRelatorioGerencialStatus(r.id, "recusado");
                            notify("Relatório recusado", r.numero);
                          }}
                        >
                          Recusar
                        </Button>
                      </div>
                    ) : (
                      "—"
                    ),
                }))}
            />
          </ModuleSection>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma obra.</p>
      )}

      <ModuleSection title="Lista">
        <DataTable
          columns={[
            { key: "obra", label: "Obra" },
            { key: "cli", label: "Cliente" },
            { key: "st", label: "Status" },
            { key: "fis", label: "Físico" },
          ]}
          rows={filtered.map((o) => ({
            obra: (
              <button
                type="button"
                className="font-medium hover:text-brand-orange"
                onClick={() => setObraId(o.id)}
              >
                {o.nome}
              </button>
            ),
            cli: o.clienteNome,
            st: <StatusPill tone="info">{o.status.replace(/_/g, " ")}</StatusPill>,
            fis: `${o.fisicoPct}%`,
          }))}
        />
      </ModuleSection>
    </div>
  );
}
