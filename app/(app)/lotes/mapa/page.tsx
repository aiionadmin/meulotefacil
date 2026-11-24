"use client";

import { LoteMapLazy } from "@/components/app/LoteMapLazy";

export default function LotesMapaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Mapa de lotes
        </h1>
        <p className="text-sm text-muted-foreground">
          Clique para alternar status · {/* TODO: plugar Supabase */}
        </p>
      </div>
      <LoteMapLazy mode="gestao" />
    </div>
  );
}
