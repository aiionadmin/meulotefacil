/** Exportação CSV / Excel-compatível / impressão (C16). Sem dependência xlsx. */

import {
  PRINT_DOC_CSS,
  buildPrintHeaderHtml,
  empresaFromEmitente,
  openPrintHtml,
  resolveEmitenteLogoDataUrl,
  type PrintEmpresa,
} from "@/lib/export/print-document";
import { resolveEmitente } from "@/lib/export/emitentes";

function escapeCsv(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Nome de arquivo estável: empreendimentos, leads, processos-reurb… */
export function exportFileSlug(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.(csv|xlsx|pdf|html)$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "lista";
}

/** Título legível no PDF: "processos-reurb" → "Processos REURB". */
export function exportTitleFromName(name: string): string {
  const cleaned = name
    .replace(/\.(csv|xlsx|pdf|html)$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (!cleaned) return "Lista";
  return cleaned
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bReurb\b/gi, "REURB")
    .replace(/\bPdf\b/g, "PDF")
    .replace(/\bCnab\b/gi, "CNAB")
    .replace(/\bOc\b/g, "OC")
    .replace(/\bNf\b/gi, "NF");
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const slug = exportFileSlug(filename);
  const lines = [
    headers.map(escapeCsv).join(";"),
    ...rows.map((r) => r.map(escapeCsv).join(";")),
  ];
  const blob = new Blob(["\ufeff" + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Excel abre CSV com ; — alias semântico para C16. */
export function downloadExcel(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  downloadCsv(filename, headers, rows);
}

export function printList(title: string) {
  const prev = document.title;
  document.title = exportTitleFromName(title);
  window.print();
  document.title = prev;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** C16 — PDF via HTML imprimível com logo + dados da empresa. */
export async function downloadListPdf(
  title: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
  opts?: {
    cnpj?: string;
    empresa?: Partial<PrintEmpresa>;
    /** Nome do arquivo baixado (ex.: empreendimentos, leads). */
    filename?: string;
  }
) {
  const displayTitle = exportTitleFromName(title);
  const filename = exportFileSlug(opts?.filename ?? title);
  const { emitente, logoDataUrl } = await resolveEmitenteLogoDataUrl(
    opts?.cnpj
  );
  const empresa = empresaFromEmitente(emitente, opts?.empresa);
  const th = headers.map((h) => `<th>${esc(h)}</th>`).join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td>${esc(c == null ? "" : String(c))}</td>`).join("")}</tr>`
    )
    .join("");
  const header = buildPrintHeaderHtml({
    empresa,
    logoDataUrl,
    titulo: displayTitle,
    subtitulo: `Emitente · ${emitente.nomeFantasia}`,
  });
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><title>${esc(displayTitle)}</title>
<style>
${PRINT_DOC_CSS}
table{width:100%;border-collapse:collapse;font-size:.85rem;margin-top:.5rem}
th,td{border:1px solid var(--line);padding:.35rem .5rem;text-align:left}
th{background:var(--paper);font-size:.72rem;text-transform:uppercase;letter-spacing:.04em}
</style></head><body><div class="page">
${header}
<table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>
<footer class="foot">${esc(empresa.razaoSocial)} · documento gerado pelo sistema</footer>
</div></body></html>`;
  openPrintHtml(html, filename);
}

/** Extrai texto de nós React simples (string/número/StatusPill). */
export function reactNodeText(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(reactNodeText).join(" ").trim();
  if (typeof node === "object" && node !== null && "props" in node) {
    const props = (node as { props?: { children?: unknown } }).props;
    return reactNodeText(props?.children);
  }
  return "";
}

export function downloadTextTemplate(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { resolveEmitente };
