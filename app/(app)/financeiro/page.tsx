"use client";

import { useMemo, useState } from "react";
import { parcelas } from "@/lib/data/clientes";
import type { StatusParcela } from "@/lib/data/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const labels: Record<StatusParcela, string> = {
  a_receber: "A receber",
  vencida: "Vencida",
  paga: "Paga",
};

const variants: Record<StatusParcela, "warning" | "default" | "success"> = {
  a_receber: "warning",
  vencida: "default",
  paga: "success",
};

export default function FinanceiroPage() {
  const [status, setStatus] = useState<string>("todos");
  const [periodo, setPeriodo] = useState("todos");

  const filtered = useMemo(() => {
    return parcelas.filter((p) => {
      if (status !== "todos" && p.status !== status) return false;
      if (periodo === "mes") {
        return p.vencimento.startsWith("2026-03") || p.vencimento.startsWith("2026-04");
      }
      return true;
    });
  }, [status, periodo]);

  const totals = useMemo(() => {
    return {
      aReceber: parcelas
        .filter((p) => p.status === "a_receber")
        .reduce((a, p) => a + p.valor, 0),
      vencidas: parcelas
        .filter((p) => p.status === "vencida")
        .reduce((a, p) => a + p.valor, 0),
      pagas: parcelas
        .filter((p) => p.status === "paga")
        .reduce((a, p) => a + p.valor, 0),
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Financeiro
        </h1>
        <p className="text-sm text-muted-foreground">
          Parcelas · {/* TODO: plugar Supabase */}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">A receber</CardTitle>
          </CardHeader>
          <CardContent className="font-display text-2xl text-brand-orange">
            {formatCurrency(totals.aReceber)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Vencidas</CardTitle>
          </CardHeader>
          <CardContent className="font-display text-2xl text-destructive">
            {formatCurrency(totals.vencidas)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pagas</CardTitle>
          </CardHeader>
          <CardContent className="font-display text-2xl text-emerald-600">
            {formatCurrency(totals.pagas)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle>Parcelas</CardTitle>
          <div className="flex gap-2">
            <select
              className="h-10 rounded-lg border border-input bg-white px-3 text-sm dark:bg-brand-navy"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todos">Todos status</option>
              <option value="a_receber">A receber</option>
              <option value="vencida">Vencida</option>
              <option value="paga">Paga</option>
            </select>
            <select
              className="h-10 rounded-lg border border-input bg-white px-3 text-sm dark:bg-brand-navy"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <option value="todos">Todo período</option>
              <option value="mes">Este mês (demo)</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">Lote</th>
                <th className="px-3 py-2">Parcela</th>
                <th className="px-3 py-2">Valor</th>
                <th className="px-3 py-2">Vencimento</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="px-3 py-3 font-medium">{p.clienteNome}</td>
                  <td className="px-3 py-3">{p.loteLabel}</td>
                  <td className="px-3 py-3">
                    {p.numero}/{p.totalParcelas}
                  </td>
                  <td className="px-3 py-3 tabular-nums">{formatCurrency(p.valor)}</td>
                  <td className="px-3 py-3">{p.vencimento}</td>
                  <td className="px-3 py-3">
                    <Badge variant={variants[p.status]}>{labels[p.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
