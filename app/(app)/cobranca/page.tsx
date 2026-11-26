"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
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
import { canApprove } from "@/lib/alcadas/check";
import { formatBRL } from "@/lib/masks/br";
import { useFluxo } from "@/lib/store/fluxo-store";
import { useFase1 } from "@/lib/store/fase1-store";
import type { CollectionCase } from "@/lib/domain/fluxo-types";
import { faixaAtrasoLabel } from "@/lib/cobranca/faixas";
import { emAtrasoCobranca } from "@/lib/indicators/receivables";
import { statusLabel } from "@/lib/status/labels";

const FAIXA_COLS = [
  { id: "a_vencer_5", label: "A vencer 5d" },
  { id: "1_30", label: "1–30" },
  { id: "31_90", label: "31–90" },
  { id: "acordo", label: "Acordo" },
  { id: "juridico", label: "Jurídico" },
  { id: "retomada", label: "Retomada" },
];

export default function CobrancaPage() {
  const { state, registrarContato, proporAcordo, pausarRegua } = useFluxo();
  const { currentUser, state: f1 } = useFase1();
  const perfilNome =
    f1.profiles.find((p) => p.id === currentUser?.profileId)?.nome ?? "—";
  const [selected, setSelected] = useState<CollectionCase | null>(null);

  const totalAtraso = emAtrasoCobranca(state.collection);

  const toCard = useCallback(
    (c: CollectionCase) => ({
      id: c.id,
      columnId: c.faixa,
      title: c.cliente,
      subtitle: `Ctr ${c.contratoNumero} · ${c.empNome}`,
      badge: `${c.diasAtraso}d`,
      meta: formatBRL(c.valorAtualizado),
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Cobrança e inadimplentes"
        description="Régua, contatos e acordos — Kanban | Lista (C19)."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/quadros/cobranca">Quadro cobrança</Link>
          </Button>
        }
      />

      <KpiGrid
        items={[
          { label: "Casos", value: state.collection.length },
          { label: "Em atraso (cobrança)", value: formatBRL(totalAtraso) },
          { label: "Acordos", value: state.agreements.length },
          {
            label: "Régua pausada",
            value: state.regraPausada.length,
          },
        ]}
      />

      <ProcessBoard
        storageKey="inadimplentes"
        columns={FAIXA_COLS}
        rows={state.collection}
        toCard={toCard}
        columnTotals={(_, items) =>
          items.reduce((a, c) => a + c.valorAtualizado, 0)
        }
        onOpen={(id) =>
          setSelected(state.collection.find((c) => c.id === id) ?? null)
        }
        onMove={() => {
          notify("Mova pela régua / acordo");
          return false;
        }}
        exportName="inadimplentes"
        listColumns={[
          {
            key: "cliente",
            label: "Cliente",
            filter: { type: "text" },
            getValue: (c) => c.cliente,
          },
          {
            key: "ctr",
            label: "Contrato",
            filter: { type: "text" },
            getValue: (c) => c.contratoNumero,
          },
          {
            key: "dias",
            label: "Dias",
            filter: { type: "range" },
            getValue: (c) => c.diasAtraso,
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (c) => c.valorAtualizado,
            render: (c) => formatBRL(c.valorAtualizado),
          },
          {
            key: "faixa",
            label: "Faixa",
            filter: {
              type: "status",
              options: FAIXA_COLS.map((f) => ({
                value: f.id,
                label: f.label,
              })),
            },
            getValue: (c) => c.faixa,
            render: (c) => (
              <StatusPill tone={c.faixa === "acordo" ? "ok" : "warn"}>
                {faixaAtrasoLabel(c.faixa)}
              </StatusPill>
            ),
          },
        ]}
      />

      <ModuleSection title="Acordos">
        <DataTable
          columns={[
            { key: "ctr", label: "Contrato" },
            { key: "valor", label: "Valor" },
            { key: "desc", label: "Desconto" },
            { key: "parc", label: "Parcelas" },
            { key: "status", label: "Status" },
          ]}
          rows={state.agreements.map((a) => ({
            ctr: a.contratoNumero,
            valor: formatBRL(a.valorAtualizado),
            desc: formatBRL(a.desconto),
            parc: a.qtdParcelas,
            status: (
              <StatusPill tone="ok">{statusLabel(a.status)}</StatusPill>
            ),
          }))}
        />
      </ModuleSection>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.cliente ?? ""}
      >
        {selected ? (
          <div className="space-y-3">
            <DetailRow label="Contrato" value={selected.contratoNumero} />
            <DetailRow label="Original" value={formatBRL(selected.valorOriginal)} />
            <DetailRow
              label="Atualizado"
              value={formatBRL(selected.valorAtualizado)}
            />
            <DetailRow label="Dias" value={String(selected.diasAtraso)} />
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => {
                  registrarContato(
                    selected.id,
                    "whatsapp",
                    "Mensagem de cobrança enviada"
                  );
                  notify("Contato registrado");
                }}
              >
                Registrar contato
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const descontoPct = 20;
                  const gate = canApprove({
                    rules: f1.approvalRules,
                    tipo: "Desconto acima do limite",
                    valor: descontoPct,
                    perfilNome,
                  });
                  if (!gate.ok) {
                    notify("Alçada insuficiente", gate.reason);
                    return;
                  }
                  proporAcordo(selected.id, descontoPct, 3);
                  notify("Acordo proposto · régua pausada");
                  setSelected(null);
                }}
              >
                Propor acordo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  pausarRegua(selected.id);
                  notify("Régua pausada");
                }}
              >
                Pausar régua
              </Button>
            </div>
            <ModuleSection title="Histórico de contatos">
              <ul className="space-y-1 text-sm">
                {state.contacts
                  .filter((c) => c.caseId === selected.id)
                  .map((c) => (
                    <li key={c.id}>
                      {c.quando} · {c.canal} — {c.resultado}
                    </li>
                  ))}
              </ul>
            </ModuleSection>
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
