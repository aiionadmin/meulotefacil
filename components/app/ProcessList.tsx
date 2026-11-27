"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, StatusPill } from "@/components/app/ModulePage";
import { fieldControlClass, notify } from "@/components/app/ModuleToolkit";
import {
  downloadCsv,
  downloadExcel,
  downloadListPdf,
  exportTitleFromName,
  printList,
} from "@/lib/export/list-export";
import { paginate } from "@/lib/ui/pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [10, 25, 50, 100] as const;

export type ProcessColumnFilter =
  | { type: "text" }
  | { type: "list"; options: { value: string; label: string }[] }
  | { type: "period" }
  | { type: "range" }
  | { type: "status"; options: { value: string; label: string }[] };

export type ProcessColumn<T> = {
  key: string;
  label: string;
  className?: string;
  filter?: ProcessColumnFilter;
  /** Valor textual para filtro/export/ordenação */
  getValue: (row: T) => string | number | null | undefined;
  /** Render da célula (opcional) */
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  defaultVisible?: boolean;
};

export type ProcessListProps<T extends { id: string }> = {
  title?: string;
  columns: ProcessColumn<T>[];
  rows: T[];
  empty?: string;
  storageKey?: string;
  onRowClick?: (row: T) => void;
  /** Ações em lote (C15) */
  bulkActions?: {
    label: string;
    onClick: (ids: string[]) => void;
    tone?: "default" | "danger";
  }[];
  exportName?: string;
};

type SavedFilter = {
  name: string;
  filters: Record<string, string>;
};

const savedByKey = new Map<string, SavedFilter[]>();

export function ProcessList<T extends { id: string }>({
  columns,
  rows,
  empty,
  storageKey = "default",
  onRowClick,
  bulkActions,
  exportName,
}: ProcessListProps<T>) {
  const fileName = exportName?.trim() || storageKey || "lista";
  const pdfTitle = exportTitleFromName(fileName);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      columns.map((c) => [c.key, c.defaultVisible !== false])
    )
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedName, setSavedName] = useState("");
  const [saved, setSaved] = useState<SavedFilter[]>(
    () => savedByKey.get(storageKey) ?? []
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const visibleCols = columns.filter((c) => visible[c.key] !== false);

  const filtered = useMemo(() => {
    let list = rows;
    for (const col of columns) {
      const raw = filters[col.key]?.trim();
      if (!raw) continue;
      const f = col.filter;
      if (!f) {
        list = list.filter((r) =>
          String(col.getValue(r) ?? "")
            .toLowerCase()
            .includes(raw.toLowerCase())
        );
        continue;
      }
      if (f.type === "text" || f.type === "list" || f.type === "status") {
        list = list.filter((r) => {
          const v = String(col.getValue(r) ?? "").toLowerCase();
          return f.type === "text"
            ? v.includes(raw.toLowerCase())
            : v === raw.toLowerCase() || v.includes(raw.toLowerCase());
        });
      }
      if (f.type === "range") {
        const [minS, maxS] = raw.split("..");
        const min = minS ? Number(minS) : null;
        const max = maxS ? Number(maxS) : null;
        list = list.filter((r) => {
          const n = Number(col.getValue(r) ?? NaN);
          if (Number.isNaN(n)) return false;
          if (min != null && !Number.isNaN(min) && n < min) return false;
          if (max != null && !Number.isNaN(max) && n > max) return false;
          return true;
        });
      }
      if (f.type === "period") {
        const [from, to] = raw.split("..");
        list = list.filter((r) => {
          const v = String(col.getValue(r) ?? "");
          if (from && v < from) return false;
          if (to && v > to) return false;
          return true;
        });
      }
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        list = [...list].sort((a, b) => {
          const va = col.getValue(a);
          const vb = col.getValue(b);
          const cmp =
            typeof va === "number" && typeof vb === "number"
              ? va - vb
              : String(va ?? "").localeCompare(String(vb ?? ""), "pt-BR");
          return sortDir === "asc" ? cmp : -cmp;
        });
      }
    }
    return list;
  }, [rows, filters, columns, sortKey, sortDir]);

  const paged = useMemo(
    () => paginate(filtered, page, pageSize),
    [filtered, page, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [filters, sortKey, sortDir, rows, pageSize]);

  useEffect(() => {
    if (paged.page !== page) setPage(paged.page);
  }, [paged.page, page]);

  const clearFilters = () => {
    setFilters({});
    notify("Filtros limpos");
  };

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const allSelected =
    paged.items.length > 0 && paged.items.every((r) => selected.has(r.id));

  const exportRows = () =>
    filtered.map((r) => visibleCols.map((c) => c.getValue(r) ?? ""));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2 rounded-sm border border-border bg-card p-3">
        {columns
          .filter((c) => c.filter)
          .map((c) => (
            <div key={c.key} className="min-w-[140px] flex-1">
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                {c.label}
              </label>
              {c.filter?.type === "list" || c.filter?.type === "status" ? (
                <select
                  className={fieldControlClass}
                  value={filters[c.key] ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, [c.key]: e.target.value }))
                  }
                >
                  <option value="">Todos</option>
                  {c.filter.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : c.filter?.type === "range" ? (
                <Input
                  placeholder="min..max"
                  value={filters[c.key] ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, [c.key]: e.target.value }))
                  }
                />
              ) : c.filter?.type === "period" ? (
                <Input
                  placeholder="AAAA-MM-DD..AAAA-MM-DD"
                  value={filters[c.key] ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, [c.key]: e.target.value }))
                  }
                />
              ) : (
                <Input
                  placeholder={`Filtrar ${c.label.toLowerCase()}…`}
                  value={filters[c.key] ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, [c.key]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
        <Button size="sm" variant="outline" onClick={clearFilters}>
          Limpar filtros
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {columns.map((c) => (
            <button
              key={c.key}
              type="button"
              className={cn(
                "rounded-sm border px-2 py-1 text-[11px]",
                visible[c.key] !== false
                  ? "border-brand-orange/40 bg-brand-orange/10 text-ink"
                  : "border-border text-muted-foreground"
              )}
              onClick={() =>
                setVisible((v) => ({ ...v, [c.key]: !(v[c.key] !== false) }))
              }
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Input
            className="h-8 w-36"
            placeholder="Salvar filtro…"
            value={savedName}
            onChange={(e) => setSavedName(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!savedName.trim()) return;
              const next = [
                ...saved,
                { name: savedName.trim(), filters: { ...filters } },
              ];
              setSaved(next);
              savedByKey.set(storageKey, next);
              setSavedName("");
              notify("Filtro salvo");
            }}
          >
            Salvar
          </Button>
          {saved.length > 0 ? (
            <select
              className={cn(fieldControlClass, "h-8 w-40")}
              defaultValue=""
              onChange={(e) => {
                const s = saved.find((x) => x.name === e.target.value);
                if (s) setFilters(s.filters);
              }}
            >
              <option value="">Filtros salvos</option>
              {saved.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadCsv(
                fileName,
                visibleCols.map((c) => c.label),
                exportRows()
              );
              notify("CSV exportado", `${fileName}.csv`);
            }}
          >
            CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadExcel(
                fileName,
                visibleCols.map((c) => c.label),
                exportRows()
              );
              notify("Excel exportado", `${fileName}.csv`);
            }}
          >
            Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void downloadListPdf(
                pdfTitle,
                visibleCols.map((c) => c.label),
                exportRows(),
                { filename: fileName }
              );
              notify("PDF gerado", pdfTitle);
            }}
          >
            PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => printList(pdfTitle)}
          >
            Imprimir
          </Button>
        </div>
      </div>

      {selected.size > 0 && bulkActions?.length ? (
        <div className="flex flex-wrap items-center gap-2 rounded-sm border border-border bg-paper-muted/50 px-3 py-2 text-sm">
          <StatusPill tone="info">{selected.size} selecionados</StatusPill>
          {bulkActions.map((a) => (
            <Button
              key={a.label}
              size="sm"
              variant={a.tone === "danger" ? "destructive" : "outline"}
              onClick={() => {
                if (
                  !window.confirm(
                    `Confirmar «${a.label}» em ${selected.size} item(ns)?`
                  )
                )
                  return;
                a.onClick([...selected]);
                setSelected(new Set());
                notify(a.label, "ação em lote registrada");
              }}
            >
              {a.label}
            </Button>
          ))}
        </div>
      ) : null}

      <DataTable
        empty={empty}
        paginate={false}
        exportable={false}
        exportName={fileName}
        columns={[
          {
            key: "_sel",
            label: "✓",
            className: "w-10",
          },
          ...visibleCols.map((c) => ({
            key: c.key,
            label:
              c.sortable !== false && sortKey === c.key
                ? `${c.label}${sortDir === "asc" ? " ↑" : " ↓"}`
                : c.label,
            className: c.className,
          })),
        ]}
        rows={paged.items.map((row) => {
          const rec: Record<string, React.ReactNode> = {
            _sel: (
              <Checkbox
                checked={selected.has(row.id)}
                onCheckedChange={(v) => {
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (v) next.add(row.id);
                    else next.delete(row.id);
                    return next;
                  });
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ),
          };
          for (const c of visibleCols) {
            rec[c.key] = (
              <button
                type="button"
                className="w-full text-left"
                onClick={(e) => {
                  if (c.sortable === false) return;
                  e.stopPropagation();
                  toggleSort(c.key);
                }}
              >
                {c.render ? c.render(row) : String(c.getValue(row) ?? "—")}
              </button>
            );
          }
          return rec;
        })}
        onRowClick={
          onRowClick
            ? (index) => {
                const row = paged.items[index];
                if (row) onRowClick(row);
              }
            : undefined
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(v) => {
              if (v) setSelected(new Set(paged.items.map((r) => r.id)));
              else setSelected(new Set());
            }}
          />
          <span>
            Página {paged.page}/{paged.totalPages} · {paged.total} filtrado(s)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            className={cn(fieldControlClass, "h-8 w-20 py-0")}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            disabled={paged.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={paged.page >= paged.totalPages}
            onClick={() =>
              setPage((p) => Math.min(paged.totalPages, p + 1))
            }
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
