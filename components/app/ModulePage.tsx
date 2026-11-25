import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ModuleHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl text-ink">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function KpiGrid({
  items,
}: {
  items: {
    label: string;
    value: string | number;
    hint?: string;
    /** Quando definido, o card inteiro abre a lista de origem. */
    href?: string;
  }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const inner = (
          <>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl text-ink sm:text-3xl">
                {item.value}
              </p>
              {item.hint ? (
                <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
              ) : item.href ? (
                <p className="mt-1 text-xs text-brand-orange">Abrir lista →</p>
              ) : null}
            </CardContent>
          </>
        );
        if (item.href) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-xl transition hover:ring-2 hover:ring-brand-orange/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
            >
              <Card className="h-full">{inner}</Card>
            </Link>
          );
        }
        return <Card key={item.label}>{inner}</Card>;
      })}
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  empty = "Nenhum registro.",
  onRowClick,
}: {
  columns: { key: string; label: string; className?: string }[];
  rows: Record<string, React.ReactNode>[];
  empty?: string;
  onRowClick?: (index: number) => void;
}) {
  if (!rows.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {empty}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-linha bg-paper-muted/60">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 font-medium text-muted-foreground",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                onClick={onRowClick ? () => onRowClick(i) : undefined}
                className={cn(
                  "border-b border-linha/70 last:border-0 hover:bg-paper-muted/40",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3", col.className)}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn" | "danger" | "info";
}) {
  const styles = {
    neutral: "bg-paper-muted text-ink",
    ok: "bg-emerald-50 text-emerald-800",
    warn: "bg-amber-50 text-amber-900",
    danger: "bg-red-50 text-red-800",
    info: "bg-sky-50 text-sky-900",
  } as const;
  return <Badge className={cn("font-medium", styles[tone])}>{children}</Badge>;
}

export function ModuleSection({
  title,
  description,
  children,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-ink">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actionHref && actionLabel ? (
          <Button asChild variant="outline" size="sm">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
