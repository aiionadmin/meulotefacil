/** Exportação CSV / Excel-compatível / impressão (C16). Sem dependência xlsx. */

function escapeCsv(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
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
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Excel abre CSV com ; — alias semântico para C16. */
export function downloadExcel(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const name = filename.replace(/\.xlsx$/i, "").replace(/\.csv$/i, "");
  downloadCsv(`${name}.csv`, headers, rows);
}

export function printList(title: string) {
  const prev = document.title;
  document.title = title;
  window.print();
  document.title = prev;
}

/** C16 — PDF via HTML imprimível (sem dependência nativa). */
export function downloadListPdf(
  title: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const th = headers.map((h) => `<th>${esc(h)}</th>`).join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td>${esc(c == null ? "" : String(c))}</td>`).join("")}</tr>`
    )
    .join("");
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><title>${esc(title)}</title>
<style>
body{font-family:Georgia,serif;margin:1.5rem;color:#1a1a1a}
h1{font-size:1.2rem;margin:0 0 1rem}
table{width:100%;border-collapse:collapse;font-size:.85rem}
th,td{border:1px solid #ccc;padding:.35rem .5rem;text-align:left}
th{background:#f4f4f0}
@media print{body{margin:0}}
</style></head><body>
<h1>${esc(title)}</h1>
<table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
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
