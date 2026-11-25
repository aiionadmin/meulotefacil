"use client";

import { Suspense } from "react";
import { PeopleModule } from "@/components/domain/PeopleModule";

export default function ClientesPage() {
  return (
    <Suspense>
      <PeopleModule
        title="Clientes"
        description="Visão filtrada de pessoas com papel cliente ou comprador."
        papelFilter="cliente"
      />
    </Suspense>
  );
}
