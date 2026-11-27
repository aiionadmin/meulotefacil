/** Proposta comercial a partir do orçamento da obra (HTML imprimível). */

import { formatBRL } from "@/lib/masks/br";
import type { Obra, OrcamentoNode } from "@/lib/domain/obras-types";
import { precoComBdi } from "@/lib/money/orcamento";

export function buildPropostaObraHtml(opts: {
  obra: Obra;
  nodes: OrcamentoNode[];
  custo: number;
  preco: number;
}): string {
  const { obra, nodes, custo, preco } = opts;
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const desconto = obra.proposta?.descontoPct ?? 0;
  const precoFinal = Math.round(preco * (1 - desconto / 100) * 100) / 100;
  const rows = nodes
    .filter((n) => n.kind === "item")
    .map(
      (n) =>
        `<tr><td>${esc(n.codigo)}</td><td>${esc(n.descricao)}</td><td>${n.quantidade} ${esc(n.unidade)}</td><td>${formatBRL(n.orcado)}</td><td>${formatBRL(precoComBdi(n.orcado, n.bdiPct))}</td></tr>`
    )
    .join("");
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
<title>Proposta · ${esc(obra.nome)}</title>
<style>
body{font-family:Georgia,serif;max-width:800px;margin:2rem auto;color:#1a1a1a;line-height:1.5}
h1{font-size:1.4rem;margin:0 0 .35rem}
.meta{color:#555;font-size:.9rem;margin-bottom:1.25rem}
table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.9rem}
td,th{border:1px solid #ddd;padding:.45rem .65rem;text-align:left}
th{background:#f4f4f0;font-size:.75rem;text-transform:uppercase;letter-spacing:.04em}
.totais{margin-top:1rem}
.foot{margin-top:2rem;font-size:.85rem;color:#555}
@media print{body{margin:0}}
</style></head><body>
<h1>Proposta comercial · ${esc(obra.nome)}</h1>
<p class="meta">Cliente ${esc(obra.clienteNome)} · Status ${esc(obra.propostaStatus.replace(/_/g, " "))} · ${esc(obra.proposta?.responsavel ?? obra.responsavelObra ?? "—")}</p>
<table>
<tr><th>Código</th><th>Item</th><th>Qtd</th><th>Custo</th><th>Preço</th></tr>
${rows || "<tr><td colspan=5>Sem itens no orçamento</td></tr>"}
</table>
<div class="totais">
<p>Custo total: <strong>${formatBRL(custo)}</strong></p>
<p>Preço com BDI: <strong>${formatBRL(preco)}</strong>${desconto ? ` · desconto ${desconto}%` : ""}</p>
<p>Preço da proposta: <strong>${formatBRL(precoFinal)}</strong></p>
<p>Condição: ${esc(obra.proposta?.condicaoPagamento ?? "A combinar")}</p>
</div>
<p class="foot">Documento gerado pelo Meu Lote Fácil. Não substitui o contrato.</p>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
}

export function downloadPropostaObra(opts: {
  obra: Obra;
  nodes: OrcamentoNode[];
  custo: number;
  preco: number;
}) {
  const html = buildPropostaObraHtml(opts);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposta-${opts.obra.codigo}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
