/** Importador de lotes via CSV (modelo Excel) — Parte 1 §2.2. */

export const LOTES_CSV_HEADERS = [
  "quadra",
  "lote",
  "area",
  "frente",
  "fundo",
  "direita",
  "esquerda",
  "confrontacoes",
  "matricula",
  "inscricao_municipal",
  "preco_avista",
  "situacao",
  "observacao",
] as const;

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
  precoAvista: number;
  situacao: string;
  observacao?: string;
  errors: string[];
};

const SITUACOES = new Set([
  "disponivel",
  "reservado",
  "vendido",
  "quitado",
  "escritura",
  "bloqueado",
]);

export function modeloLotesCsv(): string {
  return [
    LOTES_CSV_HEADERS.join(";"),
    "A;01;250;8,00;8,00;31,25;31,25;;12.345;;185000;disponivel;",
    "A;02;250;8,00;8,00;31,25;31,25;;;185000;disponivel;",
  ].join("\n");
}

function parseNum(raw: string): number | null {
  const t = raw.trim().replace(/\./g, "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function parseLotesCsv(text: string): LoteImportRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const sep = lines[0].includes(";") ? ";" : ",";
  const header = lines[0].split(sep).map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const seen = new Set<string>();
  const rows: LoteImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep);
    const get = (name: string) => {
      const j = idx(name);
      return j >= 0 ? (cols[j] ?? "").trim() : "";
    };
    const errors: string[] = [];
    const quadra = get("quadra");
    const lote = get("lote");
    const areaRaw = get("area");
    const precoRaw = get("preco_avista");
    const situacao = (get("situacao") || "disponivel").toLowerCase();

    if (!quadra) errors.push("quadra vazia");
    if (!lote) errors.push("lote vazio");
    const area = parseNum(areaRaw);
    if (area == null || area <= 0) errors.push("área inválida");
    const preco = parseNum(precoRaw) ?? 0;
    if (precoRaw && preco <= 0) errors.push("preço inválido");
    if (!SITUACOES.has(situacao)) errors.push(`situação desconhecida: ${situacao}`);

    const key = `${quadra}/${lote}`.toLowerCase();
    if (quadra && lote) {
      if (seen.has(key)) errors.push("lote repetido no arquivo");
      seen.add(key);
    }

    rows.push({
      line: i + 1,
      quadra,
      lote,
      area: area ?? 0,
      frente: get("frente") || undefined,
      fundo: get("fundo") || undefined,
      direita: get("direita") || undefined,
      esquerda: get("esquerda") || undefined,
      confrontacoes: get("confrontacoes") || undefined,
      matricula: get("matricula") || undefined,
      inscricaoMunicipal: get("inscricao_municipal") || undefined,
      precoAvista: preco,
      situacao,
      observacao: get("observacao") || undefined,
      errors,
    });
  }
  return rows;
}
