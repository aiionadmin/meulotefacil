/**
 * Datas sem fuso (B01/B02).
 * String `YYYY-MM-DD` é data pura — nunca passa por `new Date(iso)` com TZ local.
 */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATETIME =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

export function isDateOnly(value: string) {
  return DATE_ONLY.test(value.trim());
}

/** Formata data pura ou Date em dd/mm/aaaa. */
export function formatDateBR(isoOrDate: string | Date) {
  if (typeof isoOrDate === "string") {
    const s = isoOrDate.trim();
    const m = s.match(DATE_ONLY);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    const dt = s.match(DATETIME);
    if (dt) return `${dt[3]}/${dt[2]}/${dt[1]}`;
    // Já em pt-BR ou outro texto
    if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return formatDateFromParts(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate()
    );
  }
  return formatDateFromParts(
    isoOrDate.getFullYear(),
    isoOrDate.getMonth() + 1,
    isoOrDate.getDate()
  );
}

/** Data com hora em dd/mm/aaaa hh:mm. */
export function formatDateTimeBR(isoOrDate: string | Date) {
  if (typeof isoOrDate === "string") {
    const s = isoOrDate.trim();
    const m = s.match(DATE_ONLY);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    const dt = s.match(DATETIME);
    if (dt) return `${dt[3]}/${dt[2]}/${dt[1]} ${dt[4]}:${dt[5]}`;
    if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) return s;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return `${formatDateFromParts(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return `${formatDateFromParts(
    isoOrDate.getFullYear(),
    isoOrDate.getMonth() + 1,
    isoOrDate.getDate()
  )} ${pad(isoOrDate.getHours())}:${pad(isoOrDate.getMinutes())}`;
}

function formatDateFromParts(y: number, m: number, d: number) {
  return `${pad(d)}/${pad(m)}/${y}`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Hoje como YYYY-MM-DD no fuso local do cliente/servidor, sem UTC shift. */
export function todayDateOnly() {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}
