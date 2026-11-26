"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  downloadExcel,
  downloadListPdf,
  printList,
  reactNodeText,
} from "@/lib/export/list-export";
import { usePageTitle } from "@/lib/ui/use-page-title";
import { paginate } from "@/lib/ui/pagination";

export function ModuleHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  usePageTitle(title);
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
  items: { label: string; value: string | number; hint?: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
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
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  empty = "Nenhum registro.",
  onRowClick,
  pageSize = 20,
  paginate: enablePaginate = true,
  exportName,
  exportable = true,
  exportRows,
}: {
  columns: { key: string; label: string; className?: string }[];
  rows: Record<string, React.ReactNode>[];
  empty?: string;
  onRowClick?: (index: number) => void;
  /** B17 — paginação padrão em todas as listas */
  pageSize?: number;
  paginate?: boolean;
  /** C16 — nome do arquivo/título nas exportações */
  exportName?: string;
  exportable?: boolean;
  /** Quando a tabela mostra só uma página, exporta a lista completa */
  exportRows?: Record<string, React.ReactNode>[];
}) {
  const [page, setPage] = useState(1);
  const title = exportName ?? "lista";

  const pageData = useMemo(() => {
    if (!enablePaginate) {
      return {
        items: rows,
        page: 1,
        pageSize: rows.length || pageSize,
        total: rows.length,
        totalPages: 1,
      };
    }
    return paginate(rows, page, pageSize);
  }, [rows, page, pageSize, enablePaginate]);

  const exportMatrix = useMemo(() => {
    const source = exportRows ?? rows;
    const headers = columns.map((c) => c.label);
    const data = source.map((row) =>
      columns.map((c) => reactNodeText(row[c.key]))
    );
    return { headers, data };
  }, [columns, rows, exportRows]);

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
      {exportable ? (
        <div className="flex flex-wrap gap-2 border-b border-linha px-4 py-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              downloadExcel(title, exportMatrix.headers, exportMatrix.data)
            }
          >
            Excel
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              downloadListPdf(title, exportMatrix.headers, exportMatrix.data)
            }
          >
            PDF
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => printList(title)}
          >
            Imprimir
          </Button>
        </div>
      ) : null}
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
            {pageData.items.map((row, i) => {
              const absoluteIndex = (pageData.page - 1) * pageData.pageSize + i;
              return (
                <tr
                  key={absoluteIndex}
                  onClick={
                    onRowClick ? () => onRowClick(absoluteIndex) : undefined
                  }
                  className={cn(
                    "border-b border-linha/70 last:border-0 hover:bg-paper-muted/40",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3", col.className)}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {enablePaginate && pageData.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-linha px-4 py-3 text-sm">
          <p className="text-muted-foreground">
            {pageData.total} registro{pageData.total === 1 ? "" : "s"} · página{" "}
            {pageData.page} de {pageData.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pageData.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pageData.page >= pageData.totalPages}
              onClick={() =>
                setPage((p) => Math.min(pageData.totalPages, p + 1))
              }
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}
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
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg text-ink">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actionHref && actionLabel ? (
          <Button asChild size="sm" variant="outline">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
