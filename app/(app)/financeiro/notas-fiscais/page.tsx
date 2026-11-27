"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  FormSheet,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import { parseNfeXml } from "@/lib/import/nfe-xml";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import type { NotaFiscal } from "@/lib/domain/financeiro-types";

export default function NotasFiscaisPage() {
  const {
    state,
    addNota,
    vincularNota,
    desvincularNota,
    updateMeuCnpj,
  } = useFinanceiro();
  const [xmlPreview, setXmlPreview] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [notaLink, setNotaLink] = useState<NotaFiscal | null>(null);
  const [lanId, setLanId] = useState("");

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

  const cnpjs = state.meusCnpjs ?? [];

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Notas Fiscais"
        description="Upload XML/PDF, vínculo com lançamento. Emissão NFSe e captura Sefaz preparadas (desligadas)."
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
                  const meu =
                    cnpjs[0]?.cnpj ?? "00.000.000/0001-00";
                  if (f.name.toLowerCase().endsWith(".xml")) {
                    const text = await f.text();
                    const p = parseNfeXml(text);
                    setXmlPreview(
                      p.ok
                        ? `${p.tipo.toUpperCase()} ${p.serie ?? ""}-${p.numero ?? ""} · ${p.emissor ?? "—"} · ${p.valor != null ? formatBRL(p.valor) : "—"}`
                        : `Leitura parcial: ${p.erros.join("; ") || f.name}`
                    );
                    addNota({
                      emissao: p.emissao ?? new Date().toISOString().slice(0, 10),
                      serie: p.serie ?? "1",
                      numero: p.numero ?? String(Date.now()).slice(-6),
                      situacao: p.ok ? "autorizada" : "leitura_parcial",
                      emissor: p.emissor ?? f.name,
                      cnpj: "—",
                      valor: p.valor ?? 0,
                      lancada: false,
                      meuCnpj: meu,
                    });
                    notify(
                      p.ok ? "Nota persistida do XML" : "Nota com avisos",
                      p.numero ?? f.name
                    );
                  } else {
                    setXmlPreview(`PDF recebido: ${f.name}`);
                    addNota({
                      emissao: new Date().toISOString().slice(0, 10),
                      serie: "PDF",
                      numero: String(Date.now()).slice(-6),
                      situacao: "arquivo",
                      emissor: f.name,
                      cnpj: "—",
                      valor: 0,
                      lancada: false,
                      meuCnpj: meu,
                    });
                    notify("PDF anexado como nota", f.name);
                  }
                  e.target.value = "";
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

      <ModuleSection title="Meus CNPJs">
        <PaginatedTable
          columns={[
            { key: "cnpj", label: "CNPJ" },
            { key: "razao", label: "Razão social" },
            { key: "cert", label: "Certificado A1" },
            { key: "emi", label: "Emissão NFSe" },
            { key: "cap", label: "Captura automática" },
            { key: "acao", label: "" },
          ]}
          rows={cnpjs.map((c) => ({
            cnpj: c.cnpj,
            razao: c.razaoSocial,
            cert: (
              <StatusPill tone={c.certificadoNome ? "ok" : "warn"}>
                {c.certificadoNome ?? "Sem certificado"}
              </StatusPill>
            ),
            emi: (
              <label className="inline-flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={c.emissaoNfse}
                  onChange={(e) => {
                    updateMeuCnpj(c.id, { emissaoNfse: e.target.checked });
                    notify(
                      e.target.checked
                        ? "NFSe marcada (provedor desligado)"
                        : "NFSe desligada"
                    );
                  }}
                />
                {c.emissaoNfse ? "Preparada" : "Off"}
              </label>
            ),
            cap: (
              <label className="inline-flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={c.capturaAutomatica}
                  onChange={(e) => {
                    updateMeuCnpj(c.id, {
                      capturaAutomatica: e.target.checked,
                    });
                    notify(
                      e.target.checked
                        ? "Captura Sefaz marcada (desligada)"
                        : "Captura desligada"
                    );
                  }}
                />
                {c.capturaAutomatica ? "Preparada" : "Off"}
              </label>
            ),
            acao: (
              <label className="inline-flex cursor-pointer">
                <input
                  type="file"
                  accept=".pfx,.p12"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    updateMeuCnpj(c.id, { certificadoNome: f.name });
                    notify(
                      "Certificado A1 registrado (stub)",
                      "Emissão Sefaz permanece desligada"
                    );
                  }}
                />
                <span className="inline-flex h-7 items-center rounded-md border border-input px-2 text-xs hover:bg-accent">
                  Enviar .pfx
                </span>
              </label>
            ),
          }))}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Flags NFSe/Sefaz ficam no modelo; chamadas reais só após escolha do
          provedor.
        </p>
      </ModuleSection>

      <ProcessBoard
        storageKey="notas-fiscais"
        columns={STATUS_COLS}
        rows={state.notas}
        toCard={toCard}
        columnTotals={(_, items) => items.reduce((a, n) => a + n.valor, 0)}
        onMove={() => false}
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
            key: "cnpj",
            label: "CNPJ",
            filter: { type: "text" },
            getValue: (n) => n.cnpj,
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (n) => n.valor,
            render: (n) => formatBRL(n.valor),
          },
          {
            key: "meu",
            label: "Meu CNPJ",
            filter: { type: "text" },
            getValue: (n) => n.meuCnpj,
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
              <div className="flex flex-wrap items-center gap-1">
                <StatusPill tone={n.lancada ? "ok" : "info"}>
                  {n.lancada ? "lançada" : "não lançada"}
                </StatusPill>
                {n.lancada ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      desvincularNota(n.id);
                      notify("Nota desvinculada");
                    }}
                  >
                    Desvincular
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotaLink(n);
                      setLanId("");
                      setLinkOpen(true);
                    }}
                  >
                    Vincular
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <FormSheet
        open={linkOpen}
        onOpenChange={setLinkOpen}
        title={
          notaLink
            ? `Vincular NF ${notaLink.serie}-${notaLink.numero}`
            : "Vincular"
        }
        submitLabel="Vincular lançamento"
        onSubmit={() => {
          if (!notaLink || !lanId) {
            notify("Selecione o lançamento");
            return;
          }
          if (!vincularNota(notaLink.id, lanId)) {
            notify("Falha ao vincular");
            return;
          }
          notify("Nota vinculada");
          setLinkOpen(false);
        }}
      >
        <Field label="Lançamento *">
          <select
            className={fieldControlClass}
            value={lanId}
            onChange={(e) => setLanId(e.target.value)}
          >
            <option value="">Selecione</option>
            {state.lancamentos.map((l) => (
              <option key={l.id} value={l.id}>
                {l.descricao} · {formatBRL(l.valor)} · {l.favorecido}
              </option>
            ))}
          </select>
        </Field>
      </FormSheet>
    </div>
  );
}
