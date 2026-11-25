"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/app/ModulePage";
import { fieldControlClass } from "@/components/app/ModuleToolkit";
import { paginateIds } from "@/lib/money/ficha-parcelas";

const PAGE_SIZES = [10, 25, 50, 100] as const;

export function PaginatedTable({
  columns,
  rows,
  empty,
  onRowClick,
  initialPageSize = 25,
}: {
  columns: { key: string; label: string; className?: string }[];
  rows: Record<string, React.ReactNode>[];
  empty?: string;
  onRowClick?: (index: number) => void;
  initialPageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paged = useMemo(
    () => paginateIds(rows, { page, pageSize }),
    [rows, page, pageSize]
  );

  useEffect(() => {
    if (paged.page !== page) setPage(paged.page);
  }, [paged.page, page]);

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        rows={paged.items}
        empty={empty}
        onRowClick={
          onRowClick
            ? (i) => onRowClick((paged.page - 1) * paged.pageSize + i)
            : undefined
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          {paged.total
            ? `${(paged.page - 1) * paged.pageSize + 1}–${Math.min(paged.page * paged.pageSize, paged.total)} de ${paged.total}`
            : "0 registros"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className={fieldControlClass + " h-8 w-auto py-1 text-xs"}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            aria-label="Itens por página"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n} / pág.
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={paged.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span>
            {paged.page}/{paged.pageCount}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={paged.page >= paged.pageCount}
            onClick={() => setPage((p) => Math.min(paged.pageCount, p + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
