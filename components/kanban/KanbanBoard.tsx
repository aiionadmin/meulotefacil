"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/app/ModulePage";

export type KanbanColumn = {
  id: string;
  label: string;
  /** Se false, drop é rejeitado pelo handler externo */
  droppable?: boolean;
};

export type KanbanCard = {
  id: string;
  columnId: string;
  title: string;
  subtitle?: string;
  badge?: string;
  meta?: string;
};

function SortableCard({
  card,
  onOpen,
}: {
  card: KanbanCard;
  onOpen?: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab rounded-sm border border-border bg-background p-2.5 text-sm active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // B16 — clique abre o card; arraste usa activationConstraint de distância
        if (isDragging) return;
        e.stopPropagation();
        onOpen?.(card.id);
      }}
    >
      <p className="font-medium">{card.title}</p>
      {card.subtitle ? (
        <p className="text-xs text-muted-foreground">{card.subtitle}</p>
      ) : null}
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {card.badge ? <StatusPill tone="warn">{card.badge}</StatusPill> : null}
        {card.meta ? (
          <span className="text-[10px] text-muted-foreground">{card.meta}</span>
        ) : null}
      </div>
    </div>
  );
}

function Column({
  column,
  cards,
  onOpen,
}: {
  column: KanbanColumn;
  cards: KanbanCard[];
  onOpen?: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-56 shrink-0 flex-col rounded-sm border border-border bg-card/60 p-3",
        isOver && "ring-2 ring-brand-orange/40"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {column.label}
        </p>
        <StatusPill tone="neutral">{cards.length}</StatusPill>
      </div>
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[80px] space-y-2">
          {cards.map((c) => (
            <SortableCard key={c.id} card={c} onOpen={onOpen} />
          ))}
          {!cards.length ? (
            <p className="text-xs text-muted-foreground">Vazio</p>
          ) : null}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const byCol = useMemo(() => {
    const map = new Map<string, KanbanCard[]>();
    for (const col of columns) map.set(col.id, []);
    for (const c of cards) {
      const list = map.get(c.columnId) ?? [];
      list.push(c);
      map.set(c.columnId, list);
    }
    return map;
  }, [columns, cards]);

  const active = cards.find((c) => c.id === activeId);

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active: a, over } = e;
    if (!over) return;
    const cardId = String(a.id);
    let toColumnId = String(over.id);
    if (!columns.some((c) => c.id === toColumnId)) {
      const overCard = cards.find((c) => c.id === toColumnId);
      if (overCard) toColumnId = overCard.columnId;
      else return;
    }
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.columnId === toColumnId) return;
    onMove(cardId, toColumnId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            cards={byCol.get(col.id) ?? []}
            onOpen={onOpen}
          />
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <div className="w-52 rounded-sm border border-border bg-background p-2.5 text-sm shadow-md">
            <p className="font-medium">{active.title}</p>
            {active.subtitle ? (
              <p className="text-xs text-muted-foreground">{active.subtitle}</p>
            ) : null}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
