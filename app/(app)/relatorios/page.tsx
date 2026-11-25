"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleHeader, StatusPill } from "@/components/app/ModulePage";
import { relatoriosCatalogo } from "@/lib/data/sistema";

export default function RelatoriosPage() {
  const grupos = [...new Set(relatoriosCatalogo.map((r) => r.grupo))];

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Central de relatórios"
        description="Filtro por empreendimento/centro de custo e período; saída em tela, PDF e Excel; favoritos."
        actions={
          <Button asChild size="sm">
            <Link href="/relatorios">Favoritos</Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {grupos.map((grupo) => (
          <Card key={grupo}>
            <CardHeader>
              <CardTitle className="text-base">{grupo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {relatoriosCatalogo
                .filter((r) => r.grupo === grupo)
                .map((r) => (
                  <div
                    key={r.nome}
                    className="flex items-center justify-between gap-2 border-b border-linha/60 py-2 text-sm last:border-0"
                  >
                    <span>{r.nome}</span>
                    <StatusPill tone="neutral">{r.origem}</StatusPill>
                  </div>
                ))}
              <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                <Link href="/relatorios">Gerar</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
