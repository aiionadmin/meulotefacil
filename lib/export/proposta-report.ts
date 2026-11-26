/** D09 — PDF/HTML da proposta comercial. */

import type { Proposal } from "@/lib/domain/fluxo-types";
import { formatBRL } from "@/lib/masks/br";

export function buildPropostaHtml(p: Proposal): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
<title>Proposta ${esc(p.cliente)}</title>
<style>
body{font-family:Georgia,serif;max-width:720px;margin:2rem auto;color:#1a1a1a;line-height:1.5}
h1{font-size:1.4rem;margin:0 0 .5rem}
.meta{color:#555;font-size:.9rem;margin-bottom:1.5rem}
table{width:100%;border-collapse:collapse;margin:1rem 0}
td,th{border:1px solid #ddd;padding:.5rem .75rem;text-align:left}
th{background:#f4f4f0;font-size:.8rem;text-transform:uppercase;letter-spacing:.04em}
.foot{margin-top:2rem;font-size:.85rem;color:#555}
@media print{body{margin:0}}
</style></head><body>
<h1>Proposta comercial</h1>
<p class="meta">Meu Lote Fácil · validade ${esc(p.validade)} · ${esc(p.status)}</p>
<table>
<tr><th>Cliente</th><td>${esc(p.cliente)}</td></tr>
<tr><th>Empreendimento</th><td>${esc(p.empNome)}</td></tr>
<tr><th>Lote / serviço</th><td>${esc(p.loteLabel)}</td></tr>
<tr><th>Valor</th><td>${formatBRL(p.valor)}</td></tr>
<tr><th>Entrada</th><td>${formatBRL(p.entrada)}</td></tr>
<tr><th>Parcelas</th><td>${p.parcelas}</td></tr>
<tr><th>Responsável</th><td>${esc(p.responsavel)}</td></tr>
</table>
<p class="foot">Documento gerado pelo Meu Lote Fácil. Não substitui o contrato.</p>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
}

export function downloadPropostaPdf(p: Proposal) {
  const html = buildPropostaHtml(p);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposta-${p.id}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
