import type { Lot } from "@/lib/domain/carteira-types";

export type DxfTextLabel = {
  text: string;
  layer: string;
  x: number;
  y: number;
};

export type DxfPickPayload = DxfTextLabel & {
  /** Rótulo normalizado (só dígitos / código). */
  code: string;
};

const NUMERO_LAYER = /numero|n[uú]mero|identif|lote.?id/i;
const SKIP_LAYER = /\bpv[pe]\b|pluvial|esgoto|cota|rua|malha|trecho/i;

/** Camadas típicas de número de lote (não infraestrutura). */
export function isLotNumberLayer(layer: string): boolean {
  if (SKIP_LAYER.test(layer)) return false;
  return NUMERO_LAYER.test(layer);
}

export function normalizeLotCode(raw: string): string {
  const t = raw.replace(/\s+/g, " ").trim();
  if (!t) return "";
  // A/01, A-01, Q.A L.01, Quadra A Lote 01
  const m = t.match(
    /(?:quadra\s*)?([A-Za-z0-9]+)\s*[\/\-·.]\s*(?:lote\s*)?(\d{1,4})/i
  );
  if (m) return `${m[1].toUpperCase()}/${m[2].padStart(2, "0")}`;
  const only = t.match(/^(\d{1,4})$/);
  if (only) return only[1].padStart(2, "0");
  const loteOnly = t.match(/lote\s*(\d{1,4})/i);
  if (loteOnly) return loteOnly[1].padStart(2, "0");
  return t.toUpperCase();
}

export function parseQuadraLote(
  code: string
): { quadra?: string; lote: string } | null {
  if (!code) return null;
  const m = code.match(/^([A-Za-z0-9]+)\/(\d{2,4})$/);
  if (m) return { quadra: m[1], lote: m[2] };
  if (/^\d{2,4}$/.test(code)) return { lote: code };
  return null;
}

/**
 * Associa um pick DXF aos lotes do empreendimento.
 * Preferência: match exato quadra+lote; senão lote; se vários, o de menor distância
 * euclidiana ao rótulo (se `label` tiver x/y e lotes tiverem centro aproximado via polígono).
 */
export function matchLotsFromPick(
  pick: DxfPickPayload,
  lots: Lot[]
): Lot[] {
  const parsed = parseQuadraLote(pick.code);
  if (!parsed) return [];
  let candidates = lots.filter((l) => {
    const n = l.lote.replace(/\D/g, "").padStart(2, "0");
    const target = parsed.lote.padStart(2, "0");
    if (n !== target && l.lote !== parsed.lote) return false;
    if (parsed.quadra) {
      return l.quadra.toUpperCase() === parsed.quadra.toUpperCase();
    }
    return true;
  });
  if (candidates.length <= 1) return candidates;

  // Desempate por centro do polígono (quando existe)
  const scored = candidates.map((l) => {
    const poly = l.plantaPoligono;
    if (!poly || poly.length < 1) return { l, d: Number.POSITIVE_INFINITY };
    const cx = poly.reduce((a, p) => a + p.x, 0) / poly.length;
    const cy = poly.reduce((a, p) => a + p.y, 0) / poly.length;
    const d = (cx - pick.x) ** 2 + (cy - pick.y) ** 2;
    return { l, d };
  });
  scored.sort((a, b) => a.d - b.d);
  if (Number.isFinite(scored[0].d)) return [scored[0].l];
  return candidates;
}

/** Extrai pares quadra/lote únicos a partir dos rótulos do DXF (para gerar cadastro). */
export function labelsToLotRows(
  labels: DxfTextLabel[],
  defaults: { area: number; precoVista: number }
): { quadra: string; lote: string; area: number; precoVista: number }[] {
  const out = new Map<string, { quadra: string; lote: string }>();
  for (const lab of labels) {
    if (!isLotNumberLayer(lab.layer)) continue;
    const code = normalizeLotCode(lab.text);
    const parsed = parseQuadraLote(code);
    if (!parsed) continue;
    const quadra = parsed.quadra ?? inferQuadraFromLayer(lab.layer);
    const lote = parsed.lote.padStart(2, "0");
    const key = `${quadra}/${lote}`;
    if (!out.has(key)) out.set(key, { quadra, lote });
  }
  return [...out.values()].map((r) => ({
    ...r,
    area: defaults.area,
    precoVista: defaults.precoVista,
  }));
}

function inferQuadraFromLayer(layer: string): string {
  const m = layer.match(/^(\d{2,3})\b/);
  if (m) return m[1].replace(/^0+/, "") || m[1];
  return "DXF";
}
