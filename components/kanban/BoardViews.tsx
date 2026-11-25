"use client";

import { useEffect, useMemo, useState } from "react";
import { Columns3, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DataTable, StatusPill } from "@/components/app/ModulePage";
import {
  KanbanBoard,
  type KanbanCard,
  type KanbanColumn,
} from "@/components/kanban/KanbanBoard";

export type BoardViewMode = "kanban" | "lista";

const STORAGE_PREFIX = "mlf_board_view:";

function readStored(key: string): BoardViewMode {
  if (typeof window === "undefined") return "kanban";
  try {
    const v = window.localStorage.getItem(STORAGE_PREFIX + key);
    return v === "lista" ? "lista" : "kanban";
  } catch {
    return "kanban";
  }
}

export function ViewModeToggle({
  value,
  onChange,
  className,
}: {
  value: BoardViewMode;
  onChange: (mode: BoardViewMode) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-sm border border-border bg-background p-0.5",
        className
      )}
      role="group"
      aria-label="Modo de visualização"
    >
      <Button
        type="button"
        size="sm"
        variant={value === "kanban" ? "default" : "secondary"}
        className="h-8 gap-1.5 border-0 px-2.5 shadow-none"
        aria-pressed={value === "kanban"}
        onClick={() => onChange("kanban")}
      >
        <Columns3 className="size-3.5" aria-hidden />
        Kanban
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "lista" ? "default" : "secondary"}
        className="h-8 gap-1.5 border-0 px-2.5 shadow-none"
        aria-pressed={value === "lista"}
        onClick={() => onChange("lista")}
      >
        <List className="size-3.5" aria-hidden />
        Lista
      </Button>
    </div>
  );
}

function BoardList({
  columns,
  cards,
  onMove,
  onOpen,
}: {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onMove: (cardId: string, toColumnId: string) => boolean | void;
  onOpen?: (cardId: string) => void;
}) {
  const labelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of columns) m.set(c.id, c.label);
    return m;
  }, [columns]);

  const ordered = useMemo(() => {
    const order = new Map(columns.map((c, i) => [c.id, i]));
    return [...cards].sort((a, b) => {
      const da = order.get(a.columnId) ?? 999;
      const db = order.get(b.columnId) ?? 999;
      if (da !== db) return da - db;
      return a.title.localeCompare(b.title, "pt-BR");
    });
  }, [cards, columns]);

  const movable = columns.filter((c) => c.droppable !== false);

  return (
    <DataTable
      empty="Nenhum item neste quadro."
      columns={[
        { key: "title", label: "Item" },
        { key: "status", label: "Status", className: "w-[200px]" },
        { key: "detail", label: "Detalhe" },
        { key: "meta", label: "Info", className: "w-[140px]" },
      ]}
      rows={ordered.map((card) => ({
        title: (
          <div>
            <p className="font-medium text-ink">{card.title}</p>
            {card.subtitle ? (
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            ) : null}
          </div>
        ),
        status: (
          <div
            className="flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <StatusPill tone="neutral">
              {labelById.get(card.columnId) ?? card.columnId}
            </StatusPill>
            {movable.length > 1 ? (
              <select
                className="h-8 max-w-[180px] rounded-sm border border-border bg-background px-2 text-xs text-ink"
                aria-label={`Mover ${card.title}`}
                value={card.columnId}
                onChange={(e) => {
                  const to = e.target.value;
                  if (to !== card.columnId) onMove(card.id, to);
                }}
              >
                {columns.map((col) => (
                  <option
                    key={col.id}
                    value={col.id}
                    disabled={col.droppable === false && col.id !== card.columnId}
                  >
                    {col.label}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        ),
        detail: card.badge ? <StatusPill tone="warn">{card.badge}</StatusPill> : "—",
        meta: (
          <span className="text-xs text-muted-foreground">{card.meta ?? "—"}</span>
        ),
      }))}
      onRowClick={
        onOpen
          ? (index) => {
              const card = ordered[index];
              if (card) onOpen(card.id);
            }
          : undefined
      }
    />
  );
}

/**
 * Quadro com alternância Kanban ↔ Lista (preferência por página no localStorage).
 */
export function BoardViews({
  storageKey,
  columns,
  cards,
  onMove,
  onOpen,
  defaultView = "kanban",
  toolbarExtra,
}: {
  storageKey: string;
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onMove: (cardId: string, toColumnId: string) => boolean | void;
  onOpen?: (cardId: string) => void;
  defaultView?: BoardViewMode;
  toolbarExtra?: React.ReactNode;
}) {
  const [mode, setMode] = useState<BoardViewMode>(defaultView);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMode(readStored(storageKey));
    setHydrated(true);
  }, [storageKey]);

  const setView = (next: BoardViewMode) => {
    setMode(next);
    try {
      window.localStorage.setItem(STORAGE_PREFIX + storageKey, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewModeToggle value={mode} onChange={setView} />
        {toolbarExtra}
      </div>
      {!hydrated || mode === "kanban" ? (
        <KanbanBoard
          columns={columns}
          cards={cards}
          onMove={onMove}
          onOpen={onOpen}
        />
      ) : (
        <BoardList
          columns={columns}
          cards={cards}
          onMove={onMove}
          onOpen={onOpen}
        />
      )}
    </div>
  );
}
