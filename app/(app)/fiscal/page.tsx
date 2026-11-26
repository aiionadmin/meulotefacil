"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
  ModuleSection,
  DataTable,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { downloadTextTemplate } from "@/lib/export/list-export";
import {
  buildContabilidadeCsv,
  buildDimobText,
  buildSpedContribuicoes,
} from "@/lib/export/fiscal-files";
import { useEmpresa } from "@/lib/empresa/context";
import { useFluxo } from "@/lib/store/fluxo-store";
import { useCarteira } from "@/lib/store/carteira-store";
import { LOTEWIN_PANEL_2026_11_24 } from "@/lib/domain/operacoes-seed";
import type { FiscalDoc } from "@/lib/domain/fluxo-types";

const COLS = [
  { id: "pendente", label: "Pendente" },
  { id: "vinculada", label: "Vinculada" },
  { id: "autorizada", label: "Autorizada" },
  { id: "cancelada", label: "Cancelada" },
];

export default function FiscalPage() {
  const { state, vincularNfe } = useFluxo();
  const { state: cart } = useCarteira();
  const {
    selected,
    selectedId,
    filterByEmpresa,
    filterByDevelopmentEmpresa,
  } = useEmpresa();
  const developments = filterByEmpresa(cart.developments);
  const contracts = filterByDevelopmentEmpresa(
    cart.contracts,
    cart.developments
  );
  const installments = filterByDevelopmentEmpresa(
    cart.installments.map((i) => {
      const c = cart.contracts.find((x) => x.id === i.contractId);
      return { ...i, developmentId: c?.developmentId };
    }),
    cart.developments
  );
  const empresaNome =
    selectedId === "todas"
      ? "CONSOLIDADO MLF"
      : (selected?.razaoSocial ?? selected?.nome ?? "MEU LOTE FACIL").toUpperCase();

  const toCard = useCallback(
    (f: FiscalDoc) => ({
      id: f.id,
      columnId: f.status,
      title: `${f.tipo === "nfe_recebida" ? "NFe" : "NFSe"} ${f.numero}`,
      subtitle: f.emissor,
      badge: formatBRL(f.valor),
      meta: formatDateBR(f.emissao),
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Fiscal e contábil"
        description="NFe/NFSe por status — Kanban | Lista (C19). DIMOB/SPED sob demanda."
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

      <ProcessBoard
        storageKey="notas-fiscais"
        columns={COLS}
        rows={state.fiscal}
        toCard={toCard}
        columnTotals={(_, items) => items.reduce((a, f) => a + f.valor, 0)}
        onMove={(id, to) => {
          if (to === "vinculada") {
            vincularNfe(id);
            notify("NFe vinculada");
            return true;
          }
          notify("Transição não permitida nesta demo");
          return false;
        }}
        exportName="notas-fiscais"
        listColumns={[
          {
            key: "tipo",
            label: "Tipo",
            filter: {
              type: "list",
              options: [
                { value: "nfe_recebida", label: "NFe recebida" },
                { value: "nfse_emitida", label: "NFSe emitida" },
              ],
            },
            getValue: (f) => f.tipo,
            render: (f) =>
              f.tipo === "nfe_recebida" ? "NFe recebida" : "NFSe emitida",
          },
          {
            key: "numero",
            label: "Número",
            filter: { type: "text" },
            getValue: (f) => f.numero,
          },
          {
            key: "emissor",
            label: "Emissor",
            filter: { type: "text" },
            getValue: (f) => f.emissor,
          },
          {
            key: "emissao",
            label: "Emissão",
            filter: { type: "period" },
            getValue: (f) => f.emissao,
            render: (f) => formatDateBR(f.emissao),
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (f) => f.valor,
            render: (f) => formatBRL(f.valor),
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: COLS.map((c) => ({ value: c.id, label: c.label })),
            },
            getValue: (f) => f.status,
            render: (f) => (
              <div className="flex items-center gap-2">
                <StatusPill tone="info">{f.status}</StatusPill>
                {f.status === "pendente" ? (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      vincularNfe(f.id);
                      notify("NFe vinculada ao lançamento");
                    }}
                  >
                    Vincular
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />

      <ModuleSection title="DIMOB / SPED / Contabilidade">
        <DataTable
          columns={[
            { key: "item", label: "Obrigação" },
            { key: "status", label: "Status" },
            { key: "acao", label: "" },
          ]}
          rows={[
            {
              item: "DIMOB",
              status: <StatusPill tone="ok">Arquivo</StatusPill>,
              acao: (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const text = buildDimobText({
                      ano: 2026,
                      empresa: empresaNome,
                      empreendimentos: developments.length,
                      metaEmpreendimentos:
                        LOTEWIN_PANEL_2026_11_24.empreendimentos,
                      contracts: contracts.map((c) => ({
                        ...c,
                        documento: c.compradorId,
                      })),
                      metaContratos: LOTEWIN_PANEL_2026_11_24.contratos,
                    });
                    downloadTextTemplate(
                      `dimob-2026-${selectedId === "todas" ? "consolidado" : selectedId.slice(0, 8)}.txt`,
                      text
                    );
                    notify("DIMOB gerado", empresaNome);
                  }}
                >
                  Gerar arquivo
                </Button>
              ),
            },
            {
              item: "SPED Contribuições",
              status: <StatusPill tone="ok">Arquivo</StatusPill>,
              acao: (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const text = buildSpedContribuicoes({
                      empresa: empresaNome,
                      empreendimentos: developments.length,
                      contracts,
                    });
                    downloadTextTemplate(
                      `sped-contribuicoes-${selectedId === "todas" ? "consolidado" : selectedId.slice(0, 8)}.txt`,
                      text
                    );
                    notify("SPED gerado", empresaNome);
                  }}
                >
                  Gerar arquivo
                </Button>
              ),
            },
            {
              item: "Arquivo contabilidade",
              status: <StatusPill tone="ok">Arquivo</StatusPill>,
              acao: (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    downloadTextTemplate(
                      `contabilidade-${selectedId === "todas" ? "consolidado" : selectedId.slice(0, 8)}.csv`,
                      buildContabilidadeCsv(installments)
                    );
                    notify("Arquivo contábil gerado", empresaNome);
                  }}
                >
                  Gerar arquivo
                </Button>
              ),
            },
          ]}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          H28 — arquivos gerados com a empresa do seletor da barra (
          {selectedId === "todas" ? "consolidado" : empresaNome}).
        </p>
      </ModuleSection>
    </div>
  );
}
