"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import { notify } from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { parseNfeXml } from "@/lib/import/nfe-xml";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import type { NotaFiscal } from "@/lib/domain/financeiro-types";

export default function NotasFiscaisPage() {
  const { state } = useFinanceiro();
  const [certName, setCertName] = useState<string | null>(null);
  const [xmlPreview, setXmlPreview] = useState<string>("");

  const STATUS_COLS = [
    { id: "pendente", label: "Pendente" },
    { id: "vinculada", label: "Vinculada" },
  ];

  const toCard = useCallback((n: NotaFiscal) => {
    const col = n.lancada ? "vinculada" : "pendente";
    return {
      id: n.id,
      columnId: col,
      title: `${n.serie}-${n.numero}`,
      subtitle: n.emissor,
      badge: formatBRL(n.valor),
      meta: n.situacao,
    };
  }, []);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Notas fiscais"
        description="Kanban | Lista (C19) · Meus CNPJs e captura XML/PDF (G19)."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/pagamentos">Pagamentos</Link>
            </Button>
            <label className="inline-flex cursor-pointer">
              <input
                type="file"
                accept=".xml,.pdf"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.name.toLowerCase().endsWith(".xml")) {
                    const text = await f.text();
                    const p = parseNfeXml(text);
                    setXmlPreview(
                      p.ok
                        ? `${p.tipo.toUpperCase()} ${p.serie ?? ""}-${p.numero ?? ""} · ${p.emissor ?? "—"} · ${p.valor != null ? formatBRL(p.valor) : "—"}`
                        : `Leitura parcial: ${p.erros.join("; ") || f.name}`
                    );
                    notify(
                      p.ok ? "XML interpretado" : "XML com avisos",
                      p.numero
                        ? `NF ${p.numero}${p.valor != null ? ` · ${formatBRL(p.valor)}` : ""}`
                        : f.name
                    );
                  } else {
                    setXmlPreview(`PDF recebido: ${f.name}`);
                    notify("PDF recebido", f.name);
                  }
                }}
              />
              <span className="inline-flex h-8 items-center rounded-md border border-input px-3 text-xs font-medium hover:bg-accent">
                Upload XML/PDF
              </span>
            </label>
          </>
        }
      />
      {xmlPreview ? (
        <p className="text-sm text-muted-foreground">{xmlPreview}</p>
      ) : null}
      <ModuleSection title="Meus CNPJs (G19)">
        <PaginatedTable
          columns={[
            { key: "cnpj", label: "CNPJ" },
            { key: "razao", label: "Razão social" },
            { key: "cert", label: "Certificado A1" },
            { key: "emi", label: "Emissão" },
            { key: "cap", label: "Captura" },
            { key: "acao", label: "" },
          ]}
          rows={[
            {
              cnpj: "12.345.678/0001-90",
              razao: "Meu Lote Fácil Ltda",
              cert: (
                <StatusPill tone={certName ? "ok" : "warn"}>
                  {certName ? certName : "Aguardando upload A1"}
                </StatusPill>
              ),
              emi: "NFSe preparada",
              cap: "XML/PDF",
              acao: (
                <label className="inline-flex cursor-pointer">
                  <input
                    type="file"
                    accept=".pfx,.p12"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setCertName(f.name);
                      notify(
                        "Certificado A1 registrado (stub)",
                        "Emissão Sefaz permanece desligada até homologação"
                      );
                    }}
                  />
                  <span className="inline-flex h-7 items-center rounded-md border border-input px-2 text-xs hover:bg-accent">
                    Enviar .pfx
                  </span>
                </label>
              ),
            },
          ]}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Upload A1 é persistido só na sessão até o vault de certificados;
          emissão Sefaz/NFSe fica desligada.
        </p>
      </ModuleSection>

      <ProcessBoard
        storageKey="notas-fiscais"
        columns={STATUS_COLS}
        rows={state.notas}
        toCard={toCard}
        columnTotals={(_, items) => items.reduce((a, n) => a + n.valor, 0)}
        onMove={() => {
          notify("Vínculo de lançamento pela tela de pagamentos");
          return false;
        }}
        exportName="notas-fiscais"
        listColumns={[
          {
            key: "emi",
            label: "Emissão",
            filter: { type: "period" },
            getValue: (n) => n.emissao,
            render: (n) => formatDateBR(n.emissao),
          },
          {
            key: "num",
            label: "Série / Nº",
            filter: { type: "text" },
            getValue: (n) => `${n.serie}-${n.numero}`,
          },
          {
            key: "sit",
            label: "Situação",
            filter: { type: "text" },
            getValue: (n) => n.situacao,
          },
          {
            key: "emissor",
            label: "Emissor",
            filter: { type: "text" },
            getValue: (n) => n.emissor,
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (n) => n.valor,
            render: (n) => formatBRL(n.valor),
          },
          {
            key: "lan",
            label: "Lançamento",
            filter: {
              type: "status",
              options: [
                { value: "pendente", label: "não lançada" },
                { value: "vinculada", label: "lançada" },
              ],
            },
            getValue: (n) => (n.lancada ? "vinculada" : "pendente"),
            render: (n) => (
              <StatusPill tone={n.lancada ? "ok" : "info"}>
                {n.lancada ? "lançada" : "não lançada"}
              </StatusPill>
            ),
          },
        ]}
      />
    </div>
  );
}
