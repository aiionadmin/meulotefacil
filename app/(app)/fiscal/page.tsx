"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { FilterBar, notify } from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFluxo } from "@/lib/store/fluxo-store";

export default function FiscalPage() {
  const { state, vincularNfe } = useFluxo();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.fiscal;
    return state.fiscal.filter((f) =>
      [f.numero, f.emissor, f.tipo, f.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.fiscal, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Fiscal e contábil"
        description="Fase 10 — NFe recebidas, NFSe emitidas; DIMOB/SPED sob demanda do contador."
      />

      <KpiGrid
        items={[
          { label: "Documentos", value: state.fiscal.length },
          {
            label: "NFe pendentes",
            value: state.fiscal.filter(
              (f) => f.tipo === "nfe_recebida" && f.status === "pendente"
            ).length,
          },
          {
            label: "NFSe",
            value: state.fiscal.filter((f) => f.tipo === "nfse_emitida").length,
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar número, emissor…" />

      <DataTable
        columns={[
          { key: "tipo", label: "Tipo" },
          { key: "numero", label: "Número" },
          { key: "emissor", label: "Emissor" },
          { key: "emissao", label: "Emissão" },
          { key: "valor", label: "Valor" },
          { key: "status", label: "Status" },
          { key: "acao", label: "" },
        ]}
        rows={filtered.map((f) => ({
          tipo: f.tipo === "nfe_recebida" ? "NFe recebida" : "NFSe emitida",
          numero: f.numero,
          emissor: f.emissor,
          emissao: formatDateBR(f.emissao),
          valor: formatBRL(f.valor),
          status: <StatusPill tone="info">{f.status}</StatusPill>,
          acao:
            f.status === "pendente" ? (
              <Button
                size="sm"
                onClick={() => {
                  vincularNfe(f.id);
                  notify("NFe vinculada ao lançamento");
                }}
              >
                Vincular
              </Button>
            ) : (
              "—"
            ),
        }))}
      />

      <ModuleSection title="Exportações">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => notify("DIMOB", "Geração anual — confirmar layout com contador")}
          >
            Gerar DIMOB
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => notify("SPED", "Contribuições — confirmar com contador")}
          >
            SPED Contribuições
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => notify("Exportação", "Formato Domínio / Folhamatic")}
          >
            Exportação contábil
          </Button>
        </div>
      </ModuleSection>
    </div>
  );
}
