"use client";

import Link from "next/link";
import { nucleos, statusNucleoLabel, lotesLabel } from "@/lib/data/nucleos";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NucleosMap } from "@/components/site/NucleosMap";
import { ModuleHeader } from "@/components/app/ModulePage";

export default function NucleosPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Núcleos"
        description="Portfólio operacional de núcleos em Campinas e região."
      />

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
