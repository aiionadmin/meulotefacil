"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  StatusPill,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatDateBR } from "@/lib/masks/br";
import { useObras } from "@/lib/store/obras-store";
function weekday(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
  });
}

function RdoInner() {
  const search = useSearchParams();
  const obraQ = search.get("obra") ?? "";
  const { state, addRdo, updateRdoStatus, nodesDaObra } = useObras();
  const [q, setQ] = useState("");
  const [obraFilter, setObraFilter] = useState(obraQ || "todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    obraId: obraQ || state.obras[0]?.id || "",
    data: new Date().toISOString().slice(0, 10),
    responsavel: "Eng. Paula",
    nodeId: "",
    fisicoAcumulado: 50,
  });

  const filtered = useMemo(() => {
    let list = state.rdos;
    if (obraFilter !== "todos") {
      list = list.filter((r) => r.obraId === obraFilter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((r) => {
        const obra = state.obras.find((o) => o.id === r.obraId);
        return [String(r.numero), r.data, r.responsavel, obra?.nome, r.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      });
    }
    return list;
  }, [state.rdos, state.obras, q, obraFilter]);

  const itensObra = nodesDaObra(form.obraId).filter((n) => n.kind === "item");

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="RDO — Relatório diário de obras"
        description="Um RDO por obra e por dia. Aprovar atualiza a evolução física dos itens."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/obras">Obras</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Novo RDO
            </Button>
          </>
        }
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar número, obra, responsável…">
        <select
          className={fieldControlClass + " max-w-[220px]"}
          value={obraFilter}
          onChange={(e) => setObraFilter(e.target.value)}
        >
          <option value="todos">Todas obras</option>
          {state.obras.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
      </FilterBar>

      <PaginatedTable
        columns={[
          { key: "n", label: "Nº" },
          { key: "data", label: "Data" },
          { key: "dia", label: "Dia" },
          { key: "obra", label: "Obra" },
          { key: "resp", label: "Responsável" },
          { key: "ef", label: "Efetivo" },
          { key: "status", label: "Status" },
          { key: "acoes", label: "" },
        ]}
        rows={filtered.map((r) => {
          const obra = state.obras.find((o) => o.id === r.obraId);
          return {
            n: r.numero,
            data: formatDateBR(r.data),
            dia: weekday(r.data),
            obra: obra?.nome ?? "—",
            resp: r.responsavel,
            ef: r.efetivoTotal,
            status: (
              <StatusPill
                tone={
                  r.status === "aprovado"
                    ? "ok"
                    : r.status === "devolvido"
                      ? "danger"
                      : "warn"
                }
              >
                {r.status}
              </StatusPill>
            ),
            acoes: (
              <div className="flex flex-wrap gap-1">
                {r.status === "rascunho" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      updateRdoStatus(r.id, "enviado");
                      notify("RDO enviado");
                    }}
                  >
                    Enviar
                  </Button>
                ) : null}
                {r.status === "enviado" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateRdoStatus(r.id, "aprovado");
                        notify("RDO aprovado · físico atualizado");
                      }}
                    >
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const motivo = window.prompt("Motivo da devolução *");
                        if (!motivo?.trim()) {
                          notify("Motivo obrigatório");
                          return;
                        }
                        updateRdoStatus(r.id, "devolvido", motivo.trim());
                        notify("RDO devolvido");
                      }}
                    >
                      Devolver
                    </Button>
                  </>
                ) : null}
              </div>
            ),
          };
        })}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo RDO"
        onSubmit={() => {
          if (!form.obraId || !form.data || !form.responsavel) {
            notify("Obra, data e responsável obrigatórios");
            return;
          }
          const created = addRdo({
            obraId: form.obraId,
            data: form.data,
            responsavel: form.responsavel,
            atividades: form.nodeId
              ? [
                  {
                    nodeId: form.nodeId,
                    descricao: "Execução do dia",
                    situacao: "em_andamento",
                    quantidade: 1,
                    fisicoAcumulado: form.fisicoAcumulado,
                  },
                ]
              : [],
          });
          if (!created) {
            notify("Já existe RDO nesta data para a obra");
            return;
          }
          notify(`RDO nº ${created.numero} criado`);
          setOpen(false);
        }}
      >
        <Field label="Obra *">
          <select
            className={fieldControlClass}
            value={form.obraId}
            onChange={(e) => setForm({ ...form, obraId: e.target.value })}
          >
            {state.obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data *">
          <Input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
          />
        </Field>
        <Field label="Responsável *">
          <Input
            value={form.responsavel}
            onChange={(e) =>
              setForm({ ...form, responsavel: e.target.value })
            }
          />
        </Field>
        <Field label="Atividade (item do orçamento)">
          <select
            className={fieldControlClass}
            value={form.nodeId}
            onChange={(e) => setForm({ ...form, nodeId: e.target.value })}
          >
            <option value="">Opcional</option>
            {itensObra.map((n) => (
              <option key={n.id} value={n.id}>
                {n.codigo} · {n.descricao}
              </option>
            ))}
          </select>
        </Field>
        <Field label="% físico acumulado">
          <Input
            type="number"
            value={form.fisicoAcumulado}
            onChange={(e) =>
              setForm({
                ...form,
                fisicoAcumulado: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}

export default function RdoPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
      <RdoInner />
    </Suspense>
  );
}
