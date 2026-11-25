"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import type { Development, Lot, LotStatus } from "@/lib/domain/carteira-types";
import {
  modeloLotesCsv,
  parseLotesCsv,
} from "@/lib/import/lotes-csv";
import { PaginatedTable } from "@/components/app/PaginatedTable";

const STATUS_TONE: Record<LotStatus, "ok" | "warn" | "danger" | "info" | "neutral"> = {
  disponivel: "ok",
  reservado: "warn",
  vendido: "info",
  quitado: "ok",
  escritura: "info",
  bloqueado: "danger",
};

export default function EmpreendimentosPage() {
  const {
    state,
    addDevelopment,
    massGenerateLots,
    changeLotStatus,
    updateLot,
    importLots,
  } = useCarteira();
  const [q, setQ] = useState("");
  const [empFilter, setEmpFilter] = useState("todos");
  const [openEmp, setOpenEmp] = useState(false);
  const [openMass, setOpenMass] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [selected, setSelected] = useState<Lot | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [empForm, setEmpForm] = useState({
    codigo: "",
    nome: "",
    tipo: "loteamento" as Development["tipo"],
    modalidade: "loteamento" as Development["modalidade"],
    status: "em_andamento" as Development["status"],
    cidade: "Campinas",
    uf: "SP",
    qtdQuadras: 4,
    qtdLotes: 0,
    diasMora: 0,
    taxaMoraMes: 0.01,
    taxaMulta: 0.02,
    diaMulta: 0,
  });
  const [openImport, setOpenImport] = useState(false);
  const [importDevId, setImportDevId] = useState(
    state.developments[0]?.id ?? ""
  );
  const [importPreview, setImportPreview] = useState<
    ReturnType<typeof parseLotesCsv>
  >([]);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [mass, setMass] = useState({
    developmentId: state.developments[0]?.id ?? "",
    quadra: "E",
    qtd: 5,
    area: 250,
    valor: 180000,
  });
  const [statusForm, setStatusForm] = useState({
    status: "bloqueado" as LotStatus,
    motivo: "",
  });

  const lotes = useMemo(() => {
    let list = state.lots;
    if (empFilter !== "todos") {
      list = list.filter((l) => l.developmentId === empFilter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((l) =>
        [l.empNome, l.quadra, l.lote, l.status, l.compradorNome]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [state.lots, q, empFilter]);

  const disponiveis = state.lots.filter((l) => l.status === "disponivel").length;
  const vendidos = state.lots.filter((l) => l.status === "vendido").length;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Empreendimentos e lotes"
        description="Fase 2 — estoque Emp+Quadra+Lote, status com travas, geração em massa e planta."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/empreendimentos/planta">Planta</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpenImport(true)}
            >
              Importar lotes
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOpenStatus(true)}>
              Alterar status
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOpenMass(true)}>
              Gerar lotes
            </Button>
            <Button size="sm" onClick={() => setOpenEmp(true)}>
              Novo empreendimento
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Empreendimentos", value: state.developments.length },
          { label: "Lotes", value: state.lots.length },
          { label: "Disponíveis", value: disponiveis },
          { label: "Vendidos", value: vendidos },
        ]}
      />

      <ModuleSection title="Empreendimentos">
        <DataTable
          columns={[
            { key: "codigo", label: "Código" },
            { key: "nome", label: "Nome" },
            { key: "modalidade", label: "Modalidade" },
            { key: "cidade", label: "Cidade" },
            { key: "status", label: "Status" },
            { key: "lotes", label: "Lotes" },
          ]}
          rows={state.developments.map((d) => ({
            codigo: d.codigo,
            nome: d.nome,
            modalidade: d.modalidade,
            cidade: `${d.cidade}/${d.uf}`,
            status: <StatusPill tone="info">{d.status.replace(/_/g, " ")}</StatusPill>,
            lotes: state.lots.filter((l) => l.developmentId === d.id).length,
          }))}
        />
      </ModuleSection>

      <FilterBar
        value={q}
        onChange={setQ}
        placeholder="Buscar quadra, lote, status, comprador…"
      >
        <select
          className={fieldControlClass + " max-w-[220px]"}
          value={empFilter}
          onChange={(e) => setEmpFilter(e.target.value)}
        >
          <option value="todos">Todos empreendimentos</option>
          {state.developments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>
      </FilterBar>

      <PaginatedTable
        columns={[
          { key: "sel", label: "" },
          { key: "emp", label: "Empreendimento" },
          { key: "ql", label: "Q/L" },
          { key: "area", label: "Área" },
          { key: "valor", label: "Valor" },
          { key: "status", label: "Status" },
          { key: "comprador", label: "Comprador" },
        ]}
        rows={lotes.map((l) => ({
          sel: (
            <input
              type="checkbox"
              checked={selectedIds.includes(l.id)}
              onChange={(e) =>
                setSelectedIds((ids) =>
                  e.target.checked
                    ? [...ids, l.id]
                    : ids.filter((id) => id !== l.id)
                )
              }
            />
          ),
          emp: (
            <button
              type="button"
              className="text-left font-medium hover:text-brand-orange"
              onClick={() => setSelected(l)}
            >
              {l.empNome}
            </button>
          ),
          ql: `${l.quadra}/${l.lote}`,
          area: `${l.area} m²`,
          valor: formatBRL(l.valor),
          status: (
            <StatusPill tone={STATUS_TONE[l.status]}>
              {l.status}
            </StatusPill>
          ),
          comprador: l.compradorNome ?? "—",
        }))}
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${selected.quadra}/${selected.lote}` : ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Status" value={selected.status} />
            <DetailRow label="Área" value={`${selected.area} m²`} />
            <DetailRow label="Valor" value={formatBRL(selected.valor)} />
            <DetailRow label="m²" value={formatBRL(selected.valorM2)} />
            <DetailRow label="Matrícula" value={selected.matricula ?? "—"} />
            <DetailRow
              label="Travas"
              value={`venda ${selected.bloqueiaVenda ? "sim" : "não"} · fin. ${selected.bloqueiaFinanceiro ? "sim" : "não"}`}
            />
            <DetailRow label="Comprador" value={selected.compradorNome ?? "—"} />
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => {
                updateLot(selected.id, {
                  valor: selected.valor + 5000,
                  valorM2:
                    Math.round(((selected.valor + 5000) / selected.area) * 100) /
                    100,
                });
                notify("Valor atualizado (+R$ 5.000)");
                setSelected(null);
              }}
            >
              + R$ 5.000 no valor
            </Button>
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={openEmp}
        onOpenChange={setOpenEmp}
        title="Novo empreendimento"
        onSubmit={() => {
          if (!empForm.codigo || !empForm.nome) {
            notify("Código e nome obrigatórios");
            return;
          }
          addDevelopment(empForm);
          notify("Empreendimento criado", empForm.nome);
          setOpenEmp(false);
        }}
      >
        <Field label="Código *">
          <Input
            value={empForm.codigo}
            onChange={(e) => setEmpForm({ ...empForm, codigo: e.target.value })}
            required
          />
        </Field>
        <Field label="Nome *">
          <Input
            value={empForm.nome}
            onChange={(e) => setEmpForm({ ...empForm, nome: e.target.value })}
            required
          />
        </Field>
        <Field label="Modalidade *">
          <select
            className={fieldControlClass}
            value={empForm.modalidade}
            onChange={(e) => {
              const modalidade = e.target
                .value as Development["modalidade"];
              setEmpForm({
                ...empForm,
                modalidade,
                tipo:
                  modalidade === "regularizacao"
                    ? "regularizacao"
                    : "loteamento",
              });
            }}
          >
            <option value="loteamento">Loteamento</option>
            <option value="regularizacao">Regularização</option>
            <option value="ambos">Loteamento e regularização</option>
          </select>
        </Field>
        <Field label="Cidade">
          <Input
            value={empForm.cidade}
            onChange={(e) => setEmpForm({ ...empForm, cidade: e.target.value })}
          />
        </Field>
      </FormDialog>

      <FormDialog
        open={openImport}
        onOpenChange={setOpenImport}
        title="Importar quadras e lotes"
        onSubmit={() => {
          const okRows = importPreview.filter((r) => !r.errors.length);
          if (!okRows.length) {
            notify("Nenhuma linha válida para gravar");
            return;
          }
          const result = importLots({
            developmentId: importDevId,
            updateExisting,
            rows: okRows,
          });
          notify(
            "Importação concluída",
            `${result.created} criados · ${result.updated} atualizados · ${result.refused} recusados`
          );
          setImportPreview([]);
          setOpenImport(false);
        }}
      >
        <Field label="Empreendimento">
          <select
            className={fieldControlClass}
            value={importDevId}
            onChange={(e) => setImportDevId(e.target.value)}
          >
            {state.developments
              .filter((d) => d.modalidade !== "regularizacao")
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
          </select>
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const blob = new Blob([modeloLotesCsv()], {
                type: "text/csv;charset=utf-8",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "modelo-lotes.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Baixar modelo (CSV/Excel)
          </Button>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <span className="rounded-sm border border-border px-3 py-1.5">
              Enviar arquivo
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                setImportPreview(parseLotesCsv(text));
              }}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={updateExisting}
            onChange={(e) => setUpdateExisting(e.target.checked)}
          />
          Atualizar lotes existentes
        </label>
        {importPreview.length ? (
          <div className="max-h-48 overflow-auto rounded-sm border border-border text-xs">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="p-2">Linha</th>
                  <th className="p-2">Q/L</th>
                  <th className="p-2">Erros</th>
                </tr>
              </thead>
              <tbody>
                {importPreview.map((r) => (
                  <tr key={r.line} className="border-b border-border/60">
                    <td className="p-2">{r.line}</td>
                    <td className="p-2">
                      {r.quadra}/{r.lote}
                    </td>
                    <td className="p-2 text-destructive">
                      {r.errors.join("; ") || "ok"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nada é gravado antes da confirmação. Conferência linha a linha.
          </p>
        )}
      </FormDialog>

      <FormDialog
        open={openMass}
        onOpenChange={setOpenMass}
        title="Gerar lotes em massa"
        onSubmit={() => {
          const n = massGenerateLots(mass);
          notify(n ? `${n} lotes gerados` : "Nada gerado");
          setOpenMass(false);
        }}
      >
        <Field label="Empreendimento">
          <select
            className={fieldControlClass}
            value={mass.developmentId}
            onChange={(e) => setMass({ ...mass, developmentId: e.target.value })}
          >
            {state.developments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quadra">
          <Input
            value={mass.quadra}
            onChange={(e) => setMass({ ...mass, quadra: e.target.value })}
          />
        </Field>
        <Field label="Quantidade">
          <Input
            type="number"
            value={mass.qtd}
            onChange={(e) =>
              setMass({ ...mass, qtd: Number(e.target.value) || 1 })
            }
          />
        </Field>
        <Field label="Área (m²)">
          <Input
            type="number"
            value={mass.area}
            onChange={(e) =>
              setMass({ ...mass, area: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Valor">
          <Input
            type="number"
            value={mass.valor}
            onChange={(e) =>
              setMass({ ...mass, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
      </FormDialog>

      <FormDialog
        open={openStatus}
        onOpenChange={setOpenStatus}
        title="Alterar status de lotes"
        onSubmit={() => {
          if (!selectedIds.length) {
            notify("Selecione lotes na grade");
            return;
          }
          changeLotStatus(selectedIds, statusForm.status, statusForm.motivo || "Alteração manual");
          notify(`${selectedIds.length} lote(s) → ${statusForm.status}`);
          setSelectedIds([]);
          setOpenStatus(false);
        }}
      >
        <p className="text-sm text-muted-foreground">
          {selectedIds.length} selecionado(s)
        </p>
        <Field label="Novo status">
          <select
            className={fieldControlClass}
            value={statusForm.status}
            onChange={(e) =>
              setStatusForm({
                ...statusForm,
                status: e.target.value as LotStatus,
              })
            }
          >
            {(
              [
                "disponivel",
                "reservado",
                "vendido",
                "bloqueado",
                "quitado",
                "escritura",
              ] as LotStatus[]
            ).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Motivo">
          <Input
            value={statusForm.motivo}
            onChange={(e) =>
              setStatusForm({ ...statusForm, motivo: e.target.value })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
