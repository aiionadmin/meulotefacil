/** D09 — PDF/HTML da proposta comercial com logo e dados da empresa. */

import type { Proposal } from "@/lib/domain/fluxo-types";
import { formatBRL } from "@/lib/masks/br";
import {
  PRINT_DOC_CSS,
  buildPrintHeaderHtml,
  empresaFromEmitente,
  openPrintHtml,
  resolveEmitenteLogoDataUrl,
  type PrintEmpresa,
} from "@/lib/export/print-document";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function buildPropostaHtml(
  p: Proposal,
  opts?: { cnpj?: string; empresa?: Partial<PrintEmpresa> }
): Promise<string> {
  const { emitente, logoDataUrl } = await resolveEmitenteLogoDataUrl(
    opts?.cnpj
  );
  const empresa = empresaFromEmitente(emitente, opts?.empresa);
  const header = buildPrintHeaderHtml({
    empresa,
    logoDataUrl,
    titulo: "Proposta comercial",
    subtitulo: `Validade ${p.validade} · ${p.status}`,
  });
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
<title>Proposta ${esc(p.cliente)}</title>
<style>
${PRINT_DOC_CSS}
table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.9rem}
td,th{border:1px solid var(--line);padding:.5rem .75rem;text-align:left}
th{background:var(--paper);font-size:.8rem;text-transform:uppercase;letter-spacing:.04em}
</style></head><body><div class="page">
${header}
<table>
<tr><th>Cliente</th><td>${esc(p.cliente)}</td></tr>
<tr><th>Empreendimento</th><td>${esc(p.empNome)}</td></tr>
<tr><th>Lote / serviço</th><td>${esc(p.loteLabel)}</td></tr>
<tr><th>Valor</th><td>${formatBRL(p.valor)}</td></tr>
<tr><th>Entrada</th><td>${formatBRL(p.entrada)}</td></tr>
<tr><th>Parcelas</th><td>${p.parcelas}</td></tr>
<tr><th>Responsável</th><td>${esc(p.responsavel)}</td></tr>
</table>
<footer class="foot">${esc(empresa.razaoSocial)} · documento gerado pelo sistema. Não substitui o contrato.</footer>
</div></body></html>`;
}

export async function downloadPropostaPdf(
  p: Proposal,
  opts?: { cnpj?: string; empresa?: Partial<PrintEmpresa> }
) {
  const html = await buildPropostaHtml(p, opts);
  openPrintHtml(html, `proposta-${p.id}`);
}
