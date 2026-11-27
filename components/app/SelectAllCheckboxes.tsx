"use client";

import { Button } from "@/components/ui/button";

/** Ação “Selecionar todos / Limpar” para grupos de checkbox. */
export function SelectAllCheckboxes({
  allIds,
  selected,
  onChange,
  className,
}: {
  allIds: string[];
  selected: Record<string, boolean> | string[];
  onChange: (next: Record<string, boolean> | string[]) => void;
  className?: string;
}) {
  const selectedSet = Array.isArray(selected)
    ? new Set(selected)
    : new Set(Object.keys(selected).filter((k) => selected[k]));
  const allOn =
    allIds.length > 0 && allIds.every((id) => selectedSet.has(id));

  function toggle() {
    if (Array.isArray(selected)) {
      onChange(allOn ? [] : [...allIds]);
      return;
    }
    if (allOn) {
      const next: Record<string, boolean> = { ...selected };
      for (const id of allIds) next[id] = false;
      onChange(next);
      return;
    }
    const next: Record<string, boolean> = { ...selected };
    for (const id of allIds) next[id] = true;
    onChange(next);
  }

  if (allIds.length === 0) return null;

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={className}
      onClick={toggle}
    >
      {allOn ? "Limpar seleção" : "Selecionar todos"}
    </Button>
  );
}
