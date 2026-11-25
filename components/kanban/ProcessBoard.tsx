"use client";

import { useEffect, useMemo, useState } from "react";
import { ProcessList, type ProcessColumn } from "@/components/app/ProcessList";
import { getViewPref, setViewPref } from "@/lib/ui/view-pref";
import {
  ViewModeToggle,
  type BoardViewMode,
} from "@/components/kanban/BoardViews";
import {
  KanbanBoard,
  type KanbanCard,
  type KanbanColumn,
} from "@/components/kanban/KanbanBoard";
import { formatBRL } from "@/lib/masks/br";

/**
 * Alternador Kanban | Lista com os mesmos dados (C18–C21).
 */
export function ProcessBoard<T extends { id: string }>({
  storageKey,
  columns,
  rows,
  toCard,
  listColumns,
  onMove,
  onOpen,
  bulkActions,
  exportName,
  columnTotals,
}: {
  storageKey: string;
  columns: KanbanColumn[];
  rows: T[];
  toCard: (row: T) => KanbanCard;
  listColumns: ProcessColumn<T>[];
  onMove: (id: string, toColumnId: string) => boolean | void;
  onOpen?: (id: string) => void;
  bulkActions?: {
    label: string;
    onClick: (ids: string[]) => void;
    tone?: "default" | "danger";
  }[];
  exportName?: string;
  columnTotals?: (columnId: string, items: T[]) => number | undefined;
}) {
  const prefKey = `process:${storageKey}`;
  const [mode, setMode] = useState<BoardViewMode>("kanban");

  useEffect(() => {
    setMode(getViewPref(prefKey, "kanban"));
  }, [prefKey]);

  const cards = useMemo(() => rows.map(toCard), [rows, toCard]);

  const columnsWithCount = useMemo(
    () =>
      columns.map((c) => {
        const items = rows.filter((r) => toCard(r).columnId === c.id);
        const total = columnTotals?.(c.id, items);
        const suffix =
          total != null
            ? ` · ${items.length} · ${formatBRL(total)}`
            : ` · ${items.length}`;
        return { ...c, label: `${c.label}${suffix}` };
      }),
    [columns, rows, toCard, columnTotals]
  );

  return (
    <div className="space-y-4">
      <ViewModeToggle
        value={mode}
        onChange={(m) => {
          setMode(m);
          setViewPref(prefKey, m);
        }}
      />
      {mode === "kanban" ? (
        <KanbanBoard
          columns={columnsWithCount}
          cards={cards}
          onMove={onMove}
          onOpen={onOpen}
        />
      ) : (
        <ProcessList
          storageKey={storageKey}
          columns={listColumns}
          rows={rows}
          onRowClick={onOpen ? (r) => onOpen(r.id) : undefined}
          bulkActions={bulkActions}
          exportName={exportName ?? storageKey}
        />
      )}
    </div>
  );
}
