"use client";

import { contratos } from "@/lib/data/clientes";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/app/EmptyState";
import { FileDown } from "lucide-react";

const statusVariant = {
  rascunho: "muted",
  aguardando_assinatura: "warning",
  ativo: "success",
  encerrado: "secondary",
} as const;

const statusLabel = {
  rascunho: "Rascunho",
  aguardando_assinatura: "Aguardando assinatura",
  ativo: "Ativo",
  encerrado: "Encerrado",
} as const;

export default function ContratosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Contratos
        </h1>
        <p className="text-sm text-muted-foreground">
          Lista e geração de PDF · {/* TODO: plugar Supabase / PDF real */}
        </p>
      </div>

      {contratos.length === 0 ? (
        <EmptyState title="Nenhum contrato" description="Contratos aparecerão aqui." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Contratos</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Lote</th>
                  <th className="px-3 py-2">Valor</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Assinado</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {contratos.map((c) => (
                  <tr key={c.id} className="border-b border-border/60">
                    <td className="px-3 py-3 font-medium">{c.clienteNome}</td>
                    <td className="px-3 py-3">{c.loteLabel}</td>
                    <td className="px-3 py-3 tabular-nums">{formatCurrency(c.valor)}</td>
                    <td className="px-3 py-3">
                      <Badge variant={statusVariant[c.status]}>
                        {statusLabel[c.status]}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">{c.assinadoEm ?? "—"}</td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          alert("Geração de PDF em breve (placeholder).")
                        }
                      >
                        <FileDown className="mr-1 h-3.5 w-3.5" />
                        PDF
                      </Button>
                    </td>
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
