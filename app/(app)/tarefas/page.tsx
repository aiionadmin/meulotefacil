"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { tarefasMock } from "@/lib/data/sistema";

const colunas = ["A fazer", "Em andamento", "Concluído"] as const;

export default function TarefasPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Tarefas, agenda e comunicação"
        description="Kanban com responsável, prazo e prioridade; agenda; recados por lote/cliente; WhatsApp e e-mail."
        actions={
          <Button asChild size="sm">
            <Link href="/tarefas">Nova tarefa</Link>
          </Button>
        }
      />
      <ModuleSection title="Kanban">
        <div className="grid gap-4 md:grid-cols-3">
          {colunas.map((col) => (
            <Card key={col}>
              <CardHeader>
                <CardTitle className="text-base">{col}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tarefasMock
                  .filter((t) =>
                    col === "Concluído" ? false : t.status === col
                  )
                  .map((t) => (
                    <div
                      key={t.id}
                      className="rounded-sm border border-linha bg-card p-3 text-sm"
                    >
                      <p className="font-medium text-ink">{t.titulo}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.quadro} · {t.responsavel} · {t.prazo}
                      </p>
                      <div className="mt-2">
                        <StatusPill
                          tone={t.prioridade === "Alta" ? "danger" : "info"}
                        >
                          {t.prioridade}
                        </StatusPill>
                      </div>
                    </div>
                  ))}
                {!tarefasMock.some((t) => t.status === col) && col !== "Concluído" ? (
                  <p className="text-xs text-muted-foreground">Sem cartões</p>
                ) : null}
                {col === "Concluído" ? (
                  <p className="text-xs text-muted-foreground">Sem cartões</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </ModuleSection>
      <ModuleSection title="Lista">
        <DataTable
          columns={[
            { key: "titulo", label: "Tarefa" },
            { key: "quadro", label: "Quadro" },
            { key: "responsavel", label: "Responsável" },
            { key: "prazo", label: "Prazo" },
            { key: "status", label: "Status" },
          ]}
          rows={tarefasMock.map((t) => ({
            titulo: t.titulo,
            quadro: t.quadro,
            responsavel: t.responsavel,
            prazo: t.prazo,
            status: <StatusPill tone="info">{t.status}</StatusPill>,
          }))}
        />
      </ModuleSection>
    </div>
  );
}
