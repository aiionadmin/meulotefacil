"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lotes } from "@/lib/data/lotes";
import { atividades, propostas, vendasPorMes } from "@/lib/data/clientes";
import { formatCurrency } from "@/lib/utils";
import { useCounter } from "@/components/motion/useCounter";
import { SalesChartLazy } from "@/components/app/SalesChartLazy";

function Kpi({
  label,
  value,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useCounter<HTMLSpanElement>(value, { prefix, suffix });
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl text-brand-navy dark:text-brand-cream">
          <span ref={ref}>0</span>
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const disponiveis = lotes.filter((l) => l.status === "disponivel").length;
  const reservados = lotes.filter((l) => l.status === "reservado").length;
  const vendidos = lotes.filter((l) => l.status === "vendido").length;
  const receita = vendasPorMes[vendasPorMes.length - 1]?.receita ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Visão geral · dados mock {/* TODO: plugar Supabase */}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Lotes disponíveis" value={disponiveis} />
        <Kpi label="Reservados" value={reservados} />
        <Kpi label="Vendidos" value={vendidos} />
        <Kpi label="Receita do mês" value={receita} prefix="R$ " />
        <Kpi label="Inadimplência" value={3.2} suffix="%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vendas por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChartLazy data={vendasPorMes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas propostas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {propostas.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{p.clienteNome}</p>
                  <p className="text-xs text-muted-foreground">{p.loteLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(p.valor)}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {p.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividades recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {atividades.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4">
              <p className="text-sm">{a.texto}</p>
              <span className="shrink-0 text-xs text-muted-foreground">{a.quando}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
