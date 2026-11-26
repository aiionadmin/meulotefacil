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
                    const lines = [
                      "DIMOB|ANO=2026|EMPRESA=MEU LOTE FACIL",
                      `EMPREENDIMENTOS|${cart.developments.length}|META=${LOTEWIN_PANEL_2026_11_24.empreendimentos}`,
                      `CONTRATOS|${cart.contracts.length}|META=${LOTEWIN_PANEL_2026_11_24.contratos}`,
                      ...cart.contracts.map(
                        (c) =>
                          `R01|${c.numero}|${c.compradorNome}|${c.empNome}|${c.preco.toFixed(2)}`
                      ),
                    ];
                    downloadTextTemplate("dimob-2026.txt", lines.join("\n"));
                    notify("DIMOB gerado", "dimob-2026.txt");
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
                    const lines = [
                      "|0000|SPED|CONTRIBUICOES|MEU LOTE FACIL|",
                      `|0140|${cart.developments.length}|`,
                      ...cart.contracts.slice(0, 50).map(
                        (c) =>
                          `|C100|${c.numero}|${c.dataContrato}|${c.preco.toFixed(2)}|`
                      ),
                      "|9999|",
                    ];
                    downloadTextTemplate("sped-contribuicoes.txt", lines.join("\n"));
                    notify("SPED gerado", "sped-contribuicoes.txt");
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
                    const headers = "data;conta;historico;debito;credito";
                    const rows = cart.installments
                      .filter((i) => i.status === "paga")
                      .slice(0, 200)
                      .map(
                        (i) =>
                          `${i.pagoEm ?? ""};1.1.01;Recibo ${i.contratoNumero} parc.${i.n};0;${i.valor}`
                      );
                    downloadTextTemplate(
                      "contabilidade.csv",
                      [headers, ...rows].join("\n")
                    );
                    notify("Arquivo contábil gerado", "contabilidade.csv");
                  }}
                >
                  Gerar arquivo
                </Button>
              ),
            },
          ]}
        />
      </ModuleSection>
    </div>
  );
}
