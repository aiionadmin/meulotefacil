"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { downloadTextTemplate } from "@/lib/export/list-export";
import { parseCnab400Retorno } from "@/lib/cnab/retorno";
import { useCarteira } from "@/lib/store/carteira-store";
import type { BankSlip } from "@/lib/domain/carteira-types";

export default function BoletosPage() {
  const { state, gerarBoletosMes, gerarRemessa, processarRetorno } =
    useCarteira();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<BankSlip | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.bankSlips;
    return state.bankSlips.filter((b) =>
      [b.nossoNumero, b.contratoNumero, b.status, b.banco]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.bankSlips, q]);

  const toCard = useCallback(
    (b: BankSlip) => ({
      id: b.id,
      columnId: b.status,
      title: b.nossoNumero,
      subtitle: `Ctr ${b.contratoNumero}`,
      badge: formatBRL(b.valor),
      meta: b.banco,
    }),
    []
  );

  const STATUS_COLS = [
    { id: "gerado", label: "Gerado" },
    { id: "remessa", label: "Remessa" },
    { id: "registrado", label: "Registrado" },
    { id: "pago", label: "Pago" },
    { id: "baixado", label: "Baixado" },
    { id: "cancelado", label: "Cancelado" },
  ];

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Boletos e remessa"
        description="Emissão, remessa CNAB e retorno — Kanban | Lista (C19)."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const n = gerarBoletosMes();
                notify(
                  n ? "Boletos gerados" : "Nada a gerar",
                  n ? `${n} título(s)` : "Já emitidos ou travados"
                );
              }}
            >
              Gerar boletos
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const { qtd, arquivo } = gerarRemessa();
                if (arquivo) {
                  downloadTextTemplate(arquivo.nome, arquivo.conteudo);
                }
                notify(
                  qtd ? "Remessa CNAB gerada" : "Sem boletos gerados",
                  qtd ? `${qtd} títulos · arquivo .rem` : undefined
                );
              }}
            >
              Remessa CNAB
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const n = processarRetorno();
                notify(
                  n ? "Retorno processado" : "Nada em remessa",
                  n ? `${n} baixas` : undefined
                );
              }}
            >
              Processar retorno
            </Button>
            <label className="inline-flex cursor-pointer">
              <input
                type="file"
                accept=".ret,.crt,.txt"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const text = await f.text();
                  const preview = parseCnab400Retorno(text);
                  const nn = preview.itens
                    .filter(
                      (i) =>
                        i.ocorrencia === "liquidacao" ||
                        i.ocorrencia === "baixa"
                    )
                    .map((i) => i.nossoNumero);
                  const n = processarRetorno(nn.length ? nn : undefined);
                  notify(
                    preview.ok || nn.length
                      ? "Retorno CNAB importado"
                      : "Retorno sem liquidações",
                    `${f.name} · ${preview.itens.length} título(s) · ${n} baixa(s)${
                      preview.erros.length
                        ? ` · ${preview.erros.length} aviso(s)`
                        : ""
                    }`
                  );
                }}
              />
              <span className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">
                Enviar retorno
              </span>
            </label>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Boletos", value: state.bankSlips.length },
          {
            label: "Gerados",
            value: state.bankSlips.filter((b) => b.status === "gerado").length,
          },
          {
            label: "Em remessa",
            value: state.bankSlips.filter((b) => b.status === "remessa").length,
          },
          {
            label: "Pagos",
            value: state.bankSlips.filter((b) => b.status === "pago").length,
          },
        ]}
      />

      <ProcessBoard
        storageKey="boletos"
        columns={STATUS_COLS}
        rows={filtered}
        toCard={toCard}
        columnTotals={(_, items) => items.reduce((a, b) => a + b.valor, 0)}
        onOpen={(id) => setSelected(state.bankSlips.find((b) => b.id === id) ?? null)}
        onMove={() => {
          notify("Use remessa / retorno para mudar status");
          return false;
        }}
        exportName="boletos"
        listColumns={[
          { key: "nn", label: "Nosso nº", filter: { type: "text" }, getValue: (b) => b.nossoNumero },
          { key: "contrato", label: "Contrato", filter: { type: "text" }, getValue: (b) => b.contratoNumero },
          { key: "banco", label: "Banco", filter: { type: "text" }, getValue: (b) => b.banco },
          { key: "venc", label: "Vencimento", filter: { type: "period" }, getValue: (b) => b.vencimento, render: (b) => formatDateBR(b.vencimento) },
          { key: "valor", label: "Valor", filter: { type: "range" }, getValue: (b) => b.valor, render: (b) => formatBRL(b.valor) },
          { key: "status", label: "Status", filter: { type: "status", options: STATUS_COLS.map((c) => ({ value: c.id, label: c.label })) }, getValue: (b) => b.status, render: (b) => <StatusPill tone="info">{b.status}</StatusPill> },
        ]}
      />

      <ModuleSection title="Arquivos de remessa">
        <DataTable
          columns={[
            { key: "nome", label: "Arquivo" },
            { key: "quando", label: "Criado" },
            { key: "qtd", label: "Qtd" },
            { key: "status", label: "Status" },
            { key: "acao", label: "" },
          ]}
          rows={state.remittances.map((r) => ({
            nome: r.nome,
            quando: r.criadoEm,
            qtd: r.qtd,
            status: <StatusPill tone="neutral">{r.status}</StatusPill>,
            acao: r.conteudo ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadTextTemplate(r.nome, r.conteudo!)}
              >
                Baixar
              </Button>
            ) : (
              "—"
            ),
          }))}
        />
      </ModuleSection>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `Boleto ${selected.nossoNumero}` : ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Contrato" value={selected.contratoNumero} />
            <DetailRow label="Banco" value={selected.banco} />
            <DetailRow label="Valor" value={formatBRL(selected.valor)} />
            <DetailRow label="Vencimento" value={formatDateBR(selected.vencimento)} />
            <DetailRow label="Status" value={selected.status} />
            <DetailRow label="Remessa" value={selected.remessaId ?? "—"} />
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
