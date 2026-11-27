/** Relatório de empreendimento — HTML imprimível com logo e seções opcionais. */

import type {
  Contract,
  Development,
  EmpSocio,
  Lot,
} from "@/lib/domain/carteira-types";
import { formatBRL } from "@/lib/masks/br";
import { openPrintHtml } from "@/lib/export/print-document";

export type EmpReportSections = {
  empresa: boolean;
  logo: boolean;
  dadosEmp: boolean;
  cartorioCertidao: boolean;
  lotesResumo: boolean;
  lotesDetalhe: boolean;
  contratos: boolean;
  socios: boolean;
  planta: boolean;
};

export const DEFAULT_EMP_REPORT_SECTIONS: EmpReportSections = {
  empresa: true,
  logo: true,
  dadosEmp: true,
  cartorioCertidao: true,
  lotesResumo: true,
  lotesDetalhe: false,
  contratos: true,
  socios: false,
  planta: true,
};

export const EMP_REPORT_SECTION_LABELS: Record<
  keyof EmpReportSections,
  string
> = {
  empresa: "Dados da empresa",
  logo: "Logomarca do emitente",
  dadosEmp: "Dados do empreendimento",
  cartorioCertidao: "Cartório e certidão",
  lotesResumo: "Resumo de lotes por status",
  lotesDetalhe: "Lista completa de lotes",
  contratos: "Contratos do empreendimento",
  socios: "Sócios",
  planta: "Planta DXF / metadados",
};

export type EmpresaReportInfo = {
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

export type EmpReportInput = {
  empresa: EmpresaReportInfo;
  development: Development;
  lots: Lot[];
  contracts: Contract[];
  socios?: EmpSocio[];
  sections: EmpReportSections;
  /**
   * Logo do emitente. Preferir data URL (`fetchAsDataUrl`) —
   * blob:print não carrega `/brand/...` a tempo.
   */
  logoUrl?: string;
  geradoEm?: string;
};

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function countByStatus(lots: Lot[]): [string, number][] {
  const m = new Map<string, number>();
  for (const l of lots) {
    m.set(l.status, (m.get(l.status) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function buildEmpreendimentoReportHtml(input: EmpReportInput): string {
  const {
    empresa,
    development: d,
    lots,
    contracts,
    socios = [],
    sections,
    logoUrl,
    geradoEm = new Date().toLocaleString("pt-BR"),
  } = input;

  const parts: string[] = [];

  parts.push(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
<title>Relatório · ${esc(d.nome)}</title>
<style>
:root{--ink:#1a1a1a;--mut:#555;--line:#d4d0c8;--brand:#ED8600;--paper:#faf8f4}
*{box-sizing:border-box}
body{font-family:"Montserrat",system-ui,sans-serif;margin:0;color:var(--ink);background:#fff;line-height:1.45}
.page{max-width:900px;margin:0 auto;padding:1.75rem 1.5rem 2.5rem}
.header{display:flex;align-items:flex-start;justify-content:space-between;gap:1.5rem;border-bottom:3px solid var(--brand);padding-bottom:1rem;margin-bottom:1.25rem}
.header img{height:52px;width:auto;object-fit:contain}
.header h1{font-size:1.35rem;margin:0 0 .25rem;font-weight:700}
.header .sub{color:var(--mut);font-size:.85rem}
.section{margin:1.35rem 0}
.section h2{font-size:.95rem;text-transform:uppercase;letter-spacing:.06em;color:var(--brand);margin:0 0 .65rem;border-bottom:1px solid var(--line);padding-bottom:.35rem}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:.35rem 1.25rem;font-size:.9rem}
.grid .k{color:var(--mut);font-size:.75rem;text-transform:uppercase;letter-spacing:.04em}
.grid .v{font-weight:500}
table{width:100%;border-collapse:collapse;font-size:.82rem;margin-top:.35rem}
th,td{border:1px solid var(--line);padding:.4rem .55rem;text-align:left}
th{background:var(--paper);font-size:.72rem;text-transform:uppercase;letter-spacing:.04em}
.foot{margin-top:2rem;padding-top:.75rem;border-top:1px solid var(--line);font-size:.75rem;color:var(--mut)}
.badge{display:inline-block;background:var(--paper);border:1px solid var(--line);padding:.1rem .45rem;border-radius:2px;font-size:.75rem}
@media print{body{margin:0}.page{padding:0;max-width:none}@page{margin:12mm}}
@media (max-width:640px){.grid{grid-template-columns:1fr}}
</style></head><body><div class="page">`);

  const enderHeader = [
    empresa.endereco,
    empresa.bairro,
    empresa.cidade && empresa.uf
      ? `${empresa.cidade}/${empresa.uf}`
      : empresa.cidade || empresa.uf,
    empresa.cep ? `CEP ${empresa.cep}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  parts.push(`<header class="header"><div>`);
  if (sections.logo && logoUrl) {
    parts.push(
      `<img src="${esc(logoUrl)}" alt="${esc(empresa.nomeFantasia || empresa.razaoSocial)}" />`
    );
  } else {
    parts.push(
      `<div style="font-weight:700;color:var(--brand);font-size:1.1rem">${esc(empresa.nomeFantasia || empresa.razaoSocial || "Meu Lote Fácil")}</div>`
    );
  }
  // Dados da empresa sempre no cabeçalho (mesmo se a seção detalhada estiver off)
  parts.push(`<div style="margin-top:.45rem;font-size:.78rem;color:var(--mut);line-height:1.35">
<strong>${esc(empresa.razaoSocial)}</strong><br/>
CNPJ ${esc(empresa.cnpj)}${enderHeader ? `<br/>${esc(enderHeader)}` : ""}
${empresa.telefone || empresa.email ? `<br/>${esc([empresa.telefone, empresa.email].filter(Boolean).join(" · "))}` : ""}
</div>`);
  parts.push(`</div><div style="text-align:right">
<h1>Relatório do empreendimento</h1>
<div class="sub">${esc(d.nome)} · ${esc(d.codigo)}</div>
<div class="sub">Gerado em ${esc(geradoEm)}</div>
</div></header>`);

  if (sections.empresa) {
    parts.push(`<section class="section"><h2>Empresa emitente</h2><div class="grid">
<div><div class="k">Razão social</div><div class="v">${esc(empresa.razaoSocial)}</div></div>
<div><div class="k">Nome fantasia</div><div class="v">${esc(empresa.nomeFantasia ?? "—")}</div></div>
<div><div class="k">CNPJ</div><div class="v">${esc(empresa.cnpj)}</div></div>
<div><div class="k">Inscrição estadual</div><div class="v">${esc(empresa.inscricaoEstadual ?? "—")}</div></div>
<div style="grid-column:1/-1"><div class="k">Endereço</div><div class="v">${esc(enderHeader || "—")}</div></div>
<div><div class="k">Telefone</div><div class="v">${esc(empresa.telefone ?? "—")}</div></div>
<div><div class="k">E-mail</div><div class="v">${esc(empresa.email ?? "—")}</div></div>
</div></section>`);
  }

  if (sections.dadosEmp) {
    parts.push(`<section class="section"><h2>Empreendimento</h2><div class="grid">
<div><div class="k">Código</div><div class="v">${esc(d.codigo)}</div></div>
<div><div class="k">Nome</div><div class="v">${esc(d.nome)}</div></div>
<div><div class="k">Tipo / modalidade</div><div class="v">${esc(d.tipo)} · ${esc((d.modalidade ?? "").replace(/_/g, " "))}</div></div>
<div><div class="k">Status</div><div class="v"><span class="badge">${esc(d.status.replace(/_/g, " "))}</span></div></div>
<div><div class="k">Cidade / UF</div><div class="v">${esc(d.cidade)}/${esc(d.uf)}</div></div>
<div><div class="k">Bairro / núcleo</div><div class="v">${esc(d.bairro ?? "—")}</div></div>
<div><div class="k">CEP</div><div class="v">${esc(d.cep ?? "—")}</div></div>
<div><div class="k">Área total</div><div class="v">${esc(d.areaTotal ?? "—")}</div></div>
<div><div class="k">Quadras / lotes</div><div class="v">${d.qtdQuadras} · ${d.qtdLotes}</div></div>
<div><div class="k">Matrícula</div><div class="v">${esc([d.matriculaNumero, d.matriculaData].filter(Boolean).join(" · ") || "—")}</div></div>
<div><div class="k">Administradora</div><div class="v">${esc(d.adminRazao ?? "—")}</div></div>
<div><div class="k">CNPJ admin</div><div class="v">${esc(d.adminCnpj ?? "—")}</div></div>
</div>
${d.observacoes ? `<p style="margin:.75rem 0 0;font-size:.9rem"><strong>Obs.:</strong> ${esc(d.observacoes)}</p>` : ""}
</section>`);
  }

  if (sections.cartorioCertidao) {
    parts.push(`<section class="section"><h2>Cartório e certidão</h2><div class="grid">
<div><div class="k">Cartório</div><div class="v">${esc(d.cartorioNome ?? "—")}</div></div>
<div><div class="k">Cidade / UF</div><div class="v">${esc([d.cartorioCidade, d.cartorioUf].filter(Boolean).join("/") || "—")}</div></div>
<div><div class="k">Contato</div><div class="v">${esc(d.cartorioContato ?? "—")}</div></div>
<div><div class="k">Certidão</div><div class="v">${esc([d.certidaoTipo, d.certidaoNumero].filter(Boolean).join(" · ") || "—")}</div></div>
<div><div class="k">Data certidão</div><div class="v">${esc(d.certidaoData ?? "—")}</div></div>
<div><div class="k">Obs. certidão</div><div class="v">${esc(d.certidaoObs ?? "—")}</div></div>
</div></section>`);
  }

  if (sections.planta) {
    const p = d.plantaDxf;
    parts.push(`<section class="section"><h2>Planta</h2><div class="grid">
<div><div class="k">Arquivo</div><div class="v">${esc(p?.nome ?? "—")}</div></div>
<div><div class="k">Salva em</div><div class="v">${esc(p?.savedAt ? new Date(p.savedAt).toLocaleString("pt-BR") : "—")}</div></div>
<div><div class="k">Rótulos DXF</div><div class="v">${p?.labelCount != null ? String(p.labelCount) : "—"}</div></div>
<div><div class="k">Amostra</div><div class="v">${esc(p?.sampleId ?? "—")}</div></div>
</div></section>`);
  }

  if (sections.lotesResumo) {
    const rows = countByStatus(lots)
      .map(
        ([st, n]) =>
          `<tr><td>${esc(st)}</td><td>${n}</td></tr>`
      )
      .join("");
    parts.push(`<section class="section"><h2>Lotes · resumo</h2>
<p style="font-size:.9rem;margin:0 0 .5rem">Total: <strong>${lots.length}</strong></p>
<table><thead><tr><th>Status</th><th>Qtd</th></tr></thead><tbody>${rows || "<tr><td colspan=2>—</td></tr>"}</tbody></table>
</section>`);
  }

  if (sections.lotesDetalhe) {
    const rows = lots
      .slice()
      .sort((a, b) =>
        `${a.quadra}/${a.lote}`.localeCompare(`${b.quadra}/${b.lote}`, "pt-BR", {
          numeric: true,
        })
      )
      .map(
        (l) =>
          `<tr><td>${esc(l.quadra)}/${esc(l.lote)}</td><td>${l.area}</td><td>${esc(formatBRL(l.valor))}</td><td>${esc(l.status)}</td><td>${esc(l.compradorNome ?? "—")}</td></tr>`
      )
      .join("");
    parts.push(`<section class="section"><h2>Lotes · detalhe</h2>
<table><thead><tr><th>Q/L</th><th>Área m²</th><th>Valor</th><th>Status</th><th>Comprador</th></tr></thead>
<tbody>${rows || "<tr><td colspan=5>—</td></tr>"}</tbody></table></section>`);
  }

  if (sections.contratos) {
    const rows = contracts
      .map(
        (c) =>
          `<tr><td>${esc(c.numero)}</td><td>${esc(c.compradorNome)}</td><td>${esc(c.quadra)}/${esc(c.lote)}</td><td>${esc(formatBRL(c.preco))}</td><td>${esc(c.status)}</td></tr>`
      )
      .join("");
    parts.push(`<section class="section"><h2>Contratos</h2>
<table><thead><tr><th>Nº</th><th>Comprador</th><th>Lote</th><th>Preço</th><th>Status</th></tr></thead>
<tbody>${rows || "<tr><td colspan=5>—</td></tr>"}</tbody></table></section>`);
  }

  if (sections.socios) {
    const rows = socios
      .map(
        (s) =>
          `<tr><td>${esc(s.nome)}</td><td>${esc(s.documento)}</td><td>${s.percentual}%</td></tr>`
      )
      .join("");
    parts.push(`<section class="section"><h2>Sócios</h2>
<table><thead><tr><th>Nome</th><th>Documento</th><th>%</th></tr></thead>
<tbody>${rows || "<tr><td colspan=3>—</td></tr>"}</tbody></table></section>`);
  }

  parts.push(`<footer class="foot">${esc(empresa.razaoSocial)} · relatório configurável do empreendimento · documento interno</footer>
</div></body></html>`);

  return parts.join("");
}

export function openEmpreendimentoReport(html: string, filename: string) {
  openPrintHtml(html, filename);
}

/** @deprecated Prefira resolveEmitenteLogoPath(cnpj) — logo por emitente. */
export const SITE_LOGO_PATH = "/brand/mlf/logo-documento.png";

export { resolveEmitenteLogoPath, resolveEmitente } from "./emitentes";
