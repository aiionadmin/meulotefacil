"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search, Upload } from "lucide-react";
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
import { releaseDialogLock } from "@/lib/ui/release-dialog-lock";

const MAX_ATTACH_BYTES = 10 * 1024 * 1024;

export function notify(message: string, description?: string) {
  toast.success(message, { description });
}

export function FilterBar({
  value,
  onChange,
  placeholder = "Buscar…",
  children,
  suggestions,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  children?: ReactNode;
  /** Autocomplete: sugestões ao digitar (MLF-139). */
  suggestions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => {
    if (!suggestions?.length) return [];
    const q = value.trim().toLowerCase();
    if (!q) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of suggestions) {
      const t = s.trim();
      if (!t) continue;
      const key = t.toLowerCase();
      if (seen.has(key)) continue;
      if (!key.includes(q)) continue;
      seen.add(key);
      out.push(t);
      if (out.length >= 8) break;
    }
    return out;
  }, [suggestions, value]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // delay so click on suggestion registers
            window.setTimeout(() => setOpen(false), 120);
          }}
          placeholder={placeholder}
          className="pl-9"
          autoComplete="off"
          aria-autocomplete="list"
        />
        {open && matches.length > 0 ? (
          <ul
            role="listbox"
            className="absolute z-40 mt-1 max-h-48 w-full overflow-y-auto rounded-sm border border-border bg-card py-1 text-sm shadow-md"
          >
            {matches.map((m) => (
              <li key={m}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-muted"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(m);
                    setOpen(false);
                  }}
                >
                  {m}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) queueMicrotask(releaseDialogLock);
      }}
    >
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title || "Detalhe"}</SheetTitle>
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
  dirty,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  busy?: boolean;
  dirty?: boolean;
}) {
  function requestClose() {
    if (
      dirty &&
      !window.confirm("Há alterações não salvas. Deseja sair sem salvar?")
    ) {
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) requestClose();
        else onOpenChange(true);
      }}
    >
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
            <Button type="button" variant="outline" onClick={requestClose}>
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

/** Anexo por arrastar e soltar (padrão 10 MB; `maxBytes={null}` = sem teto). */
export function AttachDropZone({
  onFiles,
  label = "Arraste arquivos ou clique para anexar",
  hint = "Até 10 MB por arquivo",
  accept,
  multiple = true,
  /** Limite em bytes. `null` desliga o teto (ex.: planta DXF). */
  maxBytes = MAX_ATTACH_BYTES,
}: {
  onFiles: (files: File[]) => void;
  label?: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  maxBytes?: number | null;
}) {
  const [dragging, setDragging] = useState(false);

  function take(list: FileList | null) {
    if (!list?.length) return;
    const ok: File[] = [];
    for (const f of Array.from(list)) {
      if (maxBytes != null && f.size > maxBytes) {
        toast.error("Arquivo muito grande", {
          description: `${f.name} excede ${Math.round(maxBytes / (1024 * 1024))} MB`,
        });
        continue;
      }
      ok.push(f);
    }
    if (ok.length) onFiles(ok);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        take(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors",
        dragging
          ? "border-brand-orange bg-brand-orange/5"
          : "border-linha bg-paper"
      )}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        if (accept) input.accept = accept;
        input.multiple = multiple;
        input.onchange = () => take(input.files);
        input.click();
      }}
    >
      <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

/** Painel lateral com formulário (réplica Mais Controle). */
export function FormSheet({
  open,
  onOpenChange,
  title,
  children,
  onSubmit,
  submitLabel = "Salvar",
  busy,
  wide,
  dirty,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  busy?: boolean;
  wide?: boolean;
  /** Se true, confirma antes de fechar com alterações não salvas. */
  dirty?: boolean;
}) {
  function requestClose() {
    if (
      dirty &&
      !window.confirm(
        "Há alterações não salvas. Deseja sair sem salvar?"
      )
    ) {
      return;
    }
    onOpenChange(false);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) requestClose();
        else onOpenChange(true);
      }}
    >
      <SheetContent
        side="right"
        className={cn(
          "flex w-full flex-col bg-paper text-ink",
          wide ? "sm:max-w-xl" : "sm:max-w-lg"
        )}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form
          className="mt-4 flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">{children}</div>
          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-linha pt-4">
            <Button type="button" variant="outline" onClick={requestClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
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
