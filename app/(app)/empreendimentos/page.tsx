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
import { statusLabel } from "@/lib/status/labels";

const STATUS_TONE: Record<LotStatus, "ok" | "warn" | "danger" | "info" | "neutral"> = {
  disponivel: "ok",
  reservado: "warn",
  vendido: "info",
  quitado: "ok",
  escritura: "info",
  advogado: "danger",
  caucionado: "danger",
  invadido: "danger",
  juridico: "danger",
};

const LOT_STATUSES: LotStatus[] = [
  "advogado",
  "caucionado",
  "disponivel",
  "escritura",
  "invadido",
  "juridico",
  "quitado",
  "reservado",
  "vendido",
];

export default function EmpreendimentosPage() {
  const {
    state,
    addDevelopment,
    massGenerateLots,
    changeLotStatus,
    updateLot,
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
    cep: "",
    areaTotal: "",
    codigoMunicipio: "",
    padrao: "",
    confrontacao: "",
    matriculaNumero: "",
    matriculaData: "",
    adminRazao: "",
    adminCnpj: "",
    adminEndereco: "",
    contaCorrentePadrao: "",
    numeracaoPropria: false,
    recadoPadrao: "",
    qtdQuadras: 4,
    qtdLotes: 0,
    diasMora: 0,
    taxaMoraMes: 0.01,
    taxaMulta: 0.02,
    diaMulta: 0,
  });
  const [mass, setMass] = useState({
    developmentId: state.developments[0]?.id ?? "",
    quadra: "E",
    qtd: 5,
    area: 250,
    valor: 180000,
  });
  const [statusForm, setStatusForm] = useState({
    status: "juridico" as LotStatus,
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
        description="estoque Emp+Quadra+Lote, status com travas, geração em massa e planta."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/empreendimentos/planta">Planta</Link>
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
            { key: "tipo", label: "Tipo" },
            { key: "modalidade", label: "Modalidade" },
            { key: "cidade", label: "Cidade" },
            { key: "status", label: "Status" },
            { key: "lotes", label: "Lotes" },
          ]}
          rows={state.developments.map((d) => ({
            codigo: d.codigo,
            nome: d.nome,
            tipo: d.tipo,
            modalidade: (d.modalidade ?? "loteamento").replace(/_/g, " "),
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

      <DataTable
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
              {statusLabel(l.status)}
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
            onChange={(e) =>
              setEmpForm({
                ...empForm,
                modalidade: e.target.value as Development["modalidade"],
                tipo:
                  e.target.value === "regularizacao"
                    ? "regularizacao"
                    : "loteamento",
              })
            }
            required
          >
            <option value="loteamento">Loteamento</option>
            <option value="regularizacao">Regularização</option>
            <option value="loteamento_e_regularizacao">
              Loteamento e regularização
            </option>
          </select>
        </Field>
        <Field label="Cidade">
          <Input
            value={empForm.cidade}
            onChange={(e) => setEmpForm({ ...empForm, cidade: e.target.value })}
          />
        </Field>
        <Field label="UF">
          <Input
            value={empForm.uf}
            onChange={(e) => setEmpForm({ ...empForm, uf: e.target.value })}
            maxLength={2}
          />
        </Field>
        <Field label="CEP">
          <Input
            value={empForm.cep}
            onChange={(e) => setEmpForm({ ...empForm, cep: e.target.value })}
          />
        </Field>
        <Field label="Área total">
          <Input
            value={empForm.areaTotal}
            onChange={(e) =>
              setEmpForm({ ...empForm, areaTotal: e.target.value })
            }
          />
        </Field>
        <Field label="Código município">
          <Input
            value={empForm.codigoMunicipio}
            onChange={(e) =>
              setEmpForm({ ...empForm, codigoMunicipio: e.target.value })
            }
          />
        </Field>
        <Field label="Padrão">
          <Input
            value={empForm.padrao}
            onChange={(e) => setEmpForm({ ...empForm, padrao: e.target.value })}
          />
        </Field>
        <Field label="Confrontação">
          <Input
            value={empForm.confrontacao}
            onChange={(e) =>
              setEmpForm({ ...empForm, confrontacao: e.target.value })
            }
          />
        </Field>
        <Field label="Matrícula (número)">
          <Input
            value={empForm.matriculaNumero}
            onChange={(e) =>
              setEmpForm({ ...empForm, matriculaNumero: e.target.value })
            }
          />
        </Field>
        <Field label="Matrícula (data)">
          <Input
            type="date"
            value={empForm.matriculaData}
            onChange={(e) =>
              setEmpForm({ ...empForm, matriculaData: e.target.value })
            }
          />
        </Field>
        <Field label="Administradora (razão)">
          <Input
            value={empForm.adminRazao}
            onChange={(e) =>
              setEmpForm({ ...empForm, adminRazao: e.target.value })
            }
          />
        </Field>
        <Field label="Administradora (CNPJ)">
          <Input
            value={empForm.adminCnpj}
            onChange={(e) =>
              setEmpForm({ ...empForm, adminCnpj: e.target.value })
            }
          />
        </Field>
        <Field label="Administradora (endereço)">
          <Input
            value={empForm.adminEndereco}
            onChange={(e) =>
              setEmpForm({ ...empForm, adminEndereco: e.target.value })
            }
          />
        </Field>
        <Field label="Conta corrente padrão">
          <Input
            value={empForm.contaCorrentePadrao}
            onChange={(e) =>
              setEmpForm({ ...empForm, contaCorrentePadrao: e.target.value })
            }
          />
        </Field>
        <Field label="Recado padrão">
          <Input
            value={empForm.recadoPadrao}
            onChange={(e) =>
              setEmpForm({ ...empForm, recadoPadrao: e.target.value })
            }
          />
        </Field>
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
              LOT_STATUSES
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
