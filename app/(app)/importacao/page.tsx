"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { fieldControlClass, notify } from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useOperacoes } from "@/lib/store/operacoes-store";
import { LOTEWIN_PANEL_2026_11_24 } from "@/lib/domain/operacoes-seed";
import {
  downloadTextTemplate,
  downloadCsv,
} from "@/lib/export/list-export";
import { useCarteira } from "@/lib/store/carteira-store";
import { previewLotewinMdb } from "@/lib/import/mdb-reader";
import {
  runLotewinConference,
  conferenceSummary,
} from "@/lib/import/conference";
import {
  type C17EntityId,
  c17Headers,
  modeloC17Csv,
  parseC17Csv,
} from "@/lib/import/c17-csv";

const EXCEL_MODELS: {
  id: string;
  label: string;
  headers: string[];
  c17?: C17EntityId;
}[] = [
  {
    id: "quadras_lotes",
    label: "Quadras e lotes (C04)",
    headers: ["quadra", "lote", "area_m2", "valor", "status"],
  },
  {
    id: "clientes",
    label: "Clientes (C17)",
    headers: c17Headers("clientes"),
    c17: "clientes",
  },
  {
    id: "fornecedores",
    label: "Fornecedores (C17)",
    headers: c17Headers("fornecedores"),
    c17: "fornecedores",
  },
  {
    id: "profissionais",
    label: "Profissionais (C17)",
    headers: c17Headers("profissionais"),
    c17: "profissionais",
  },
  {
    id: "insumos",
    label: "Insumos (C17)",
    headers: c17Headers("insumos"),
    c17: "insumos",
  },
  {
    id: "composicoes",
    label: "Composições (C17)",
    headers: c17Headers("composicoes"),
    c17: "composicoes",
  },
  {
    id: "lancamentos",
    label: "Lançamentos (C17)",
    headers: c17Headers("lancamentos"),
    c17: "lancamentos",
  },
  {
    id: "faturamentos",
    label: "Faturamentos (C17)",
    headers: c17Headers("faturamentos"),
    c17: "faturamentos",
  },
];

export default function ImportacaoPage() {
  const { state, runImportEntity, runImportAllDemo } = useOperacoes();
  const { massGenerateLots, state: carteira } = useCarteira();
  const [conferenceRows, setConferenceRows] = useState<
    { linha: number; payload: string; erros: string[]; acao: string }[]
  >([]);
  const [mdbNote, setMdbNote] = useState<string>("");
  const [k03, setK03] = useState<ReturnType<typeof runLotewinConference> | null>(
    null
  );
  const [c17Entity, setC17Entity] = useState<C17EntityId | "lotes">("clientes");
  const [c17Summary, setC17Summary] = useState<string>("");

  const ok = state.importQueue.filter((e) => e.status === "ok").length;
  const parcial = state.importQueue.filter((e) => e.status === "parcial").length;
  const confOk = state.conference.filter((c) => c.actual === c.expected).length;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Importação e conferência"
        description="11 entidades idempotentes, .mdb LoteWin, conferência 24/11/2026 e anti-duplicação de receita."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                runImportAllDemo();
                notify("Importação demo concluída", "conferência atualizada");
              }}
            >
              Simular importação completa
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Entidades", value: state.importQueue.length },
          { label: "OK", value: ok },
          { label: "Parcial", value: parcial },
          {
            label: "Conferência",
            value: `${confOk}/${state.conference.length}`,
          },
        ]}
      />

      {state.lastImportAt ? (
        <p className="text-xs text-muted-foreground">
          Última simulação: {state.lastImportAt}
        </p>
      ) : null}

      <ModuleSection title="LoteWin Access (.mdb) — K02">
        <p className="mb-3 text-sm text-muted-foreground">
          Quando a cópia do banco for entregue, envie o .mdb aqui. A importação
          real segue em <code>scripts/import/run.ts</code> (idempotente por
          legacy_id).
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="file"
            accept=".mdb,.accdb"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              const res = await previewLotewinMdb(
                f ? { name: f.name, size: f.size } : null
              );
              if (!res.ok) {
                setMdbNote(res.reason);
                notify("MDB inválido", res.reason);
                return;
              }
              setMdbNote(
                `${res.note} · tabelas: ${res.tables
                  .map((tb) => `${tb.name} (${tb.rowCount})`)
                  .join(", ")}`
              );
              notify("MDB reconhecido", f?.name ?? "");
            }}
          />
          <span className="rounded-sm border border-border bg-card px-3 py-1.5 hover:bg-paper-muted">
            Enviar Finance.mdb
          </span>
        </label>
        {mdbNote ? (
          <p className="mt-3 text-xs text-muted-foreground">{mdbNote}</p>
        ) : null}
      </ModuleSection>

      <ModuleSection title="Conferência painel 24/11/2026 — K03">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const checks = runLotewinConference({
                empreendimentos: LOTEWIN_PANEL_2026_11_24.empreendimentos,
                lotes: LOTEWIN_PANEL_2026_11_24.lotes,
                lotesVendidos: LOTEWIN_PANEL_2026_11_24.lotesVendidos,
                clientes: LOTEWIN_PANEL_2026_11_24.clientes,
                contratos: LOTEWIN_PANEL_2026_11_24.contratos,
                contratosAtivos: LOTEWIN_PANEL_2026_11_24.contratosAtivos,
                aReceber: LOTEWIN_PANEL_2026_11_24.aReceber,
                emAtraso: LOTEWIN_PANEL_2026_11_24.emAtraso,
              });
              setK03(checks);
              const s = conferenceSummary(checks);
              notify(
                s.allOk ? "Conferência OK" : "Divergências",
                `${s.ok}/${s.total} indicadores`
              );
            }}
          >
            Rodar conferência (metas)
          </Button>
        </div>
        {k03 ? (
          <DataTable
            columns={[
              { key: "label", label: "Indicador" },
              { key: "expected", label: "Esperado" },
              { key: "actual", label: "Atual" },
              { key: "status", label: "Status" },
            ]}
            rows={k03.map((c) => ({
              label: c.label,
              expected:
                c.unit === "money" ? formatBRL(c.expected) : String(c.expected),
              actual:
                c.unit === "money" ? formatBRL(c.actual) : String(c.actual),
              status: (
                <StatusPill tone={c.ok ? "ok" : "danger"}>
                  {c.ok ? "OK" : `Δ ${c.delta}`}
                </StatusPill>
              ),
            }))}
          />
        ) : null}
      </ModuleSection>

      <ModuleSection title="Modelos Excel / CSV">
        <div className="mb-4 flex flex-wrap gap-2">
          {EXCEL_MODELS.map((m) => (
            <Button
              key={m.id}
              size="sm"
              variant="outline"
              onClick={() => {
                if (m.c17) {
                  downloadTextTemplate(
                    `modelo-${m.id}.csv`,
                    modeloC17Csv(m.c17)
                  );
                } else {
                  downloadCsv(`modelo-${m.id}.csv`, m.headers, [
                    ["A", "01", "250", "180000", "disponivel"],
                  ]);
                }
                notify(`Modelo ${m.label} baixado`);
              }}
            >
              {m.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadTextTemplate(
                "modelo-quadras-lotes.txt",
                "quadra;lote;area_m2;valor;status\nA;01;250;180000;disponivel\n"
              );
              notify("Modelo texto baixado");
            }}
          >
            Modelo .txt (fallback)
          </Button>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted-foreground">Entidade</label>
          <select
            className={fieldControlClass + " max-w-[220px]"}
            value={c17Entity}
            onChange={(e) =>
              setC17Entity(e.target.value as C17EntityId | "lotes")
            }
          >
            <option value="lotes">Quadras e lotes (C04)</option>
            {(
              [
                "clientes",
                "fornecedores",
                "profissionais",
                "insumos",
                "composicoes",
                "lancamentos",
                "faturamentos",
              ] as C17EntityId[]
            ).map((id) => (
              <option key={id} value={id}>
                {id} (C17)
              </option>
            ))}
          </select>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="file"
            accept=".csv,.xlsx,.xls,text/csv"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const text = await f.text();
              let summary = f.name;
              if (c17Entity === "lotes") {
                const lines = text
                  .split(/\r?\n/)
                  .map((l) => l.trim())
                  .filter(Boolean);
                const rows = lines.slice(1).map((line, i) => {
                  const cols = line.split(/[;,]/);
                  const erros: string[] = [];
                  if (!cols[0]) erros.push("quadra vazia");
                  if (!cols[1]) erros.push("lote vazio");
                  return {
                    linha: i + 2,
                    payload: line,
                    erros,
                    acao: erros.length ? "corrigir" : "criar",
                  };
                });
                setConferenceRows(rows);
                summary = `${rows.length} linhas · ${rows.filter((r) => r.erros.length).length} com erro`;
                setC17Summary(summary);
              } else {
                const preview = parseC17Csv(c17Entity, text);
                setConferenceRows(
                  preview.rows.map((r) => ({
                    linha: r.linha,
                    payload: Object.entries(r.payload)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(" · "),
                    erros: r.erros,
                    acao: r.acao,
                  }))
                );
                summary = `${preview.criar} criar · ${preview.atualizar} atualizar · ${preview.erros} com erro`;
                setC17Summary(summary);
              }
              notify("Conferência pronta", summary);
            }}
          />
          <span className="rounded-sm border border-border bg-card px-3 py-1.5 hover:bg-paper-muted">
            Enviar planilha (CSV)
          </span>
        </label>
        {c17Summary ? (
          <p className="mt-2 text-xs text-muted-foreground">{c17Summary}</p>
        ) : null}
        {conferenceRows.length > 0 ? (
          <div className="mt-4 space-y-3">
            <DataTable
              columns={[
                { key: "linha", label: "Linha" },
                { key: "payload", label: "Dados" },
                { key: "erros", label: "Erros" },
                { key: "acao", label: "Ação" },
              ]}
              rows={conferenceRows.map((r) => ({
                linha: r.linha,
                payload: r.payload,
                erros: r.erros.length ? r.erros.join("; ") : "—",
                acao: r.acao,
              }))}
            />
            <Button
              size="sm"
              onClick={() => {
                const valid = conferenceRows.filter((r) => !r.erros.length);
                if (
                  carteira.developments[0] &&
                  valid.length > 0
                ) {
                  massGenerateLots({
                    developmentId: carteira.developments[0].id,
                    quadra: "IMP",
                    qtd: Math.min(valid.length, 10),
                    area: 250,
                    valor: 180000,
                  });
                }
                notify(
                  "Importação aplicada",
                  `${valid.length} linhas ok · relatório final`
                );
                setConferenceRows([]);
              }}
            >
              Criar / atualizar linhas válidas
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="ml-2"
              onClick={() => {
                downloadCsv(
                  "relatorio-importacao.csv",
                  ["linha", "payload", "erros", "acao"],
                  conferenceRows.map((r) => [
                    r.linha,
                    r.payload,
                    r.erros.join("; "),
                    r.acao,
                  ])
                );
                notify("Relatório final exportado");
              }}
            >
              Relatório final
            </Button>
          </div>
        ) : null}
        <p className="mt-3 text-xs text-muted-foreground">
          Gerar lotes em massa permanece em Empreendimentos.
        </p>
      </ModuleSection>

      <ModuleSection title="Fila de importação">
        <DataTable
          columns={[
            { key: "ordem", label: "#" },
            { key: "entidade", label: "Entidade" },
            { key: "sistema", label: "Origem" },
            { key: "esperado", label: "Esperado" },
            { key: "importado", label: "Importado" },
            { key: "status", label: "Status" },
            { key: "acao", label: "" },
          ]}
          rows={state.importQueue.map((e) => ({
            ordem: e.ordem,
            entidade: e.entidade,
            sistema: e.legacySystem,
            esperado: e.expected.toLocaleString("pt-BR"),
            importado: e.imported.toLocaleString("pt-BR"),
            status: (
              <StatusPill
                tone={
                  e.status === "ok"
                    ? "ok"
                    : e.status === "parcial"
                      ? "warn"
                      : e.status === "divergente"
                        ? "danger"
                        : "neutral"
                }
              >
                {e.status}
              </StatusPill>
            ),
            acao: (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  runImportEntity(e.id);
                  notify(`Importou ${e.entidade}`);
                }}
              >
                Rodar
              </Button>
            ),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Conferência painel LoteWin (24/11/2026)">
        <p className="mb-3 text-sm text-muted-foreground">
          Alvo: {LOTEWIN_PANEL_2026_11_24.empreendimentos} empreendimentos ·{" "}
          {LOTEWIN_PANEL_2026_11_24.lotes.toLocaleString("pt-BR")} lotes · a
          receber {formatBRL(LOTEWIN_PANEL_2026_11_24.aReceber)}.
        </p>
        <DataTable
          columns={[
            { key: "label", label: "Métrica" },
            { key: "esperado", label: "Esperado" },
            { key: "atual", label: "Atual no sistema" },
            { key: "delta", label: "Diferença" },
            { key: "status", label: "Status" },
          ]}
          rows={state.conference.map((c) => {
            const delta = c.actual - c.expected;
            const match = c.actual === c.expected;
            const fmt = (n: number) =>
              c.unit === "money"
                ? formatBRL(n)
                : n.toLocaleString("pt-BR");
            return {
              label: c.label,
              esperado: fmt(c.expected),
              atual: fmt(c.actual),
              delta: fmt(delta),
              status: (
                <StatusPill tone={match ? "ok" : "warn"}>
                  {match ? "bate" : "divergente"}
                </StatusPill>
              ),
            };
          })}
        />
      </ModuleSection>
    </div>
  );
}
