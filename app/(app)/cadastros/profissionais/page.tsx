"use client";

import { Suspense } from "react";
import { PeopleModule } from "@/components/domain/PeopleModule";

export default function ProfissionaisPage() {
  return (
    <Suspense>
      <PeopleModule
        title="Profissionais"
        description="Visão filtrada de pessoas com papel profissional."
        papelFilter="profissional"
      />
    </Suspense>
  );
}
