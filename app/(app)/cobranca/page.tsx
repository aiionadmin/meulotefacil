"use client";

import { useMemo, useState } from "react";
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
  FilterBar,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useFluxo } from "@/lib/store/fluxo-store";
import type { CollectionCase } from "@/lib/domain/fluxo-types";
import { faixaAtrasoLabel } from "@/lib/cobranca/faixas";
import { emAtrasoCobranca } from "@/lib/indicators/receivables";
import { statusLabel } from "@/lib/status/labels";

export default function CobrancaPage() {
  const { state, registrarContato, proporAcordo, pausarRegua } = useFluxo();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<CollectionCase | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.collection;
    return state.collection.filter((c) =>
      [c.cliente, c.contratoNumero, c.empNome, c.faixa]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.collection, q]);

  const totalAtraso = emAtrasoCobranca(state.collection);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Cobrança e inadimplentes"
        description="régua, contatos e acordos."
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

      <FilterBar value={q} onChange={setQ} placeholder="Buscar cliente, contrato…" />

      <DataTable
        columns={[
          { key: "cliente", label: "Cliente" },
          { key: "ctr", label: "Contrato" },
          { key: "dias", label: "Dias" },
          { key: "original", label: "Valor original" },
          { key: "valor", label: "Valor atualizado" },
          { key: "faixa", label: "Faixa" },
          { key: "contato", label: "Último contato" },
        ]}
        rows={filtered.map((c) => ({
          cliente: (
            <button
              type="button"
              className="font-medium hover:text-brand-orange"
              onClick={() => setSelected(c)}
            >
              {c.cliente}
            </button>
          ),
          ctr: c.contratoNumero,
          dias: c.diasAtraso,
          original: formatBRL(c.valorOriginal),
          valor: formatBRL(c.valorAtualizado),
          faixa: (
            <StatusPill tone={c.faixa === "acordo" ? "ok" : "warn"}>
              {faixaAtrasoLabel(c.faixa)}
            </StatusPill>
          ),
          contato: c.ultimoContato ?? "—",
        }))}
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
                  proporAcordo(selected.id, 20, 3);
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
