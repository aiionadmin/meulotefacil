"use client";

import Link from "next/link";
import { nucleos, statusNucleoLabel, lotesLabel } from "@/lib/data/nucleos";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NucleosMap } from "@/components/site/NucleosMap";

export default function NucleosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Núcleos
        </h1>
        <p className="text-sm text-muted-foreground">
          Portfólio operacional · {/* TODO: plugar Supabase */}
        </p>
      </div>

      <NucleosMap />

      <Card>
        <CardHeader>
          <CardTitle>Todos os núcleos</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2">Núcleo</th>
                <th className="px-3 py-2">Cidade</th>
                <th className="px-3 py-2">Modalidade</th>
                <th className="px-3 py-2">Tamanho</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {nucleos.map((n) => (
                <tr key={n.id} className="border-b border-border/60">
                  <td className="px-3 py-3 font-medium">
                    <Link
                      href={`/regularizacoes/${n.slug}`}
                      className="hover:text-brand-orange"
                    >
                      {n.nome}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{n.cidade}</td>
                  <td className="px-3 py-3">{n.modalidade}</td>
                  <td className="px-3 py-3">{lotesLabel(n)}</td>
                  <td className="px-3 py-3">
                    <Badge
                      variant={
                        n.status === "concluido"
                          ? "success"
                          : n.status === "em_registro"
                            ? "warning"
                            : "default"
                      }
                    >
                      {statusNucleoLabel[n.status]}
                    </Badge>
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
