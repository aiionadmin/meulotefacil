"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { useFase1 } from "@/lib/store/fase1-store";

export default function NotificacoesPage() {
  const { state, markNotificationRead, markAllNotificationsRead } = useFase1();
  const unread = state.notifications.filter((n) => !n.lida).length;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Notificações"
        description="Leads, tarefas, aprovações e alertas do sistema."
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
      <DataTable
        columns={[
          { key: "titulo", label: "Título" },
          { key: "corpo", label: "Detalhe" },
          { key: "status", label: "Status" },
          { key: "acao", label: "" },
        ]}
        rows={state.notifications.map((n) => ({
          titulo: <span className="font-medium">{n.titulo}</span>,
          corpo: n.corpo ?? "—",
          status: (
            <StatusPill tone={n.lida ? "neutral" : "info"}>
              {n.lida ? "Lida" : "Nova"}
            </StatusPill>
          ),
          acao: (
            <div className="flex gap-2">
              {!n.lida ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markNotificationRead(n.id)}
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
        }))}
      />
    </div>
  );
}
