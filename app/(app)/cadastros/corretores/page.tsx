"use client";

import { Suspense } from "react";
import { PeopleModule } from "@/components/domain/PeopleModule";

export default function CorretoresPage() {
  return (
    <Suspense>
      <PeopleModule
        title="Corretores"
        description="Visão filtrada de pessoas com papel corretor."
        papelFilter="corretor"
      />
    </Suspense>
  );
}
