/** D21 — relatório RDO em texto/HTML para download e impressão. */

import type { Rdo } from "@/lib/domain/obras-types";

export function buildRdoText(rdo: Rdo, obraNome: string): string {
  const lines: string[] = [
    `RDO nº ${rdo.numero} — ${obraNome}`,
    `Data: ${rdo.data}`,
    `Responsável: ${rdo.responsavel}`,
    `Status: ${rdo.status}`,
    rdo.prazoContratual ? `Prazo contratual: ${rdo.prazoContratual}` : "",
    "",
    "=== Clima ===",
    `Manhã: ${rdo.clima.manha.clima} / ${rdo.clima.manha.condicao}`,
    `Tarde: ${rdo.clima.tarde.clima} / ${rdo.clima.tarde.condicao}`,
    `Noite: ${rdo.clima.noite.clima} / ${rdo.clima.noite.condicao}`,
    rdo.clima.chuvaMm != null ? `Chuva: ${rdo.clima.chuvaMm} mm` : "",
    "",
    "=== Efetivo ===",
    ...rdo.efetivo.map(
      (e) =>
        `- ${e.tipo} · ${e.funcao} · ${e.quantidade} · ${e.horas}h${
          e.fornecedor ? ` · ${e.fornecedor}` : ""
        }`
    ),
    "",
    "=== Equipamentos ===",
    ...rdo.equipamentos.map(
      (e) => `- ${e.nome} · ${e.quantidade} · ${e.situacao} · ${e.horas}h`
    ),
    "",
    "=== Atividades ===",
    ...rdo.atividades.map(
      (a) =>
        `- ${a.descricao} · ${a.situacao} · qtd ${a.quantidade} · físico ${a.fisicoAcumulado}%`
    ),
    "",
    "=== Materiais ===",
    ...rdo.materiais.map(
      (m) =>
        `- ${m.descricao} · ${m.quantidade}${
          m.ordemCompra ? ` · OC ${m.ordemCompra}` : ""
        }`
    ),
    "",
    "=== Ocorrências ===",
    ...rdo.ocorrencias.map(
      (o) =>
        `- ${o.tipo}: ${o.descricao}${
          o.impactoPrazo ? " (impacto no prazo)" : ""
        }`
    ),
    "",
    rdo.observacoes ? `Observações: ${rdo.observacoes}` : "",
    "",
    "=== Assinaturas ===",
    ...(rdo.assinaturas ?? []).map(
      (a) => `- ${a.papel}: ${a.nome} · ${a.quando}`
    ),
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}

export function buildRdoHtml(rdo: Rdo, obraNome: string): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const text = buildRdoText(rdo, obraNome);
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><title>RDO ${rdo.numero}</title>
<style>
body{font-family:Georgia,serif;max-width:720px;margin:2rem auto;color:#1a1a1a;line-height:1.45}
h1{font-size:1.35rem;margin-bottom:.25rem}
pre{white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:.85rem;background:#f6f6f4;padding:1rem;border-radius:4px}
@media print{body{margin:0} pre{background:none}}
</style></head><body>
<h1>RDO nº ${rdo.numero} — ${esc(obraNome)}</h1>
<p>${esc(rdo.data)} · ${esc(rdo.responsavel)} · ${esc(rdo.status)}</p>
<pre>${esc(text)}</pre>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
}

export function downloadRdoPdfProxy(rdo: Rdo, obraNome: string) {
  const html = buildRdoHtml(rdo, obraNome);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `rdo-${rdo.numero}-${rdo.data}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
