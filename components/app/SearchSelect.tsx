"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { fieldControlClass } from "@/components/app/ModuleToolkit";

export type SearchSelectOption = {
  value: string;
  label: string;
  meta?: string;
};

/** Campo de seleção com busca por digitação (C14). */
export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Buscar…",
  emptyLabel = "Nenhum resultado",
  disabled,
  className,
  id,
}: {
  options: SearchSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return options.slice(0, 40);
    return options
      .filter((o) =>
        [o.label, o.meta, o.value].filter(Boolean).join(" ").toLowerCase().includes(term)
      )
      .slice(0, 40);
  }, [options, q]);

  return (
    <div className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        className={cn(fieldControlClass, "w-full text-left")}
        onClick={() => setOpen((v) => !v)}
      >
        {selected ? (
          <span>
            {selected.label}
            {selected.meta ? (
              <span className="text-muted-foreground"> · {selected.meta}</span>
            ) : null}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </button>
      {open ? (
        <div className="absolute z-40 mt-1 w-full rounded-sm border border-border bg-card p-2 shadow-md">
          <input
            autoFocus
            className={cn(fieldControlClass, "mb-2 w-full")}
            placeholder={placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <ul className="max-h-48 overflow-y-auto text-sm">
            {filtered.length === 0 ? (
              <li className="px-2 py-2 text-muted-foreground">{emptyLabel}</li>
            ) : (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-sm px-2 py-1.5 text-left hover:bg-paper-muted",
                      o.value === value && "bg-paper-muted font-medium"
                    )}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                      setQ("");
                    }}
                  >
                    {o.label}
                    {o.meta ? (
                      <span className="block text-xs text-muted-foreground">
                        {o.meta}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
