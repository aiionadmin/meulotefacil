"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { downloadTextTemplate } from "@/lib/export/list-export";
import {
  buildContratoDocText,
  downloadContratoDocPdf,
  type ContratoDocTipo,
} from "@/lib/export/contrato-docs";
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
  const [contractId, setContractId] = useState(state.contracts[0]?.id ?? "");
  const contrato = useMemo(
    () =>
      state.contracts.find((c) => c.id === contractId) ?? state.contracts[0],
    [state.contracts, contractId]
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
        description="Modelos LoteWin: contrato, promissórias e mala direta (H14)."
        actions={
          <select
            className={fieldControlClass + " w-auto min-w-[200px]"}
            value={contrato?.id ?? ""}
            onChange={(e) => setContractId(e.target.value)}
          >
            {state.contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.numero} · {c.compradorNome}
              </option>
            ))}
          </select>
        }
      />
      <DataTable
        exportName="modelos-contrato"
        columns={[
          { key: "nome", label: "Modelo" },
          { key: "desc", label: "Descrição" },
          { key: "status", label: "Status" },
          { key: "acao", label: "" },
        ]}
        rows={MODELOS.map((m) => ({
          nome: m.nome,
          desc: m.descricao,
          status: <StatusPill tone="ok">Disponível</StatusPill>,
          acao: (
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={!docInput}
                onClick={() => {
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
                onClick={() => {
                  if (!docInput) return;
                  downloadContratoDocPdf(m.id, docInput);
                  notify("PDF gerado", m.nome);
                }}
              >
                PDF
              </Button>
            </div>
          ),
        }))}
      />
    </div>
  );
}
