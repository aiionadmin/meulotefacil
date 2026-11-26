"use client";

import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { downloadTextTemplate } from "@/lib/export/list-export";
import { useCarteira } from "@/lib/store/carteira-store";

const MODELOS = [
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
] as const;

export default function DocumentosContratoPage() {
  const { state } = useCarteira();
  const contrato = state.contracts[0];

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Documentos do contrato"
        description="Modelos LoteWin: contrato, promissórias e mala direta (H14)."
      />
      <DataTable
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const ct = contrato;
                const body =
                  m.id === "contrato"
                    ? [
                        "CONTRATO DE COMPRA E VENDA DE LOTE",
                        `Número: ${ct?.numero ?? "—"}`,
                        `Comprador: ${ct?.compradorNome ?? "—"}`,
                        `Empreendimento: ${ct?.empNome ?? "—"}`,
                        `Lote: ${ct?.quadra ?? ""}/${ct?.lote ?? ""}`,
                        `Preço: ${ct?.preco ?? 0}`,
                        "",
                        "Cláusulas padrão Meu Lote Fácil…",
                      ].join("\n")
                    : m.id === "promissoria"
                      ? [
                          "NOTAS PROMISSÓRIAS",
                          `Contrato ${ct?.numero ?? "—"}`,
                          `Emitente: ${ct?.compradorNome ?? "—"}`,
                          "Série gerada conforme plano de pagamento.",
                        ].join("\n")
                      : [
                          "MALA DIRETA",
                          `Prezado(a) ${ct?.compradorNome ?? "cliente"},`,
                          `Referente ao lote ${ct?.quadra ?? ""}/${ct?.lote ?? ""} em ${ct?.empNome ?? ""}.`,
                          "Segue posição financeira atualizada.",
                        ].join("\n");
                downloadTextTemplate(`${m.id}-${ct?.numero ?? "modelo"}.txt`, body);
                notify("Documento gerado", m.nome);
              }}
            >
              Gerar
            </Button>
          ),
        }))}
      />
    </div>
  );
}
