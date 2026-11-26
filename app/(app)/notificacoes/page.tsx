"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { useFase1 } from "@/lib/store/fase1-store";

export default function NotificacoesPage() {
  const { state, markNotificationRead, markAllNotificationsRead } = useFase1();
  const unread = state.notifications.filter((n) => !n.lida).length;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Notificações"
        description="Leads, tarefas, aprovações e alertas — lista com ações em lote (C15)."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              markAllNotificationsRead();
              notify("Todas marcadas como lidas");
            }}
          >
            Marcar todas como lidas
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Total", value: state.notifications.length },
          { label: "Não lidas", value: unread },
        ]}
      />
      <ProcessList
        storageKey="notificacoes"
        exportName="notificacoes"
        rows={state.notifications}
        empty="Sem notificações."
        bulkActions={[
          {
            label: "Marcar lidas",
            onClick: (ids) => {
              for (const id of ids) markNotificationRead(id);
              notify(`${ids.length} marcada(s) como lida(s)`);
            },
          },
        ]}
        columns={[
          {
            key: "titulo",
            label: "Título",
            filter: { type: "text" },
            getValue: (n) => n.titulo,
            render: (n) => <span className="font-medium">{n.titulo}</span>,
          },
          {
            key: "corpo",
            label: "Detalhe",
            filter: { type: "text" },
            getValue: (n) => n.corpo ?? "",
            render: (n) => n.corpo ?? "—",
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: [
                { value: "nova", label: "Nova" },
                { value: "lida", label: "Lida" },
              ],
            },
            getValue: (n) => (n.lida ? "lida" : "nova"),
            render: (n) => (
              <StatusPill tone={n.lida ? "neutral" : "info"}>
                {n.lida ? "Lida" : "Nova"}
              </StatusPill>
            ),
          },
          {
            key: "acao",
            label: "",
            getValue: () => "",
            render: (n) => (
              <div className="flex gap-2">
                {!n.lida ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationRead(n.id);
                    }}
                  >
                    Ler
                  </Button>
                ) : null}
                {n.link ? (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={n.link}>Abrir</Link>
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
