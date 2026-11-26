/**
 * Parser .xlsx nativo (OOXML) — C04 / C17.
 * Lê a primeira planilha; células shared-string e inline.
 */

import { entryText, readZip } from "./zip-inflate";

export type XlsxParseResult = {
  ok: boolean;
  sheetName?: string;
  /** Linhas como arrays de string (inclui cabeçalho). */
  rows: string[][];
  erro?: string;
};

function xmlAttrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([a-zA-Z0-9:]+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tag))) out[m[1]] = m[2];
  return out;
}

function colToIndex(ref: string): number {
  const letters = ref.replace(/[0-9]/g, "");
  let n = 0;
  for (let i = 0; i < letters.length; i++) {
    n = n * 26 + (letters.charCodeAt(i) - 64);
  }
  return n - 1;
}

function parseSharedStrings(xml: string): string[] {
  const out: string[] = [];
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/gi;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(xml))) {
    const texts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/gi)].map((x) =>
      x[1]
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
    );
    out.push(texts.join(""));
  }
  return out;
}

function parseSheetRows(xml: string, shared: string[]): string[][] {
  const rows: string[][] = [];
  const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/gi;
  let rm: RegExpExecArray | null;
  while ((rm = rowRe.exec(xml))) {
    const cells: string[] = [];
    const cellRe = /<c\b([^>]*)>([\s\S]*?)<\/c>|<c\b([^>]*)\/>/gi;
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(rm[1]))) {
      const attrs = xmlAttrs(` ${cm[1] || cm[3] || ""} `);
      const ref = attrs.r || "";
      const idx = ref ? colToIndex(ref) : cells.length;
      while (cells.length < idx) cells.push("");
      const t = attrs.t;
      const body = cm[2] || "";
      let val = "";
      if (t === "s") {
        const v = body.match(/<v>([\s\S]*?)<\/v>/i)?.[1] ?? "";
        val = shared[Number(v)] ?? "";
      } else if (t === "inlineStr") {
        val = body.match(/<t[^>]*>([\s\S]*?)<\/t>/i)?.[1] ?? "";
      } else {
        val = body.match(/<v>([\s\S]*?)<\/v>/i)?.[1] ?? "";
      }
      cells[idx] = val
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
    }
    // trim trailing empties but keep row if any content
    while (cells.length && cells[cells.length - 1] === "") cells.pop();
    if (cells.length) rows.push(cells);
  }
  return rows;
}

export async function parseXlsxBytes(
  buf: ArrayBuffer
): Promise<XlsxParseResult> {
  try {
    const entries = await readZip(buf);
    if (!entries.length) {
      return { ok: false, rows: [], erro: "ZIP vazio ou inválido" };
    }
    const sharedXml = entryText(entries, "xl/sharedStrings.xml") ?? "";
    const shared = sharedXml ? parseSharedStrings(sharedXml) : [];
    const sheet =
      entryText(entries, "xl/worksheets/sheet1.xml") ||
      entries.find((e) => /xl\/worksheets\/sheet\d+\.xml$/i.test(e.name));
    const sheetXml =
      typeof sheet === "string"
        ? sheet
        : sheet
          ? new TextDecoder("utf-8").decode(sheet.data)
          : null;
    if (!sheetXml) {
      return { ok: false, rows: [], erro: "Planilha não encontrada" };
    }
    const rows = parseSheetRows(sheetXml, shared);
    if (!rows.length) {
      return { ok: false, rows: [], erro: "Planilha sem linhas" };
    }
    return { ok: true, sheetName: "sheet1", rows };
  } catch (e) {
    return {
      ok: false,
      rows: [],
      erro: e instanceof Error ? e.message : "Falha ao ler xlsx",
    };
  }
}

/** Converte matriz xlsx em CSV ; para reutilizar parseLotesCsv. */
export function xlsxRowsToCsv(rows: string[][]): string {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const s = String(c ?? "");
          if (/[;"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        })
        .join(";")
    )
    .join("\n");
}
