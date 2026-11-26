/**
 * C04 — importação de quadras/lotes por CSV (modelo Excel-compatível).
 * Aceita .csv e .xlsx exportado como CSV (; ou ,).
 */

import type { LotStatus } from "@/lib/domain/carteira-types";

export type LoteImportRow = {
  line: number;
  quadra: string;
  lote: string;
  area: number;
  frente?: string;
  fundo?: string;
  direita?: string;
  esquerda?: string;
  confrontacoes?: string;
  matricula?: string;
  inscricaoMunicipal?: string;
  precoVista: number;
  situacao: LotStatus;
  observacao?: string;
  erros: string[];
};

export type LoteImportPreview = {
  ok: boolean;
  rows: LoteImportRow[];
  criaveis: number;
  comErro: number;
};

const STATUS_MAP: Record<string, LotStatus> = {
  disponivel: "disponivel",
  disponível: "disponivel",
  reservado: "reservado",
  vendido: "vendido",
  quitado: "quitado",
  escritura: "escritura",
  advogado: "advogado",
  caucionado: "caucionado",
  invadido: "invadido",
  juridico: "juridico",
  jurídico: "juridico",
};

function splitCsvLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else q = !q;
      continue;
    }
    if (ch === sep && !q) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function detectSep(header: string): string {
  const semi = (header.match(/;/g) || []).length;
  const comma = (header.match(/,/g) || []).length;
  return semi >= comma ? ";" : ",";
}

function normHeader(h: string) {
  return h
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

const HEADER_ALIASES: Record<string, string> = {
  quadra: "quadra",
  lote: "lote",
  area: "area",
  area_m2: "area",
  frente: "frente",
  fundo: "fundo",
  lateral_direita: "direita",
  direita: "direita",
  lateral_esquerda: "esquerda",
  esquerda: "esquerda",
  confrontacoes: "confrontacoes",
  matricula: "matricula",
  inscricao_municipal: "inscricao",
  inscricao: "inscricao",
  preco_a_vista: "preco",
  preco_avista: "preco",
  preco: "preco",
  situacao: "situacao",
  status: "situacao",
  observacao: "observacao",
  obs: "observacao",
};

export function modeloLotesCsv(): string {
  return [
    "quadra;lote;area;frente;fundo;direita;esquerda;confrontacoes;matricula;inscricao_municipal;preco_avista;situacao;observacao",
    "A;01;250;10;10;12,5;12,5;Rua das Flores;12345;;85000;disponivel;",
    "A;02;250;10;10;12,5;12,5;;;85000;disponivel;",
  ].join("\n");
}

export function parseLotesCsv(content: string): LoteImportPreview {
  const lines = content
    .replace(/^\ufeff/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return { ok: false, rows: [], criaveis: 0, comErro: 0 };
  }
  const sep = detectSep(lines[0]);
  const headers = splitCsvLine(lines[0], sep).map(
    (h) => HEADER_ALIASES[normHeader(h)] ?? normHeader(h)
  );
  const idx = (name: string) => headers.indexOf(name);
  const seen = new Set<string>();
  const rows: LoteImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i], sep);
    const get = (name: string) => {
      const j = idx(name);
      return j >= 0 ? (cols[j] ?? "").trim() : "";
    };
    const erros: string[] = [];
    const quadra = get("quadra");
    const lote = get("lote");
    if (!quadra) erros.push("quadra obrigatória");
    if (!lote) erros.push("lote obrigatório");
    const key = `${quadra}::${lote}`.toLowerCase();
    if (quadra && lote && seen.has(key)) erros.push("lote repetido no arquivo");
    if (quadra && lote) seen.add(key);

    const area = Number(String(get("area")).replace(",", "."));
    if (!Number.isFinite(area) || area <= 0) erros.push("área inválida");

    const precoVista = Number(String(get("preco")).replace(",", ".")) || 0;
    const sitRaw = get("situacao").toLowerCase() || "disponivel";
    const situacao = STATUS_MAP[sitRaw];
    if (!situacao) erros.push(`situação desconhecida: ${sitRaw}`);

    rows.push({
      line: i + 1,
      quadra,
      lote,
      area: Number.isFinite(area) ? area : 0,
      frente: get("frente") || undefined,
      fundo: get("fundo") || undefined,
      direita: get("direita") || undefined,
      esquerda: get("esquerda") || undefined,
      confrontacoes: get("confrontacoes") || undefined,
      matricula: get("matricula") || undefined,
      inscricaoMunicipal: get("inscricao") || undefined,
      precoVista,
      situacao: situacao ?? "disponivel",
      observacao: get("observacao") || undefined,
      erros,
    });
  }

  const comErro = rows.filter((r) => r.erros.length > 0).length;
  return {
    ok: comErro === 0 && rows.length > 0,
    rows,
    criaveis: rows.length - comErro,
    comErro,
  };
}
