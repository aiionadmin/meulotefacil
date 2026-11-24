"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import Link from "next/link";
import { lotes, loteStatusLabel } from "@/lib/data/lotes";
import { empreendimentos } from "@/lib/data/empreendimentos";
import type { Lote } from "@/lib/data/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const columnHelper = createColumnHelper<Lote>();

export default function LotesPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [status, setStatus] = useState<string>("todos");
  const [emp, setEmp] = useState<string>("todos");

  const data = useMemo(() => {
    return lotes.filter((l) => {
      if (status !== "todos" && l.status !== status) return false;
      if (emp !== "todos" && l.empreendimentoId !== emp) return false;
      return true;
    });
  }, [status, emp]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("quadra", {
        header: "Quadra",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("numero", {
        header: "Lote",
      }),
      columnHelper.accessor("empreendimentoSlug", {
        header: "Empreendimento",
        cell: (info) =>
          empreendimentos.find((e) => e.slug === info.getValue())?.nome ??
          info.getValue(),
      }),
      columnHelper.accessor("metragem", {
        header: "m²",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("valor", {
        header: "Valor",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge
            variant={
              info.getValue() === "disponivel"
                ? "default"
                : info.getValue() === "reservado"
                  ? "warning"
                  : "muted"
            }
          >
            {loteStatusLabel[info.getValue()]}
          </Badge>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
            Lotes
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestão de estoque · {/* TODO: plugar Supabase */}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/lotes/mapa">Ver mapa</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Lista de lotes</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Buscar…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-40"
            />
            <select
              className="h-11 rounded-lg border border-input bg-white px-3 text-sm dark:bg-brand-navy"
              value={emp}
              onChange={(e) => setEmp(e.target.value)}
            >
              <option value="todos">Todos empreendimentos</option>
              {empreendimentos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-lg border border-input bg-white px-3 text-sm dark:bg-brand-navy"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todos">Todos status</option>
              <option value="disponivel">Disponível</option>
              <option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-border text-left">
                    {hg.headers.map((h) => (
                      <th key={h.id} className="px-3 py-2 font-semibold text-muted-foreground">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60 hover:bg-muted/40">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
