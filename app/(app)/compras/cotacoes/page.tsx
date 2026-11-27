"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import { Input } from "@/components/ui/input";
import {
  AttachDropZone,
  DetailRow,
  DetailSheet,
  Field,
  FilterBar,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useCompras } from "@/lib/store/compras-store";
import { parseCotacaoPdf } from "@/lib/compras/cotacao-pdf";
import type { Cotacao } from "@/lib/domain/compras-types";

export default function CotacoesPage() {
  const {
    state,
    setVencedor,
    setPrecoCotacao,
    addArquivoCotacao,
    gerarOrdensDaCotacao,
  } = useCompras();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Cotacao | null>(null);
  const [aba, setAba] = useState<
    "itens" | "fornecedores" | "mapa" | "arquivos"
  >("mapa");
  const [pdfFornecedor, setPdfFornecedor] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.cotacoes;
    return state.cotacoes.filter((c) =>
      [c.numero, c.descricao, c.centro.label, c.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.cotacoes, q]);

  const live = selected
    ? state.cotacoes.find((c) => c.id === selected.id) ?? selected
    : null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Cotação"
        description="Mapa de cotação item × fornecedor; gera Ordem de Compra a partir dos vencedores."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/compras/solicitacoes">Solicitação</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/compras/ordens">Ordem de Compra</Link>
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Cotações", value: state.cotacoes.length },
          {
            label: "Cotadas",
            value: state.cotacoes.filter((c) => c.status === "cotado").length,
          },
          {
            label: "Finalizadas",
            value: state.cotacoes.filter((c) => c.status === "finalizado")
              .length,
          },
          {
            label: "OC sem cotação",
            value: state.config.permitirOcSemCotacao ? "permitido" : "bloqueado",
          },
        ]}
      />

      <FilterBar
        value={q}
        onChange={setQ}
        placeholder="Buscar cotação…"
      />

      <ModuleSection title="Lista">
        <PaginatedTable
          columns={[
            { key: "numero", label: "Nº" },
            { key: "desc", label: "Descrição" },
            { key: "centro", label: "Centro" },
            { key: "itens", label: "Itens" },
            { key: "forn", label: "Fornecedores" },
            { key: "criacao", label: "Criação" },
            { key: "nec", label: "Necessidade" },
            { key: "status", label: "Status" },
          ]}
          rows={filtered.map((c) => ({
            numero: (
              <button
                type="button"
                className="font-medium hover:text-brand-orange"
                onClick={() => {
                  setSelected(c);
                  setAba("mapa");
                }}
              >
                {c.numero}
              </button>
            ),
            desc: (
              <span>
                {c.descricao}
                {c.prioridade ? (
                  <StatusPill tone="danger"> prioridade</StatusPill>
                ) : null}
              </span>
            ),
            centro: c.centro.label,
            itens: c.itens.length,
            forn: c.fornecedores.length,
            criacao: `${formatDateBR(c.criadoEm)} · ${c.solicitante}`,
            nec: c.necessidade ? formatDateBR(c.necessidade) : "—",
            status: (
              <StatusPill tone="info">
                {c.status.replace(/_/g, " ")}
              </StatusPill>
            ),
          }))}
        />
      </ModuleSection>

      <DetailSheet
        open={!!live}
        onOpenChange={(o) => !o && setSelected(null)}
        title={live?.numero ?? ""}
      >
        {live ? (
          <div className="space-y-4">
            <DetailRow label="Descrição" value={live.descricao} />
            <DetailRow label="Centro" value={live.centro.label} />
            <DetailRow label="Status" value={live.status} />
            <DetailRow
              label="SC origem"
              value={
                state.solicitacoes.find((s) => s.id === live.requestId)
                  ?.numero ?? "—"
              }
            />

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["itens", "Itens"],
                  ["fornecedores", "Fornecedores"],
                  ["mapa", "Mapa"],
                  ["arquivos", "Arquivos"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAba(id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    aba === id
                      ? "bg-brand-green text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {aba === "itens" ? (
              <ul className="space-y-1 text-sm">
                {live.itens.map((it) => (
                  <li key={it.id}>
                    {it.descricao} · {it.quantidade} {it.unidade} · orç.{" "}
                    {formatBRL(it.valorOrcamento)}
                  </li>
                ))}
              </ul>
            ) : null}

            {aba === "fornecedores" ? (
              <ul className="space-y-2 text-sm">
                {live.fornecedores.map((f) => (
                  <li key={f.id} className="rounded border p-2">
                    <div className="font-medium">{f.fornecedor}</div>
                    <div className="text-muted-foreground">
                      {f.contato} · {f.email} · {f.telefone}
                    </div>
                    <div className="text-xs">
                      Qualificação {f.qualificacao}/5 · link público /cotacao/
                      {f.publicToken}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {aba === "mapa" ? (
              <div className="space-y-3 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="py-1 pr-2">Item</th>
                      {live.fornecedores.map((f) => (
                        <th key={f.id} className="py-1 px-1">
                          {f.fornecedor}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {live.itens.map((it) => (
                      <tr key={it.id} className="border-b align-top">
                        <td className="py-2 pr-2">
                          <div className="font-medium">{it.descricao}</div>
                          <div className="text-muted-foreground">
                            orç. {formatBRL(it.valorOrcamento)}
                          </div>
                        </td>
                        {live.fornecedores.map((f) => {
                          const p = live.precos.find(
                            (x) =>
                              x.itemId === it.id && x.supplierId === f.id
                          );
                          if (!p) return <td key={f.id}>—</td>;
                          const prices = live.precos.filter(
                            (x) => x.itemId === it.id
                          );
                          const best = Math.min(
                            ...prices.map((x) => x.precoUnitario)
                          );
                          const isBest = p.precoUnitario === best;
                          return (
                            <td key={f.id} className="py-2 px-1">
                              <div
                                className={`rounded px-1.5 py-1 ${
                                  p.vencedor
                                    ? "bg-brand-green/15 ring-1 ring-brand-green"
                                    : isBest
                                      ? "bg-amber-50"
                                      : ""
                                }`}
                              >
                                <Input
                                  type="number"
                                  className="h-8 text-xs"
                                  value={p.precoUnitario}
                                  onChange={(e) => {
                                    setPrecoCotacao(
                                      live.id,
                                      it.id,
                                      f.id,
                                      Number(e.target.value) || 0
                                    );
                                  }}
                                />
                                <button
                                  type="button"
                                  className="mt-1 text-[10px] text-brand-orange hover:underline"
                                  onClick={() => {
                                    setVencedor(live.id, it.id, f.id);
                                    notify(
                                      `Vencedor: ${f.fornecedor} · ${it.descricao}`
                                    );
                                  }}
                                >
                                  {p.vencedor
                                    ? "★ Vencedor"
                                    : isBest
                                      ? "Melhor · escolher"
                                      : "Escolher"}
                                </button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button
                  size="sm"
                  disabled={live.status === "finalizado"}
                  onClick={() => {
                    const ocs = gerarOrdensDaCotacao(live.id);
                    if (!ocs.length) {
                      notify("Escolha vencedores no mapa");
                      return;
                    }
                    notify(
                      `${ocs.length} OC gerada(s): ${ocs.map((o) => o.numero).join(", ")}`
                    );
                    setSelected(null);
                  }}
                >
                  Gerar ordens de compra
                </Button>
              </div>
            ) : null}

            {aba === "arquivos" ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Upload do orçamento do fornecedor em PDF. Preços são
                  preenchidos manualmente no mapa (parser/IA preparado).
                </p>
                <Field label="Fornecedor do PDF">
                  <select
                    className={fieldControlClass}
                    value={pdfFornecedor}
                    onChange={(e) => setPdfFornecedor(e.target.value)}
                  >
                    <option value="">—</option>
                    {live.fornecedores.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.fornecedor}
                      </option>
                    ))}
                  </select>
                </Field>
                <AttachDropZone
                  accept=".pdf,application/pdf"
                  multiple={false}
                  label="Arraste o PDF do fornecedor ou clique"
                  onFiles={async (files) => {
                    const f = files[0];
                    if (!f) return;
                    const parsed = await parseCotacaoPdf(f, {
                      fornecedor: live.fornecedores.find(
                        (x) => x.id === pdfFornecedor
                      )?.fornecedor,
                    });
                    addArquivoCotacao(
                      live.id,
                      f.name,
                      pdfFornecedor || undefined
                    );
                    notify("PDF anexado", parsed.aviso);
                  }}
                />
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(live.arquivos ?? []).length === 0 ? (
                    <li>Nenhum arquivo.</li>
                  ) : (
                    (live.arquivos ?? []).map((a) => (
                      <li key={a.id}>
                        {a.nome} · {formatDateBR(a.quando)}
                        {a.supplierId
                          ? ` · ${
                              live.fornecedores.find(
                                (f) => f.id === a.supplierId
                              )?.fornecedor ?? ""
                            }`
                          : ""}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
