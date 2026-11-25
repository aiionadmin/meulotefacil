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
import { useFinanceiro } from "@/lib/store/financeiro-store";
import { Switch } from "@/components/ui/switch";

export default function FiscalPage() {
  const { state, vincularNfe } = useFluxo();
  const { state: fin, setCnpjToggles } = useFinanceiro();
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

      <ModuleSection title="Meus CNPJs (NFSe / Sefaz)">
        <p className="mb-3 text-sm text-muted-foreground">
          Emissão NFSe e captura Sefaz ficam preparados no modelo e desligados até
          escolha do provedor.
        </p>
        <ul className="space-y-3">
          {fin.meusCnpjs.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="text-sm">
                <div className="font-medium">{c.razaoSocial}</div>
                <div className="text-muted-foreground">
                  {c.cnpj}
                  {c.certificadoValidade
                    ? ` · certificado até ${formatDateBR(c.certificadoValidade)}`
                    : ""}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <Switch
                    checked={c.emissaoNfse}
                    onCheckedChange={(v) => {
                      setCnpjToggles(c.id, { emissaoNfse: v });
                      notify(
                        v
                          ? "NFSe marcado (ainda sem provedor)"
                          : "Emissão NFSe desligada"
                      );
                    }}
                  />
                  Emissão NFSe
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={c.capturaSefaz}
                    onCheckedChange={(v) => {
                      setCnpjToggles(c.id, { capturaSefaz: v });
                      notify(
                        v
                          ? "Captura Sefaz marcada (desligada até provedor)"
                          : "Captura Sefaz desligada"
                      );
                    }}
                  />
                  Captura Sefaz
                </label>
              </div>
            </li>
          ))}
        </ul>
      </ModuleSection>

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
