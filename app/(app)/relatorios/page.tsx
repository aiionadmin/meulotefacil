"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { FilterBar, notify } from "@/components/app/ModuleToolkit";
import { downloadCsv } from "@/lib/export/list-export";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFluxo } from "@/lib/store/fluxo-store";
import { cn } from "@/lib/utils";

export default function RelatoriosPage() {
  const { state, toggleReportFavorite, runReport } = useFluxo();
  const { state: cart, saldoDevedor } = useCarteira();
  const [q, setQ] = useState("");
  const [grupo, setGrupo] = useState("todos");

  const grupos = useMemo(
    () => ["todos", ...new Set(state.reports.map((r) => r.grupo))],
    [state.reports]
  );

  const filtered = useMemo(() => {
    let list = state.reports;
    if (grupo !== "todos") list = list.filter((r) => r.grupo === grupo);
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((r) =>
        [r.grupo, r.nome].join(" ").toLowerCase().includes(term)
      );
    }
    return list;
  }, [state.reports, q, grupo]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Central de relatórios"
        description="favoritos, execução em tela e histórico recente."
      />

      <ModuleSection title="Relatórios financeiros LoteWin (H26)">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadCsv(
                "posicao-financeira.csv",
                ["contrato", "cliente", "empreendimento", "status", "saldo"],
                cart.contracts.map((c) => [
                  c.numero,
                  c.compradorNome,
                  c.empNome,
                  c.status,
                  saldoDevedor(c.id),
                ])
              );
              notify("Posição financeira exportada");
            }}
          >
            Posição financeira
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadCsv(
                "previsao-carteira.csv",
                ["vencimento", "contrato", "cliente", "valor", "status"],
                cart.installments
                  .filter((i) => i.status !== "paga" && i.status !== "cancelada")
                  .map((i) => [
                    i.vencimento,
                    i.contratoNumero,
                    i.compradorNome,
                    i.valor,
                    i.status,
                  ])
              );
              notify("Previsão da carteira exportada");
            }}
          >
            Previsão da carteira
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadCsv(
                "inadimplencia.csv",
                ["contrato", "cliente", "vencimento", "valor", "atraso"],
                cart.installments
                  .filter((i) => i.status === "vencida")
                  .map((i) => [
                    i.contratoNumero,
                    i.compradorNome,
                    i.vencimento,
                    i.valor + i.juros + i.multa,
                    i.status,
                  ])
              );
              notify("Inadimplência exportada");
            }}
          >
            Inadimplência
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadCsv(
                "recebido-geral.csv",
                ["pago_em", "contrato", "cliente", "valor"],
                cart.installments
                  .filter((i) => i.status === "paga")
                  .map((i) => [
                    i.pagoEm ?? "",
                    i.contratoNumero,
                    i.compradorNome,
                    i.valor,
                  ])
              );
              notify("Geral recebido exportado");
            }}
          >
            Geral recebido
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadCsv(
                "socios.csv",
                ["empreendimento", "socio", "documento", "percentual"],
                cart.socios.map((s) => {
                  const emp =
                    cart.developments.find((d) => d.id === s.developmentId)
                      ?.nome ?? s.developmentId;
                  return [emp, s.nome, s.documento, s.percentual];
                })
              );
              notify("Relatório dos sócios exportado");
            }}
          >
            Sócios
          </Button>
        </div>
      </ModuleSection>

      <ModuleSection title="Relatórios técnicos LoteWin (H27)">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["lotes-status", "Lotes por status", () =>
                cart.lots.map((l) => [l.empNome, `${l.quadra}/${l.lote}`, l.status, l.valor])
              ],
              ["lotes-vagos", "Vagos", () =>
                cart.lots.filter((l) => l.status === "disponivel").map((l) => [l.empNome, `${l.quadra}/${l.lote}`, l.area, l.valor])
              ],
              ["vendidos", "Vendidos", () =>
                cart.lots.filter((l) => l.status === "vendido" || l.status === "quitado").map((l) => [l.empNome, `${l.quadra}/${l.lote}`, l.compradorNome ?? "", l.valor])
              ],
              ["historico-lotes", "Histórico de lotes", () =>
                cart.lotHistory.map((h) => [h.lotId, h.de, h.para, h.motivo, h.quando])
              ],
              ["reajustes", "Reajustes anuais", () =>
                cart.adjustments.map((a) => [a.indice, a.fator, a.ano, a.mesBase, a.qtdParcelas, a.desfeito ? "sim" : "nao"])
              ],
              ["quitados", "Quitados", () =>
                cart.contracts.filter((c) => c.status === "quitado").map((c) => [c.numero, c.compradorNome, c.empNome, c.preco])
              ],
            ] as const
          ).map(([id, label, rows]) => (
            <Button
              key={id}
              size="sm"
              variant="outline"
              onClick={() => {
                const data = rows();
                downloadCsv(
                  `${id}.csv`,
                  ["c1", "c2", "c3", "c4", "c5", "c6"].slice(0, (data[0]?.length ?? 1)),
                  data
                );
                notify(`${label} exportado`);
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      </ModuleSection>

      <KpiGrid
        items={[
          { label: "Relatórios", value: state.reports.length },
          {
            label: "Favoritos",
            value: state.reports.filter((r) => r.favorito).length,
          },
          { label: "Executados", value: state.reportRuns.length },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar relatório…">
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={grupo}
          onChange={(e) => setGrupo(e.target.value)}
        >
          {grupos.map((g) => (
            <option key={g} value={g}>
              {g === "todos" ? "Todos os grupos" : g}
            </option>
          ))}
        </select>
      </FilterBar>

      <DataTable
        columns={[
          { key: "fav", label: "" },
          { key: "grupo", label: "Grupo" },
          { key: "nome", label: "Relatório" },
          { key: "acao", label: "" },
        ]}
        rows={filtered.map((r) => ({
          fav: (
            <button
              type="button"
              aria-label="Favorito"
              onClick={() => toggleReportFavorite(r.id)}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  r.favorito
                    ? "fill-brand-orange text-brand-orange"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ),
          grupo: r.grupo,
          nome: r.nome,
          acao: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                runReport(r.id);
                notify("Relatório gerado", r.nome);
              }}
            >
              Executar
            </Button>
          ),
        }))}
      />

      <ModuleSection title="Últimas execuções">
        <DataTable
          columns={[
            { key: "nome", label: "Relatório" },
            { key: "quando", label: "Quando" },
            { key: "saida", label: "Saída" },
          ]}
          rows={state.reportRuns.map((r) => ({
            nome: r.nome,
            quando: r.quando,
            saida: <StatusPill tone="ok">tela</StatusPill>,
          }))}
        />
      </ModuleSection>
    </div>
  );
}
