"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { propostas as initial } from "@/lib/data/clientes";
import type { Proposta, StatusProposta } from "@/lib/data/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const columns: { id: StatusProposta; title: string }[] = [
  { id: "nova", title: "Nova" },
  { id: "em_analise", title: "Em análise" },
  { id: "aprovada", title: "Aprovada" },
  { id: "contrato", title: "Contrato" },
];

function CardItem({ proposta, dragging }: { proposta: Proposta; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: proposta.id,
    data: { status: proposta.status },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab rounded-xl border border-border bg-card p-4 shadow-sm active:cursor-grabbing",
        (isDragging || dragging) && "opacity-50"
      )}
    >
      <p className="font-semibold text-sm">{proposta.clienteNome}</p>
      <p className="mt-1 text-xs text-muted-foreground">{proposta.loteLabel}</p>
      <p className="mt-3 text-sm font-bold text-brand-orange tabular-nums">
        {formatCurrency(proposta.valor)}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{proposta.criadoEm}</p>
    </div>
  );
}

function Column({
  id,
  title,
  items,
}: {
  id: StatusProposta;
  title: string;
  items: Proposta[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[420px] flex-col rounded-2xl border border-border bg-muted/40 p-3",
        isOver && "ring-2 ring-brand-orange/50"
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-brand-navy dark:text-brand-cream">{title}</h2>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {items.map((p) => (
          <CardItem key={p.id} proposta={p} />
        ))}
      </div>
    </div>
  );
}

export default function PropostasPage() {
  const [items, setItems] = useState(initial);
  const [active, setActive] = useState<Proposta | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byStatus = useMemo(() => {
    const map: Record<StatusProposta, Proposta[]> = {
      nova: [],
      em_analise: [],
      aprovada: [],
      contrato: [],
    };
    items.forEach((p) => map[p.status].push(p));
    return map;
  }, [items]);

  const onDragStart = (e: DragStartEvent) => {
    setActive(items.find((p) => p.id === e.active.id) ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const { active: a, over } = e;
    if (!over) return;
    const overId = String(over.id);
    const newStatus = columns.some((c) => c.id === overId)
      ? (overId as StatusProposta)
      : items.find((p) => p.id === overId)?.status;
    if (!newStatus) return;
    setItems((prev) =>
      prev.map((p) => (p.id === a.id ? { ...p, status: newStatus } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Propostas
        </h1>
        <p className="text-sm text-muted-foreground">
          Kanban · arraste entre colunas · {/* TODO: plugar Supabase */}
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => (
            <Column key={col.id} id={col.id} title={col.title} items={byStatus[col.id]} />
          ))}
        </div>
        <DragOverlay>
          {active ? <CardItem proposta={active} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
