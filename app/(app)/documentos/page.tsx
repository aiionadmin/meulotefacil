"use client";

import { useState } from "react";
import { docsMorador } from "@/lib/data/processos";
import { processos } from "@/lib/data/processos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function DocumentosPage() {
  const [docs, setDocs] = useState(docsMorador);
  const [dragging, setDragging] = useState(false);

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    // TODO: upload real Supabase Storage
    setDocs((prev) => [
      {
        id: `dm-${Date.now()}`,
        nome: files[0].name,
        status: "enviado",
        processoId: "proc-1",
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Documentos do morador
        </h1>
        <p className="text-sm text-muted-foreground">
          Checklist por processo, {/* TODO: plugar Supabase Storage */}
        </p>
      </div>

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
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center ${
          dragging
            ? "border-brand-orange bg-orange-50 dark:bg-brand-navy"
            : "border-border bg-card"
        }`}
      >
        <Upload className="mb-3 h-8 w-8 text-brand-orange" />
        <p className="font-semibold">Enviar documento</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Arraste ou selecione (placeholder sem storage)
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
                  <tr key={d.id} className="border-b border-border/60">
                    <td className="px-3 py-3 font-medium">{d.nome}</td>
                    <td className="px-3 py-3">{proc?.protocolo ?? "n/d"}</td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          d.status === "aprovado"
                            ? "success"
                            : d.status === "enviado"
                              ? "warning"
                              : "muted"
                        }
                      >
                        {d.status}
                      </Badge>
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
