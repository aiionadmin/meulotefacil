"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleHeader, StatusPill } from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { useFase1 } from "@/lib/store/fase1-store";

export default function ListasPage() {
  const { state, toggleLookupItem } = useFase1();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Listas de apoio"
        description="Status de lote, tipos de parcela, formas de pagamento e demais catálogos ()."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {state.lookups.map((list) => (
          <Card key={list.id}>
            <CardHeader>
              <CardTitle className="text-base">{list.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {list.itens.map((item) => (
                <div
                  key={item.codigo}
                  className="flex items-center justify-between gap-2 border-b border-linha/50 py-2 text-sm last:border-0"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {item.codigo} · {item.nome}
                    </p>
                    <StatusPill tone={item.ativo ? "ok" : "warn"}>
                      {item.ativo ? "Ativo" : "Inativo"}
                    </StatusPill>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toggleLookupItem(list.id, item.codigo);
                      notify("Item atualizado", item.nome);
                    }}
                  >
                    Alternar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
