"use client";

import { useState } from "react";
import { documentos as initial } from "@/lib/data/clientes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/EmptyState";
import { Upload } from "lucide-react";

export default function DocumentosPage() {
  const [docs, setDocs] = useState(initial);
  const [dragging, setDragging] = useState(false);

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    // TODO: upload real para Supabase Storage
    const file = files[0];
    setDocs((prev) => [
      {
        id: `doc-${Date.now()}`,
        nome: file.name,
        tipo: file.name.split(".").pop()?.toUpperCase() || "FILE",
        tamanho: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        atualizadoEm: new Date().toISOString().slice(0, 10),
        relacionadoA: "Upload local (placeholder)",
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Documentos
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload placeholder · {/* TODO: plugar Supabase Storage */}
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
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging
            ? "border-brand-orange bg-orange-50 dark:bg-brand-navy"
            : "border-border bg-card"
        }`}
      >
        <Upload className="mb-3 h-8 w-8 text-brand-orange" />
        <p className="font-semibold">Arraste arquivos aqui</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ou selecione do computador (sem storage ainda)
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

      {docs.length === 0 ? (
        <EmptyState title="Nenhum documento" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Tamanho</th>
                  <th className="px-3 py-2">Atualizado</th>
                  <th className="px-3 py-2">Relacionado a</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-b border-border/60">
                    <td className="px-3 py-3 font-medium">{d.nome}</td>
                    <td className="px-3 py-3">{d.tipo}</td>
                    <td className="px-3 py-3">{d.tamanho}</td>
                    <td className="px-3 py-3">{d.atualizadoEm}</td>
                    <td className="px-3 py-3">{d.relacionadoA}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
