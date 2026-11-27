"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
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
import { formatBRL } from "@/lib/masks/br";
import { useServerPage } from "@/lib/ui/use-server-page";
import { useObras } from "@/lib/store/obras-store";
import type { ObraStatus } from "@/lib/domain/obras-types";
import { useCarteira } from "@/lib/store/carteira-store";

const STATUS_LABEL: Record<ObraStatus, string> = {
  em_orcamento: "Em orçamento",
  em_andamento: "Em andamento",
  paralisada: "Paralisada",
  finalizada: "Finalizada",
};

export default function ObrasPage() {
  const { state, addObra, duplicateObra, softRemoveObra } = useObras();
  const { state: carteira } = useCarteira();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [open, setOpen] = useState(false);
  const server = useServerPage({
    url: "/api/list/obras",
    page: 1,
    pageSize: 25,
    q,
  });
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo: "infraestrutura",
    status: "em_orcamento" as ObraStatus,
    clienteNome: "",
    developmentId: "",
    responsavelObra: "Eng. Paula",
    responsavelTecnico: "",
    art: "",
    ceiCno: "",
    areaTotal: 0,
    bdiPct: 0.25,
    visivelPara: "Administrador",
    cidade: "Campinas",
    uf: "SP",
    exibirLancamentos: true,
    exibirFaturamentos: true,
    exibirCompras: true,
  });

  const filtered = useMemo(() => {
    let list = state.obras;
    if (statusFilter !== "todos") {
      list = list.filter((o) => o.status === statusFilter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((o) =>
        [o.codigo, o.nome, o.clienteNome, o.tipo, o.developmentNome]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [state.obras, q, statusFilter]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Minhas Obras"
        description="Cadastro próprio de obra (independente dos lotes). Empreendimento é opcional."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/gestao">Gestão</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/rdo">RDO</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova Obra
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Obras", value: state.obras.length },
          {
            label: "Em andamento",
            value: state.obras.filter((o) => o.status === "em_andamento")
              .length,
          },
          {
            label: "Orçado",
            value: formatBRL(
              state.obras.reduce((a, o) => a + o.orcado, 0)
            ),
          },
          {
            label: "API B17",
            value: server.loading
              ? "…"
              : server.data
                ? `${server.data.total} · ${Math.round(server.data.elapsedMs ?? 0)}ms`
                : server.error ?? "—",
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Busque uma obra">
        <select
          className={fieldControlClass + " max-w-[180px]"}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Status da obra</option>
          {(Object.keys(STATUS_LABEL) as ObraStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </FilterBar>

      <PaginatedTable
        exportName="obras"
        columns={[
          { key: "img", label: "" },
          { key: "codigo", label: "Código" },
          { key: "obra", label: "Obra" },
          { key: "cliente", label: "Cliente" },
          { key: "tipo", label: "Tipo" },
          { key: "status", label: "Status da Obra" },
          { key: "visivel", label: "Visível para" },
          { key: "fisico", label: "Físico" },
          { key: "acoes", label: "" },
        ]}
        rows={filtered.map((o) => ({
          img: (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-paper-muted text-[10px] text-muted-foreground">
              img
            </span>
          ),
          codigo: o.codigo,
          obra: (
            <Link
              href={`/obras/${o.id}`}
              className="font-medium hover:text-brand-orange"
            >
              {o.nome}
            </Link>
          ),
          cliente: o.clienteNome,
          tipo: o.tipo,
          status: (
            <StatusPill tone="info">{STATUS_LABEL[o.status]}</StatusPill>
          ),
          visivel: (o.visivelPara ?? []).join(", ") || "—",
          fisico: `${o.fisicoPct}%`,
          acoes: (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/obras/${o.id}`}>Editar</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  duplicateObra(o.id);
                  notify("Obra duplicada");
                }}
              >
                Duplicar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  softRemoveObra(o.id);
                  notify("Obra removida da lista");
                }}
              >
                Remover
              </Button>
            </div>
          ),
        }))}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova Obra"
        onSubmit={() => {
          if (!form.nome.trim()) {
            notify("Nome da obra é obrigatório");
            return;
          }
          if (!form.visivelPara.trim()) {
            notify("Visível para é obrigatório");
            return;
          }
          const emp = carteira.developments.find(
            (d) => d.id === form.developmentId
          );
          addObra({
            codigo:
              form.codigo.trim() ||
              `OBR-${String(state.obras.length + 1).padStart(3, "0")}`,
            nome: form.nome.slice(0, 200),
            tipo: form.tipo,
            status: form.status,
            clienteNome: form.clienteNome || "Cliente",
            developmentId: emp?.id,
            developmentNome: emp?.nome,
            areaTotal: form.areaTotal || undefined,
            unidade: "m²",
            art: form.art || undefined,
            ceiCno: form.ceiCno.slice(0, 20) || undefined,
            responsavelObra: form.responsavelObra,
            responsavelTecnico: form.responsavelTecnico || undefined,
            visivelPara: form.visivelPara
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            bdiPct: form.bdiPct,
            cidade: form.cidade,
            uf: form.uf,
            endereco: { cidade: form.cidade, estado: form.uf },
            exibirLancamentos: form.exibirLancamentos,
            exibirFaturamentos: form.exibirFaturamentos,
            exibirCompras: form.exibirCompras,
            propostaStatus: "contato_inicial",
          });
          notify("Obra criada");
          setOpen(false);
        }}
      >
        <Field label="Código da obra">
          <Input
            placeholder="Sugestão automática se vazio"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />
        </Field>
        <Field label="Nome *">
          <Input
            value={form.nome}
            maxLength={200}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </Field>
        <Field label="Tipo">
          <Input
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          />
        </Field>
        <Field label="Status *">
          <select
            className={fieldControlClass}
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as ObraStatus })
            }
          >
            {(Object.keys(STATUS_LABEL) as ObraStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Visível para *">
          <Input
            value={form.visivelPara}
            onChange={(e) =>
              setForm({ ...form, visivelPara: e.target.value })
            }
            placeholder="Admin, Comercial…"
          />
        </Field>
        <Field label="Cliente">
          <Input
            value={form.clienteNome}
            onChange={(e) =>
              setForm({ ...form, clienteNome: e.target.value })
            }
          />
        </Field>
        <Field label="Responsável técnico">
          <Input
            value={form.responsavelTecnico}
            onChange={(e) =>
              setForm({ ...form, responsavelTecnico: e.target.value })
            }
          />
        </Field>
        <Field label="Responsável da obra">
          <Input
            value={form.responsavelObra}
            onChange={(e) =>
              setForm({ ...form, responsavelObra: e.target.value })
            }
          />
        </Field>
        <Field label="ART / CEI-CNO">
          <div className="flex gap-2">
            <Input
              placeholder="ART"
              value={form.art}
              onChange={(e) => setForm({ ...form, art: e.target.value })}
            />
            <Input
              placeholder="CEI/CNO"
              maxLength={20}
              value={form.ceiCno}
              onChange={(e) => setForm({ ...form, ceiCno: e.target.value })}
            />
          </div>
        </Field>
        <Field label="Empreendimento (opcional)">
          <select
            className={fieldControlClass}
            value={form.developmentId}
            onChange={(e) =>
              setForm({ ...form, developmentId: e.target.value })
            }
          >
            <option value="">Sem vínculo</option>
            {carteira.developments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Exibir obra para">
          <div className="flex flex-wrap gap-3 text-sm">
            {(
              [
                ["exibirLancamentos", "Lançamentos"],
                ["exibirFaturamentos", "Faturamentos"],
                ["exibirCompras", "Compras"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.checked })
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </Field>
      </FormDialog>
    </div>
  );
}
