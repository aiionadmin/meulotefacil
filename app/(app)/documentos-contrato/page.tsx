"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  StatusPill,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { SearchSelect } from "@/components/app/SearchSelect";
import { downloadTextTemplate } from "@/lib/export/list-export";
import {
  buildContratoDocText,
  downloadContratoDocPdf,
  type ContratoDocTipo,
} from "@/lib/export/contrato-docs";
import { useEmpresa } from "@/lib/empresa/context";
import { useCarteira } from "@/lib/store/carteira-store";

const MODELOS: {
  id: ContratoDocTipo;
  nome: string;
  descricao: string;
}[] = [
  {
    id: "contrato",
    nome: "Contrato de compra e venda",
    descricao: "Instrumento principal com cláusulas padrão",
  },
  {
    id: "promissoria",
    nome: "Promissórias",
    descricao: "Série de notas promissórias por parcela",
  },
  {
    id: "mala_direta",
    nome: "Mala direta",
    descricao: "Carta ao comprador com dados do lote e saldo",
  },
];

export default function DocumentosContratoPage() {
  const { state, saldoDevedor } = useCarteira();
  const { filterByDevelopmentEmpresa } = useEmpresa();
  const contracts = useMemo(
    () => filterByDevelopmentEmpresa(state.contracts, state.developments),
    [filterByDevelopmentEmpresa, state.contracts, state.developments]
  );
  const [contractId, setContractId] = useState(contracts[0]?.id ?? "");
  const contrato = useMemo(
    () => contracts.find((c) => c.id === contractId) ?? contracts[0],
    [contracts, contractId]
  );

  const docInput = contrato
    ? {
        numero: contrato.numero,
        compradorNome: contrato.compradorNome,
        empNome: contrato.empNome,
        quadra: contrato.quadra,
        lote: contrato.lote,
        preco: contrato.preco,
        dataContrato: contrato.dataContrato,
        saldo: saldoDevedor(contrato.id),
        parcelas: state.installments
          .filter((i) => i.contractId === contrato.id)
          .map((i) => ({
            n: i.n,
            vencimento: i.vencimento,
            valor: i.valor,
          })),
      }
    : null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Documentos do contrato"
        description="H14 — modelos LoteWin; contratos filtrados pela empresa (C01)."
        actions={
          <div className="w-[240px]">
            <SearchSelect
              value={contrato?.id ?? ""}
              onChange={setContractId}
              placeholder="Buscar contrato…"
              options={contracts.map((c) => ({
                value: c.id,
                label: `${c.numero} · ${c.compradorNome}`,
              }))}
            />
          </div>
        }
      />
      <ProcessList
        storageKey="docs-contrato-modelos"
        exportName="modelos-contrato"
        rows={MODELOS}
        empty="Sem modelos."
        columns={[
          {
            key: "nome",
            label: "Modelo",
            filter: { type: "text" },
            getValue: (m) => m.nome,
          },
          {
            key: "desc",
            label: "Descrição",
            filter: { type: "text" },
            getValue: (m) => m.descricao,
          },
          {
            key: "status",
            label: "Status",
            getValue: () => "disponivel",
            render: () => <StatusPill tone="ok">Disponível</StatusPill>,
          },
          {
            key: "acao",
            label: "",
            getValue: () => "",
            render: (m) => (
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!docInput}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!docInput) return;
                    downloadTextTemplate(
                      `${m.id}-${docInput.numero}.txt`,
                      buildContratoDocText(m.id, docInput)
                    );
                    notify("TXT gerado", m.nome);
                  }}
                >
                  TXT
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!docInput}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!docInput) return;
                    downloadContratoDocPdf(m.id, docInput);
                    notify("PDF gerado", m.nome);
                  }}
                >
                  PDF
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
