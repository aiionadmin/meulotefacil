/** D21 — relatório RDO em texto/HTML para download e impressão. */

import type { Rdo } from "@/lib/domain/obras-types";
import {
  PRINT_DOC_CSS,
  buildPrintHeaderHtml,
  empresaFromEmitente,
  openPrintHtml,
  resolveEmitenteLogoDataUrl,
  type PrintEmpresa,
} from "@/lib/export/print-document";

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

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function buildRdoHtml(
  rdo: Rdo,
  obraNome: string,
  opts?: { cnpj?: string; empresa?: Partial<PrintEmpresa> }
): Promise<string> {
  const { emitente, logoDataUrl } = await resolveEmitenteLogoDataUrl(
    opts?.cnpj
  );
  const empresa = empresaFromEmitente(emitente, opts?.empresa);
  const text = buildRdoText(rdo, obraNome);
  const header = buildPrintHeaderHtml({
    empresa,
    logoDataUrl,
    titulo: `RDO nº ${rdo.numero}`,
    subtitulo: `${obraNome} · ${rdo.data} · ${rdo.status}`,
  });
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><title>RDO ${rdo.numero}</title>
<style>
${PRINT_DOC_CSS}
pre{white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:.85rem;background:var(--paper);padding:1rem;border:1px solid var(--line)}
@media print{pre{background:none}}
</style></head><body><div class="page">
${header}
<p style="font-size:.9rem;color:var(--mut)">${esc(rdo.responsavel)}</p>
<pre>${esc(text)}</pre>
<footer class="foot">${esc(empresa.razaoSocial)} · RDO gerado pelo sistema</footer>
</div></body></html>`;
}

export async function downloadRdoPdfProxy(
  rdo: Rdo,
  obraNome: string,
  opts?: { cnpj?: string; empresa?: Partial<PrintEmpresa> }
) {
  const html = await buildRdoHtml(rdo, obraNome, opts);
  openPrintHtml(html, `rdo-${rdo.numero}-${rdo.data}`);
}
