"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { nucleos } from "@/lib/data/nucleos";
import { processos, statusProcessoLabel } from "@/lib/data/processos";
import { useCounter } from "@/components/motion/useCounter";
import { faseLabel } from "@/lib/data/nucleos";

function Kpi({ label, value }: { label: string; value: number }) {
  const ref = useCounter<HTMLSpanElement>(value);
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
  const concluidos = nucleos.filter((n) => n.status === "concluido" || n.status === "em_registro").length;
  const andamento = nucleos.filter((n) => n.status === "em_andamento").length;
  const docsPendentes = processos.reduce((a, p) => a + p.docsPendentes, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Painel de processos
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhamento de regularização · {/* TODO: plugar Supabase */}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Núcleos concluídos / registro" value={concluidos} />
        <Kpi label="Núcleos em andamento" value={andamento} />
        <Kpi label="Processos ativos" value={processos.length} />
        <Kpi label="Docs pendentes" value={docsPendentes} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Processos recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {processos.map((p) => (
              <Link
                key={p.id}
                href="/processos"
                className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0 hover:opacity-80"
              >
                <div>
                  <p className="text-sm font-medium">{p.protocolo}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.nucleoNome} · {p.moradorNome}
                  </p>
                </div>
                <Badge variant="secondary">{statusProcessoLabel[p.status]}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fases do processo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(Object.keys(faseLabel) as (keyof typeof faseLabel)[]).map((f, i) => (
              <div key={f} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-orange">
                  {i + 1}
                </span>
                <span>{faseLabel[f]}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
