/** Cabeçalho formal (logo embutida + dados da empresa) para HTML imprimível / PDF. */

import {
  EMITENTES,
  formatEmitenteEndereco,
  resolveEmitente,
  type EmitenteDoc,
} from "@/lib/export/emitentes";

export type PrintEmpresa = {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  inscricaoEstadual?: string;
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Converte URL/caminho público em data URL (blob: print não carrega /brand/...). */
export async function fetchAsDataUrl(
  pathOrUrl: string
): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("data:")) return pathOrUrl;
  try {
    const url =
      pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")
        ? pathOrUrl
        : typeof window !== "undefined"
          ? `${window.location.origin}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`
          : pathOrUrl;
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function resolveEmitenteLogoDataUrl(
  cnpjOrId?: string | null
): Promise<{ emitente: EmitenteDoc; logoDataUrl: string | null }> {
  const emitente = resolveEmitente(cnpjOrId);
  const logoDataUrl = await fetchAsDataUrl(emitente.logoDocumentoPath);
  return { emitente, logoDataUrl };
}

export function empresaFromEmitente(
  emitente: EmitenteDoc,
  overlay?: Partial<PrintEmpresa>
): PrintEmpresa {
  return {
    razaoSocial: overlay?.razaoSocial || emitente.razaoSocial,
    nomeFantasia: overlay?.nomeFantasia || emitente.nomeFantasia,
    cnpj: overlay?.cnpj || emitente.cnpj,
    telefone: overlay?.telefone || emitente.telefone,
    email: overlay?.email || emitente.email,
    endereco: overlay?.endereco || emitente.endereco,
    bairro: overlay?.bairro || emitente.bairro,
    cidade: overlay?.cidade || emitente.cidade,
    uf: overlay?.uf || emitente.uf,
    cep: overlay?.cep || emitente.cep,
    inscricaoEstadual: overlay?.inscricaoEstadual,
  };
}

/** Bloco de cabeçalho reutilizável (logo data-URL + razão/CNPJ/endereço). */
export function buildPrintHeaderHtml(opts: {
  empresa: PrintEmpresa;
  logoDataUrl?: string | null;
  titulo: string;
  subtitulo?: string;
}): string {
  const { empresa, logoDataUrl, titulo, subtitulo } = opts;
  const ender = formatEmitenteEndereco(empresa);
  const logo = logoDataUrl
    ? `<img class="doc-logo" src="${esc(logoDataUrl)}" alt="${esc(empresa.nomeFantasia || empresa.razaoSocial)}" />`
    : `<div class="doc-logo-fallback">${esc(empresa.nomeFantasia || "Meu Lote Fácil")}</div>`;

  return `<header class="doc-header">
  <div class="doc-brand">${logo}</div>
  <div class="doc-meta">
    <h1>${esc(titulo)}</h1>
    ${subtitulo ? `<div class="doc-sub">${esc(subtitulo)}</div>` : ""}
    <div class="doc-emp">
      <strong>${esc(empresa.razaoSocial)}</strong>
      ${empresa.nomeFantasia ? ` · ${esc(empresa.nomeFantasia)}` : ""}
      <br/>CNPJ ${esc(empresa.cnpj)}
      ${ender ? `<br/>${esc(ender)}` : ""}
      ${empresa.telefone || empresa.email ? `<br/>${esc([empresa.telefone, empresa.email].filter(Boolean).join(" · "))}` : ""}
    </div>
  </div>
</header>`;
}

export const PRINT_DOC_CSS = `
:root{--ink:#1a1a1a;--mut:#555;--line:#d4d0c8;--brand:#ED8600;--paper:#faf8f4}
*{box-sizing:border-box}
body{font-family:"Montserrat",system-ui,sans-serif;margin:0;color:var(--ink);background:#fff;line-height:1.45}
.page{max-width:900px;margin:0 auto;padding:1.75rem 1.5rem 2.5rem}
.doc-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1.5rem;border-bottom:3px solid var(--brand);padding-bottom:1rem;margin-bottom:1.25rem}
.doc-logo{height:56px;width:auto;max-width:220px;object-fit:contain}
.doc-logo-fallback{font-weight:700;color:var(--brand);font-size:1.15rem}
.doc-meta{text-align:right;flex:1}
.doc-meta h1{font-size:1.25rem;margin:0 0 .25rem;font-weight:700}
.doc-sub{color:var(--mut);font-size:.85rem}
.doc-emp{margin-top:.55rem;font-size:.78rem;color:var(--mut);line-height:1.35}
.foot{margin-top:2rem;padding-top:.75rem;border-top:1px solid var(--line);font-size:.75rem;color:var(--mut)}
@media print{body{margin:0}.page{padding:0;max-width:none}@page{margin:12mm}}
`;

/**
 * Abre HTML imprimível. Com data-URLs a logo aparece no PDF.
 * Aguarda imagens antes de print (evita página sem logo).
 */
export function openPrintHtml(html: string, filename = "documento"): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".html") ? filename : `${filename}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  const tryPrint = () => {
    try {
      const imgs = Array.from(w.document.images || []);
      const pending = imgs.filter((img) => !img.complete);
      if (pending.length === 0) {
        w.focus();
        w.print();
        return;
      }
      let left = pending.length;
      const done = () => {
        left -= 1;
        if (left <= 0) {
          w.focus();
          w.print();
        }
      };
      pending.forEach((img) => {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
      // fallback se load nunca dispara
      setTimeout(() => {
        try {
          w.focus();
          w.print();
        } catch {
          /* ignore */
        }
      }, 2500);
    } catch {
      try {
        w.print();
      } catch {
        /* ignore */
      }
    }
  };

  // blob document may need a tick to parse
  setTimeout(tryPrint, 120);
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

export function defaultEmitenteMl(): EmitenteDoc {
  return EMITENTES.mlf;
}
