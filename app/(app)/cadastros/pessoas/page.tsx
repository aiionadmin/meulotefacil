"use client";

import { Suspense } from "react";
import { PeopleModule } from "@/components/domain/PeopleModule";

export default function PessoasPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
      <PeopleModule
        title="Pessoas"
        description="Cadastro único com papéis: cliente, comprador, fornecedor, profissional, corretor e sócio. Busca, paginação e exportação CSV."
      />
    </Suspense>
  );
}
