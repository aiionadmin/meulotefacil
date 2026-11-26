"use client";

import { useState } from "react";
import { docsMorador, processos } from "@/lib/data/processos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { useDemoStore } from "@/lib/store/demo-store";

export default function DocumentosPage() {
  const { addArquivo } = useDemoStore();
  const [docs, setDocs] = useState(docsMorador);
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

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Documentos do morador"
        description="Checklist por processo. Uploads entram no repositório de Arquivos ()."
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
            value: docs.filter((d) => d.status !== "enviado").length,
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

      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2">Documento</th>
                <th className="px-3 py-2">Processo</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => {
                const proc = processos.find((p) => p.id === d.processoId);
                return (
                  <tr key={d.id} className="border-b border-linha/70">
                    <td className="px-3 py-3 font-medium text-ink">{d.nome}</td>
                    <td className="px-3 py-3">
                      {proc?.protocolo ?? d.processoId}
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill
                        tone={d.status === "enviado" ? "ok" : "warn"}
                      >
                        {d.status}
                      </StatusPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
