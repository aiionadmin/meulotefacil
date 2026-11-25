"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";

export default function NotasFiscaisPage() {
  const { state } = useFinanceiro();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Notas fiscais"
        description="Entrada XML/PDF nesta fase; Sefaz/NFSe preparados no modelo e desligados."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/financeiro">Pagamentos</Link>
          </Button>
        }
      />
      <ModuleSection title="Notas recebidas">
        <PaginatedTable
          columns={[
            { key: "emi", label: "Emissão" },
            { key: "num", label: "Série / Nº" },
            { key: "sit", label: "Situação" },
            { key: "emissor", label: "Emissor" },
            { key: "valor", label: "Valor" },
            { key: "lan", label: "Lançamento" },
          ]}
          rows={state.notas.map((n) => ({
            emi: formatDateBR(n.emissao),
            num: `${n.serie}-${n.numero}`,
            sit: n.situacao,
            emissor: `${n.emissor} · ${n.cnpj}`,
            valor: formatBRL(n.valor),
            lan: (
              <StatusPill tone={n.lancada ? "ok" : "info"}>
                {n.lancada ? "lançada" : "não lançada"}
              </StatusPill>
            ),
          }))}
        />
      </ModuleSection>
    </div>
  );
}
