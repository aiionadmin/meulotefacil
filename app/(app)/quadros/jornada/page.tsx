"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleHeader } from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { BoardViews } from "@/components/kanban/BoardViews";
import { JORNADA_COLS } from "@/lib/domain/fluxo-seed";
import { useFluxo } from "@/lib/store/fluxo-store";
import type { JornadaColuna, Lead } from "@/lib/domain/fluxo-types";
import { statusLabel } from "@/lib/status/labels";
import { useFase1 } from "@/lib/store/fase1-store";

export default function JornadaPage() {
  const { state, moveLead, marcarFinal } = useFluxo();
  const { currentProfileName } = useFase1();
  const isAdmin = (currentProfileName ?? "")
    .toLowerCase()
    .includes("admin");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [finalOpen, setFinalOpen] = useState(false);
  const [finalForm, setFinalForm] = useState({
    etapa: "perdido" as "perdido" | "cancelado" | "distrato",
    motivo: "",
  });
  const [forceOpen, setForceOpen] = useState(false);
  const [forceMotivo, setForceMotivo] = useState("");
  const [forceTarget, setForceTarget] = useState<JornadaColuna>("em_atendimento");

  const columns = JORNADA_COLS.map((c) => ({
    id: c.id,
    label: c.label,
    droppable: c.manual,
  }));

  const cards = useMemo(
    () =>
      state.leads
        .filter(
          (l) =>
            l.etapa !== "perdido" &&
            l.etapa !== "cancelado" &&
            l.etapa !== "distrato" &&
            l.etapa !== "retomado"
        )
        .map((l) => ({
          id: l.id,
          columnId: l.etapa,
          title: l.nome,
          subtitle: l.empInteresse,
          badge: l.emAtraso
            ? "Em atraso"
            : l.classificacao
              ? l.classificacao
              : l.origem,
          meta: l.responsavel,
        })),
    [state.leads]
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Jornada do cliente"
        description="Só avança. Cobrança fica no quadro próprio (selo Em atraso). Finais: Perdido, Cancelado, Distrato."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/leads">Leads</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/vendas">Propostas</Link>
            </Button>
          </>
        }
      />

      <BoardViews
        storageKey="jornada"
        columns={columns}
        cards={cards}
        onMove={(cardId, to) => {
          const ok = moveLead(cardId, to as JornadaColuna);
          if (!ok) {
            notify(
              "Movimento bloqueado",
              "Jornada só avança. Admin pode corrigir com motivo."
            );
          } else {
            notify("Card movido");
          }
          return ok;
        }}
        onOpen={(id) => {
          const lead = state.leads.find((l) => l.id === id) ?? null;
          setSelected(lead);
        }}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.nome ?? ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Telefone" value={selected.telefone} />
            <DetailRow label="Origem" value={statusLabel(selected.origem)} />
            <DetailRow
              label="Empreendimento"
              value={selected.empInteresse ?? "—"}
            />
            <DetailRow label="Etapa" value={statusLabel(selected.etapa)} />
            <DetailRow label="Score" value={String(selected.score ?? "—")} />
            <DetailRow
              label="Classificação"
              value={statusLabel(selected.classificacao)}
            />
            <DetailRow label="Responsável" value={selected.responsavel} />
            {selected.emAtraso ? (
              <DetailRow label="Selo" value="Em atraso" />
            ) : null}
            <div className="flex flex-wrap gap-2 pt-3">
              {selected.etapa === "novo_contato" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    moveLead(selected.id, "em_atendimento");
                    notify("Em atendimento");
                    setSelected(null);
                  }}
                >
                  Avançar
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFinalForm({ etapa: "perdido", motivo: "" });
                  setFinalOpen(true);
                }}
              >
                Finalizar…
              </Button>
              {isAdmin ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setForceTarget("em_atendimento");
                    setForceMotivo("");
                    setForceOpen(true);
                  }}
                >
                  Corrigir (admin)
                </Button>
              ) : null}
            </div>
            {state.cardMoves.filter((m) => m.cardId === selected.id).length >
            0 ? (
              <div className="mt-4 space-y-1 border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Histórico (C08)
                </p>
                {state.cardMoves
                  .filter((m) => m.cardId === selected.id)
                  .slice(0, 8)
                  .map((m) => (
                    <p key={m.id} className="text-xs text-muted-foreground">
                      {m.quando}: {m.de} → {m.para}
                      {m.tempoNaEtapaSegundos != null
                        ? ` · ${Math.round(m.tempoNaEtapaSegundos / 60)} min na etapa`
                        : ""}
                      {m.motivo ? ` · ${m.motivo}` : ""}
                    </p>
                  ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={finalOpen}
        onOpenChange={setFinalOpen}
        title="Estado final"
        onSubmit={() => {
          if (!selected || !finalForm.motivo.trim()) {
            notify("Motivo obrigatório");
            return;
          }
          const ok = marcarFinal(
            selected.id,
            finalForm.etapa,
            finalForm.motivo
          );
          if (ok) {
            notify(`Marcado como ${finalForm.etapa}`);
            setFinalOpen(false);
            setSelected(null);
          }
        }}
      >
        <Field label="Situação">
          <select
            className={fieldControlClass}
            value={finalForm.etapa}
            onChange={(e) =>
              setFinalForm({
                ...finalForm,
                etapa: e.target.value as typeof finalForm.etapa,
              })
            }
          >
            <option value="perdido">Perdido</option>
            <option value="cancelado">Cancelado</option>
            <option value="distrato">Distrato</option>
          </select>
        </Field>
        <Field label="Motivo *">
          <Input
            value={finalForm.motivo}
            onChange={(e) =>
              setFinalForm({ ...finalForm, motivo: e.target.value })
            }
          />
        </Field>
      </FormDialog>

      <FormDialog
        open={forceOpen}
        onOpenChange={setForceOpen}
        title="Corrigir avanço (admin)"
        onSubmit={() => {
          if (!selected || !forceMotivo.trim()) {
            notify("Motivo obrigatório");
            return;
          }
          const ok = moveLead(selected.id, forceTarget, {
            force: true,
            motivo: forceMotivo,
            usuario: "Admin",
          });
          if (ok) {
            notify("Correção registrada");
            setForceOpen(false);
            setSelected(null);
          }
        }}
      >
        <Field label="Nova etapa">
          <select
            className={fieldControlClass}
            value={forceTarget}
            onChange={(e) =>
              setForceTarget(e.target.value as JornadaColuna)
            }
          >
            {JORNADA_COLS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Motivo *">
          <Input
            value={forceMotivo}
            onChange={(e) => setForceMotivo(e.target.value)}
          />
        </Field>
      </FormDialog>
    </div>
  );
}
