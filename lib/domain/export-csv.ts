/** Exportação CSV simples para listas (Excel abre nativamente). */

export function rowsToCsv(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string {
  const esc = (v: string | number | boolean | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.map(esc).join(";"),
    ...rows.map((r) => r.map(esc).join(";")),
  ];
  return "\uFEFF" + lines.join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  if (typeof document === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function moverDemandasEmLote(
  ids: string[],
  status: string,
  existentes: { id: string; status: string }[]
): { id: string; de: string; para: string }[] {
  const set = new Set(ids);
  return existentes
    .filter((d) => set.has(d.id) && d.status !== status)
    .map((d) => ({ id: d.id, de: d.status, para: status }));
}
