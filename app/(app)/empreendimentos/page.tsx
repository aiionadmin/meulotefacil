"use client";

import { useMemo, useState } from "react";
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
import { brl } from "@/lib/data/sistema";
import { useDemoStore, type Lote } from "@/lib/store/demo-store";

export default function EmpreendimentosPage() {
  const { state, addEmpreendimento, updateLote, massGenerateLotes } =
    useDemoStore();
  const [q, setQ] = useState("");
  const [openEmp, setOpenEmp] = useState(false);
  const [openMass, setOpenMass] = useState(false);
  const [selected, setSelected] = useState<Lote | null>(null);
  const [empForm, setEmpForm] = useState({
    codigo: "",
    nome: "",
    tipo: "Loteamento",
    status: "Em venda",
    cidade: "Campinas",
    uf: "SP",
    quadras: 4,
    lotes: 80,
    vendidos: 0,
    area: "5,0 ha",
  });
  const [mass, setMass] = useState({
    emp: "Horizonte",
    quadra: "E",
    qtd: 5,
    area: 250,
    valor: 180000,
  });

  const lotes = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.lotes;
    return state.lotes.filter((l) =>
      [l.emp, l.quadra, l.lote, l.status].join(" ").toLowerCase().includes(term)
    );
  }, [state.lotes, q]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Empreendimentos e lotes"
        description="Cadastro de empreendimentos, lotes Emp+Quadra+Lote, status com travas e geração em massa."
        actions={
          <>
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
          { label: "Empreendimentos", value: state.empreendimentos.length },
          { label: "Lotes (amostra)", value: state.lotes.length },
          {
            label: "Disponíveis",
            value: state.lotes.filter((l) => l.status === "Disponível").length,
          },
          {
            label: "Bloqueados venda",
            value: state.lotes.filter((l) => l.bloqueiaVenda).length,
          },
        ]}
      />

      <ModuleSection title="Empreendimentos">
        <DataTable
          columns={[
            { key: "codigo", label: "Código" },
            { key: "nome", label: "Nome" },
            { key: "tipo", label: "Tipo" },
            { key: "cidade", label: "Cidade" },
            { key: "lotes", label: "Lotes" },
            { key: "vendidos", label: "Vendidos" },
            { key: "status", label: "Status" },
          ]}
          rows={state.empreendimentos.map((e) => ({
            codigo: e.codigo,
            nome: <span className="font-medium">{e.nome}</span>,
            tipo: e.tipo,
            cidade: `${e.cidade}/${e.uf}`,
            lotes: e.lotes,
            vendidos: e.vendidos,
            status: <StatusPill tone="info">{e.status}</StatusPill>,
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Lotes">
        <FilterBar value={q} onChange={setQ} placeholder="Filtrar lotes…" />
        <DataTable
          onRowClick={(i) => setSelected(lotes[i])}
          columns={[
            { key: "emp", label: "Emp" },
            { key: "ql", label: "Quadra/Lote" },
            { key: "area", label: "Área" },
            { key: "valor", label: "Valor" },
            { key: "status", label: "Status" },
            { key: "travas", label: "Travas" },
          ]}
          rows={lotes.map((l) => ({
            emp: l.emp,
            ql: (
              <span className="font-medium">
                {l.quadra}/{l.lote}
              </span>
            ),
            area: `${l.area} m²`,
            valor: l.valor ? brl(l.valor) : "sem preço",
            status: (
              <StatusPill
                tone={
                  l.status === "Disponível"
                    ? "ok"
                    : l.status === "Jurídico"
                      ? "danger"
                      : "warn"
                }
              >
                {l.status}
              </StatusPill>
            ),
            travas: [
              l.bloqueiaVenda ? "venda" : null,
              l.bloqueiaFinanceiro ? "fin." : null,
            ]
              .filter(Boolean)
              .join(", ") || "nenhuma",
          }))}
        />
      </ModuleSection>

      <FormDialog
        open={openEmp}
        onOpenChange={setOpenEmp}
        title="Novo empreendimento"
        submitLabel="Cadastrar"
        onSubmit={() => {
          if (!empForm.nome || !empForm.codigo) return;
          addEmpreendimento(empForm);
          notify("Empreendimento criado", empForm.nome);
          setOpenEmp(false);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Código">
            <Input
              value={empForm.codigo}
              onChange={(e) =>
                setEmpForm({ ...empForm, codigo: e.target.value.toUpperCase() })
              }
              required
            />
          </Field>
          <Field label="Tipo">
            <select
              className={fieldControlClass}
              value={empForm.tipo}
              onChange={(e) => setEmpForm({ ...empForm, tipo: e.target.value })}
            >
              <option>Loteamento</option>
              <option>Regularização</option>
              <option>Condomínio</option>
            </select>
          </Field>
        </div>
        <Field label="Nome">
          <Input
            value={empForm.nome}
            onChange={(e) => setEmpForm({ ...empForm, nome: e.target.value })}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cidade">
            <Input
              value={empForm.cidade}
              onChange={(e) => setEmpForm({ ...empForm, cidade: e.target.value })}
            />
          </Field>
          <Field label="Área">
            <Input
              value={empForm.area}
              onChange={(e) => setEmpForm({ ...empForm, area: e.target.value })}
            />
          </Field>
        </div>
      </FormDialog>

      <FormDialog
        open={openMass}
        onOpenChange={setOpenMass}
        title="Geração em massa de lotes"
        submitLabel="Gerar"
        onSubmit={() => {
          const n = massGenerateLotes(
            mass.emp,
            mass.quadra,
            Number(mass.qtd) || 1,
            Number(mass.area) || 200,
            Number(mass.valor) || 0
          );
          notify("Lotes gerados", `${n} lotes na quadra ${mass.quadra}`);
          setOpenMass(false);
        }}
      >
        <Field label="Empreendimento">
          <Input
            value={mass.emp}
            onChange={(e) => setMass({ ...mass, emp: e.target.value })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quadra">
            <Input
              value={mass.quadra}
              onChange={(e) =>
                setMass({ ...mass, quadra: e.target.value.toUpperCase() })
              }
            />
          </Field>
          <Field label="Quantidade">
            <Input
              type="number"
              min={1}
              max={40}
              value={mass.qtd}
              onChange={(e) =>
                setMass({ ...mass, qtd: Number(e.target.value) })
              }
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Área (m²)">
            <Input
              type="number"
              value={mass.area}
              onChange={(e) =>
                setMass({ ...mass, area: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Valor">
            <Input
              type="number"
              value={mass.valor}
              onChange={(e) =>
                setMass({ ...mass, valor: Number(e.target.value) })
              }
            />
          </Field>
        </div>
      </FormDialog>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={
          selected
            ? `${selected.emp} ${selected.quadra}/${selected.lote}`
            : "Lote"
        }
        footer={
          selected ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const next = !selected.bloqueiaVenda;
                  updateLote(selected.id, { bloqueiaVenda: next });
                  setSelected({ ...selected, bloqueiaVenda: next });
                  notify(next ? "Venda bloqueada" : "Venda liberada");
                }}
              >
                {selected.bloqueiaVenda ? "Liberar venda" : "Bloquear venda"}
              </Button>
              {selected.status === "Disponível" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    updateLote(selected.id, {
                      status: "Reservado",
                      bloqueiaVenda: true,
                    });
                    setSelected({
                      ...selected,
                      status: "Reservado",
                      bloqueiaVenda: true,
                    });
                    notify("Lote reservado");
                  }}
                >
                  Reservar
                </Button>
              ) : null}
            </>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="Área" value={`${selected.area} m²`} />
            <DetailRow
              label="Valor"
              value={selected.valor ? brl(selected.valor) : "sem preço"}
            />
            <DetailRow label="Status" value={selected.status} />
            <DetailRow
              label="Trava venda"
              value={selected.bloqueiaVenda ? "Sim" : "Não"}
            />
            <DetailRow
              label="Trava fin."
              value={selected.bloqueiaFinanceiro ? "Sim" : "Não"}
            />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
