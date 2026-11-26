"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/app/ModulePage";
import { fieldControlClass } from "@/components/app/ModuleToolkit";
import { paginate } from "@/lib/ui/pagination";

const PAGE_SIZES = [10, 25, 50, 100] as const;

export function PaginatedTable({
  columns,
  rows,
  empty,
  onRowClick,
  initialPageSize = 25,
  exportName,
}: {
  columns: { key: string; label: string; className?: string }[];
  rows: Record<string, React.ReactNode>[];
  empty?: string;
  onRowClick?: (index: number) => void;
  initialPageSize?: number;
  exportName?: string;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paged = useMemo(
    () => paginate(rows, page, pageSize),
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
        paginate={false}
        exportName={exportName}
        exportRows={rows}
        onRowClick={
          onRowClick
            ? (index) => {
                const absolute =
                  (paged.page - 1) * paged.pageSize + index;
                onRowClick(absolute);
              }
            : undefined
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {paged.total} registro(s) · página {paged.page}/{paged.totalPages}
        </span>
        <div className="flex items-center gap-2">
          <select
            className={fieldControlClass + " h-8 w-20 py-0"}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            disabled={paged.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={paged.page >= paged.totalPages}
            onClick={() =>
              setPage((p) => Math.min(paged.totalPages, p + 1))
            }
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
