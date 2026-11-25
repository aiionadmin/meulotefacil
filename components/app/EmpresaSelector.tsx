"use client";

import { Building2 } from "lucide-react";
import { useFase1 } from "@/lib/store/fase1-store";
import { fieldControlClass } from "@/components/app/ModuleToolkit";
import { cn } from "@/lib/utils";

export function EmpresaSelector({ className }: { className?: string }) {
  const { state, currentUser, setSelectedEmpresa } = useFase1();
  const allowed = new Set(currentUser?.organizationIds ?? []);
  const orgs = state.organizations.filter((o) => allowed.has(o.id));
  const multi = orgs.length > 1;

  if (!orgs.length) return null;

  return (
    <label
      className={cn(
        "hidden items-center gap-1.5 text-xs text-muted-foreground md:flex",
        className
      )}
    >
      <Building2 className="size-3.5 shrink-0" aria-hidden />
      <span className="sr-only">Empresa</span>
      <select
        className={cn(fieldControlClass, "h-8 max-w-[180px] py-1 text-xs")}
        value={state.selectedEmpresaId}
        onChange={(e) => setSelectedEmpresa(e.target.value)}
        aria-label="Selecionar empresa"
      >
        {multi ? <option value="todas">Todas</option> : null}
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nomeFantasia || o.razaoSocial}
          </option>
        ))}
      </select>
    </label>
  );
}
