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
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro">Pagamentos</Link>
            </Button>
            <label className="inline-flex cursor-pointer">
              <input
                type="file"
                accept=".xml,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  // notify needs import - check
                  alert(`Arquivo ${f.name} recebido (stub de captura)`);
                }}
              />
              <span className="inline-flex h-8 items-center rounded-md border border-input px-3 text-xs font-medium">
                Upload XML/PDF
              </span>
            </label>
          </>
        }
      />
      <ModuleSection title="Meus CNPJs (G19)">
        <PaginatedTable
          columns={[
            { key: "cnpj", label: "CNPJ" },
            { key: "razao", label: "Razão social" },
            { key: "cert", label: "Certificado A1" },
            { key: "emi", label: "Emissão" },
            { key: "cap", label: "Captura" },
          ]}
          rows={[
            {
              cnpj: "12.345.678/0001-90",
              razao: "Meu Lote Fácil Ltda",
              cert: (
                <StatusPill tone="warn">Aguardando upload A1</StatusPill>
              ),
              emi: "NFSe preparada",
              cap: "XML/PDF",
            },
          ]}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Certificado A1 real e emissão Sefaz ficam desligados até homologação.
          Upload de XML/PDF abaixo alimenta a lista de notas.
        </p>
      </ModuleSection>
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
