"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { downloadCsv, downloadListPdf } from "@/lib/export/list-export";
import { useCarteira } from "@/lib/store/carteira-store";
import { useCompras } from "@/lib/store/compras-store";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import { useFluxo } from "@/lib/store/fluxo-store";
import { cn } from "@/lib/utils";

export default function RelatoriosPage() {
  const { state, toggleReportFavorite, runReport } = useFluxo();
  const { state: cart, saldoDevedor } = useCarteira();
  const { state: compras } = useCompras();
  const { state: fin, categoriaNome } = useFinanceiro();
  const [q, setQ] = useState("");
  const [grupo, setGrupo] = useState("todos");
  const [centroFin, setCentroFin] = useState("");

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
        actions={
          <Button size="sm" asChild>
            <Link href="/relatorios/empreendimento">
              Relatório do empreendimento
            </Link>
          </Button>
        }
      />

      <ModuleSection
        title="Relatório do empreendimento"
        description="Wizard com dados da empresa, logomarca do site e seções configuráveis (cartório, lotes, contratos…)."
      >
        <Button size="sm" asChild>
          <Link href="/relatorios/empreendimento">Abrir wizard</Link>
        </Button>
      </ModuleSection>

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
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadCsv(
                "relatorio-caixa.csv",
                [
                  "data",
                  "cliente",
                  "valor",
                  "forma",
                  "fechamento",
                  "estornado",
                ],
                cart.caixa.map((m) => [
                  m.data,
                  m.cliente,
                  m.valor,
                  m.forma,
                  m.fechamentoId ?? "aberto",
                  m.estornado ? "sim" : "nao",
                ])
              );
              notify("Relatório de caixa exportado");
            }}
          >
            Caixa (resumo)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadCsv(
                "fechamento-caixa.csv",
                [
                  "data",
                  "saldo_antes",
                  "entradas",
                  "estornos",
                  "saldo_depois",
                  "movimentos",
                  "quem",
                ],
                (cart.caixaFechamentos ?? []).map((f) => [
                  f.data,
                  f.saldoAntes,
                  f.entradas,
                  f.estornos,
                  f.saldoDepois,
                  f.qtdMovimentos,
                  f.quem,
                ])
              );
              notify("Fechamento de caixa exportado");
            }}
          >
            Fechamento caixa
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const hoje = new Date().toISOString().slice(0, 10);
              downloadCsv(
                "parcelas-adiantadas.csv",
                ["contrato", "cliente", "vencimento", "pago_em", "valor"],
                cart.installments
                  .filter(
                    (i) =>
                      i.status === "paga" &&
                      i.pagoEm &&
                      i.pagoEm < i.vencimento
                  )
                  .map((i) => [
                    i.contratoNumero,
                    i.compradorNome,
                    i.vencimento,
                    i.pagoEm ?? "",
                    i.valor,
                  ])
              );
              notify("Parcelas adiantadas exportadas", hoje);
            }}
          >
            Parcelas adiantadas
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadCsv(
                "vendas-recebimentos-lotes.csv",
                [
                  "contrato",
                  "cliente",
                  "empreendimento",
                  "preco",
                  "status",
                  "saldo",
                ],
                cart.contracts.map((c) => [
                  c.numero,
                  c.compradorNome,
                  c.empNome,
                  c.preco,
                  c.status,
                  saldoDevedor(c.id),
                ])
              );
              notify("Vendas e recebimentos exportados");
            }}
          >
            Vendas × recebimentos
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadCsv(
                "historico-inadimplencia.csv",
                ["contrato", "cliente", "vencimento", "valor", "juros", "multa"],
                cart.installments
                  .filter((i) => i.status === "vencida" || i.juros > 0)
                  .map((i) => [
                    i.contratoNumero,
                    i.compradorNome,
                    i.vencimento,
                    i.valor,
                    i.juros,
                    i.multa,
                  ])
              );
              notify("Histórico de inadimplência exportado");
            }}
          >
            Hist. inadimplência
          </Button>
        </div>
      </ModuleSection>

      <ModuleSection title="Relatórios financeiros (réplica)">
        <div className="mb-3 flex flex-wrap gap-2">
          <input
            className="h-9 max-w-xs rounded-md border border-input bg-white px-3 text-sm"
            placeholder="Filtrar centro de custo…"
            value={centroFin}
            onChange={(e) => setCentroFin(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const term = centroFin.trim().toLowerCase();
              const rows = fin.pagamentos.filter(
                (p) =>
                  !term || p.centroLabel.toLowerCase().includes(term)
              );
              const headers = [
                "vencimento",
                "status",
                "valor",
                "favorecido",
                "descricao",
                "categoria",
                "centro",
                "conta",
              ];
              const data = rows.map((p) => [
                p.vencimento,
                p.status,
                p.valor,
                p.favorecido,
                p.descricao,
                categoriaNome(p.categoriaId),
                p.centroLabel,
                p.contaId,
              ]);
              downloadCsv("pagamentos.csv", headers, data);
              downloadListPdf(
                "Pagamentos",
                headers,
                data.map((r) => r.map(String))
              );
              notify("Pagamentos exportados", `${rows.length} linhas`);
            }}
          >
            Pagamentos
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const term = centroFin.trim().toLowerCase();
              const rows = fin.recebimentos.filter(
                (r) =>
                  !term || r.centroLabel.toLowerCase().includes(term)
              );
              const headers = [
                "vencimento",
                "status",
                "valor",
                "cliente",
                "descricao",
                "centro",
                "origem",
              ];
              const data = rows.map((r) => [
                r.vencimento,
                r.status,
                r.valor,
                r.cliente,
                r.descricao,
                r.centroLabel,
                r.origem,
              ]);
              downloadCsv("recebimentos.csv", headers, data);
              downloadListPdf(
                "Recebimentos",
                headers,
                data.map((x) => x.map(String))
              );
              notify("Recebimentos exportados", `${rows.length} linhas`);
            }}
          >
            Recebimentos
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const term = centroFin.trim().toLowerCase();
              const rows = fin.lancamentos.filter(
                (l) =>
                  !term ||
                  l.centros.some((c) =>
                    c.label.toLowerCase().includes(term)
                  )
              );
              const headers = [
                "criado",
                "descricao",
                "favorecido",
                "valor",
                "vencimento",
                "centros",
              ];
              const data = rows.map((l) => [
                l.criadoEm,
                l.descricao,
                l.favorecido,
                l.valor,
                l.vencimento,
                l.centros.map((c) => c.label).join(" · "),
              ]);
              downloadCsv("lancamentos.csv", headers, data);
              downloadListPdf(
                "Lançamentos",
                headers,
                data.map((x) => x.map(String))
              );
              notify("Lançamentos exportados", `${rows.length} linhas`);
            }}
          >
            Lançamentos
          </Button>
        </div>
      </ModuleSection>

      <ModuleSection title="Relatórios de compras (E15)">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const rows: (string | number)[][] = [];
              for (const sc of compras.solicitacoes) {
                for (const it of sc.itens) {
                  rows.push([
                    sc.numero,
                    sc.centro.label,
                    it.descricao,
                    it.unidade,
                    it.quantidade,
                    it.quantidadeCotada,
                    it.quantidadeComprada,
                    it.quantidadeRecebida,
                  ]);
                }
              }
              downloadCsv(
                "insumos-orcados-x-comprados.csv",
                [
                  "sc",
                  "centro",
                  "item",
                  "un",
                  "orcado",
                  "cotado",
                  "comprado",
                  "recebido",
                ],
                rows
              );
              notify("Insumos orçados × comprados exportado");
            }}
          >
            Orçados × comprados
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadCsv(
                "extrato-compras.csv",
                [
                  "oc",
                  "fornecedor",
                  "centro",
                  "aprovacao",
                  "status",
                  "total",
                  "criado",
                ],
                compras.ordens.map((o) => [
                  o.numero,
                  o.fornecedor,
                  o.centro.label,
                  o.aprovacaoStatus,
                  o.compraStatus,
                  o.valor,
                  o.criadoEm,
                ])
              );
              notify("Extrato de compras exportado");
            }}
          >
            Extrato de compras
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
              ["cancelados", "Cancelados", () =>
                cart.contracts
                  .filter((c) => c.status === "cancelado")
                  .map((c) => [
                    c.numero,
                    c.compradorNome,
                    c.empNome,
                    c.status,
                    c.preco,
                  ])
              ],
              ["cobranca", "Cobrança", () =>
                cart.installments
                  .filter(
                    (i) => i.status === "vencida" || i.status === "em_aberto"
                  )
                  .map((i) => [
                    i.contratoNumero,
                    i.compradorNome,
                    i.vencimento,
                    i.valor + i.juros + i.multa,
                    i.status,
                  ])
              ],
              ["escrituras", "Escrituras", () =>
                cart.escrituras.map((e) => {
                  const c = cart.contracts.find((x) => x.id === e.contractId);
                  const cartorio =
                    cart.cartorios.find((x) => x.id === e.cartorioId)?.nome ??
                    e.cartorioId;
                  return [
                    c?.numero ?? e.contractId,
                    c?.compradorNome ?? "",
                    e.protocolo,
                    e.status,
                    cartorio,
                    e.data ?? "",
                  ];
                })
              ],
              ["lotes-plano", "Lotes por plano", () =>
                cart.lots.map((l) => {
                  const plano =
                    cart.paymentPlans.find(
                      (p) => p.developmentId === l.developmentId
                    )?.nome ?? "—";
                  return [
                    l.empNome,
                    `${l.quadra}/${l.lote}`,
                    l.status,
                    plano,
                    l.valor,
                  ];
                })
              ],
              ["residuos", "Resíduos", () =>
                cart.installments
                  .filter((i) => /res[ií]duo/i.test(i.tipo))
                  .map((i) => [
                    i.contratoNumero,
                    i.compradorNome,
                    i.vencimento,
                    i.valor,
                    i.status,
                  ])
              ],
              ["ficha-financeira", "Ficha financeira", () =>
                cart.contracts.map((c) => [
                  c.numero,
                  c.compradorNome,
                  c.empNome,
                  c.preco,
                  saldoDevedor(c.id),
                  c.status,
                ])
              ],
              ["veiculos-comms", "Veículos de comunicação", () =>
                cart.contracts.map((c) => [
                  c.numero,
                  c.compradorNome,
                  c.corretorNome ?? "direto",
                  c.tipoReajuste,
                  c.empNome,
                ])
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
