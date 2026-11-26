"use client";

import { useCallback, useState } from "react";
import { docsMorador, processos } from "@/lib/data/processos";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { useDemoStore } from "@/lib/store/demo-store";

type DocStatus = "pendente" | "enviado" | "aprovado" | "recusado";
type DocRow = {
  id: string;
  nome: string;
  status: DocStatus;
  processoId: string;
};

const STATUS_COLS: { id: DocStatus; label: string }[] = [
  { id: "pendente", label: "Pendente" },
  { id: "enviado", label: "Enviado" },
  { id: "aprovado", label: "Aprovado" },
  { id: "recusado", label: "Recusado" },
];

export default function DocumentosPage() {
  const { addArquivo } = useDemoStore();
  const [docs, setDocs] = useState<DocRow[]>(
    docsMorador.map((d) => ({
      id: d.id,
      nome: d.nome,
      processoId: d.processoId,
      status: (d.status === "enviado" ? "enviado" : "pendente") as DocStatus,
    }))
  );
  const [dragging, setDragging] = useState(false);

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    setDocs((prev) => [
      {
        id: `dm-${Date.now()}`,
        nome: file.name,
        status: "enviado",
        processoId: "proc-1",
      },
      ...prev,
    ]);
    addArquivo({
      nome: file.name,
      rotina: "Regularização",
      tag: "Morador",
      tamanho: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    });
    notify("Documento enviado", file.name);
  };

  const toCard = useCallback(
    (d: DocRow) => ({
      id: d.id,
      columnId: d.status,
      title: d.nome,
      subtitle:
        processos.find((p) => p.id === d.processoId)?.protocolo ?? d.processoId,
      badge: d.status,
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Documentos do morador"
        description="Kanban | Lista por status (C19). Uploads entram em Arquivos."
      />
      <KpiGrid
        items={[
          { label: "Itens checklist", value: docs.length },
          {
            label: "Enviados",
            value: docs.filter((d) => d.status === "enviado").length,
          },
          {
            label: "Pendentes",
            value: docs.filter((d) => d.status === "pendente").length,
          },
          { label: "Processos", value: processos.length },
        ]}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-sm border-2 border-dashed px-6 py-14 text-center ${
          dragging
            ? "border-brand-accent-strong bg-orange-50"
            : "border-linha bg-white"
        }`}
      >
        <Upload className="mb-3 h-8 w-8 text-brand-accent-strong" />
        <p className="font-semibold text-ink">Enviar documento</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Arraste ou selecione um arquivo
        </p>
        <label className="mt-4">
          <input
            type="file"
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <Button type="button" asChild>
            <span>Selecionar arquivo</span>
          </Button>
        </label>
      </div>

      <ProcessBoard
        storageKey="documentos-morador"
        columns={STATUS_COLS}
        rows={docs}
        toCard={toCard}
        onMove={(id, to) => {
          setDocs((list) =>
            list.map((d) =>
              d.id === id ? { ...d, status: to as DocStatus } : d
            )
          );
          return true;
        }}
        exportName="documentos-morador"
        listColumns={[
          {
            key: "nome",
            label: "Documento",
            filter: { type: "text" },
            getValue: (d) => d.nome,
          },
          {
            key: "proc",
            label: "Processo",
            filter: { type: "text" },
            getValue: (d) =>
              processos.find((p) => p.id === d.processoId)?.protocolo ??
              d.processoId,
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: STATUS_COLS.map((c) => ({
                value: c.id,
                label: c.label,
              })),
            },
            getValue: (d) => d.status,
            render: (d) => (
              <StatusPill
                tone={
                  d.status === "aprovado"
                    ? "ok"
                    : d.status === "recusado"
                      ? "danger"
                      : "info"
                }
              >
                {d.status}
              </StatusPill>
            ),
          },
        ]}
      />
    </div>
  );
}
