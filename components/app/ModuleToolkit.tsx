"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function notify(message: string, description?: string) {
  toast.success(message, { description });
}

export function FilterBar({
  value,
  onChange,
  placeholder = "Buscar…",
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

export function useTextFilter<T>(
  items: T[],
  query: string,
  fields: ((item: T) => string)[]
) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      fields.some((fn) => fn(item).toLowerCase().includes(q))
    );
  }, [items, query, fields]);
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

export const fieldControlClass =
  "flex h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange";

export function DetailSheet({
  open,
  onOpenChange,
  title,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex-1 space-y-4 overflow-y-auto text-sm text-ink">
          {children}
        </div>
        {footer ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-linha pt-4">
            {footer}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2 border-b border-linha/60 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  children,
  onSubmit,
  submitLabel = "Salvar",
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  busy?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-paper text-ink">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {children}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = "outline",
  size = "sm",
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function useSelection<T extends { id: string }>() {
  const [selected, setSelected] = useState<T | null>(null);
  return {
    selected,
    setSelected,
    open: !!selected,
    close: () => setSelected(null),
  };
}
