"use client";

import { Suspense } from "react";
import { PeopleModule } from "@/components/domain/PeopleModule";

export default function FornecedoresPage() {
  return (
    <Suspense>
      <PeopleModule
        title="Fornecedores"
        description="Visão filtrada de pessoas com papel fornecedor."
        papelFilter="fornecedor"
      />
    </Suspense>
  );
}
