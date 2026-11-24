"use client";

import { processos, statusProcessoLabel } from "@/lib/data/processos";
import { faseLabel } from "@/lib/data/nucleos";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ProcessosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Processos
        </h1>
        <p className="text-sm text-muted-foreground">
          Núcleo, fase e documentos, {/* TODO: plugar Supabase */}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de processos</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2">Protocolo</th>
                <th className="px-3 py-2">Núcleo</th>
                <th className="px-3 py-2">Morador</th>
                <th className="px-3 py-2">Fase</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Docs</th>
              </tr>
            </thead>
            <tbody>
              {processos.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="px-3 py-3 font-medium">
                    <Link href="/protocolo" className="text-brand-orange hover:underline">
                      {p.protocolo}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/regularizacoes/${p.nucleoSlug}`}
                      className="hover:underline"
                    >
                      {p.nucleoNome}
                    </Link>
                    <p className="text-xs text-muted-foreground">{p.cidade}</p>
                  </td>
                  <td className="px-3 py-3">{p.moradorNome}</td>
                  <td className="px-3 py-3">{faseLabel[p.fase]}</td>
                  <td className="px-3 py-3">
                    <Badge variant="secondary">{statusProcessoLabel[p.status]}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    {p.docsPendentes > 0 ? (
                      <span className="text-brand-orange">{p.docsPendentes} pendente(s)</span>
                    ) : (
                      <span className="text-emerald-600">Em dia</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
