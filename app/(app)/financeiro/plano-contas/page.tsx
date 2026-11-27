"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  Field,
  FormSheet,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import type {
  ClassificacaoObra,
  NaturezaReceita,
  PlanoConta,
  ResultadoGrupo,
} from "@/lib/domain/financeiro-types";

const GRUPOS: ResultadoGrupo[] = [
  "Receita Operacional Bruta",
  "Receita Operacional Bruta (dedução)",
  "Despesas Variáveis",
  "Despesas Operacionais",
  "Resultado Financeiro",
  "Somente Fluxo de Caixa",
];

const CLASSIFS: ClassificacaoObra[] = [
  "Mão de Obra (Salários)",
  "Mão de Obra (Encargos)",
  "Mão de Obra (Terceirizada)",
  "Materiais",
  "Equipamentos",
  "Compra de Terreno",
  "Outros",
  "Oculta na Gestão",
  "a classificar",
];

type SheetKind = "plano" | "categoria" | "natureza" | null;

export default function PlanoContasPage() {
  const {
    state,
    addPlano,
    updatePlano,
    removePlano,
    addCategoria,
    updateCategoria,
    removeCategoria,
    addNatureza,
    updateNatureza,
    removeNatureza,
  } = useFinanceiro();

  const [kind, setKind] = useState<SheetKind>(null);
  const [formDirty, setFormDirty] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [planoForm, setPlanoForm] = useState({
    nome: "",
    fluxo: "despesas" as "receitas" | "despesas",
    grupoResultados: "Despesas Variáveis" as ResultadoGrupo,
    ativo: true,
  });
  const [catForm, setCatForm] = useState({
    nome: "",
    planoId: "",
    classificacaoObra: "Outros" as ClassificacaoObra,
    ativo: true,
  });
  const [natForm, setNatForm] = useState({
    nome: "",
    linhaResultados: "",
    ativo: true,
  });

  function patchPlano(patch: Partial<typeof planoForm>) {
    setFormDirty(true);
    setPlanoForm((prev) => ({ ...prev, ...patch }));
  }
  function patchCat(patch: Partial<typeof catForm>) {
    setFormDirty(true);
    setCatForm((prev) => ({ ...prev, ...patch }));
  }
  function patchNat(patch: Partial<typeof natForm>) {
    setFormDirty(true);
    setNatForm((prev) => ({ ...prev, ...patch }));
  }

  function openPlano(p?: PlanoConta) {
    setFormDirty(false);
    setKind("plano");
    setEditId(p?.id ?? null);
    setPlanoForm(
      p
        ? {
            nome: p.nome,
            fluxo: p.fluxo,
            grupoResultados: p.grupoResultados,
            ativo: p.ativo,
          }
        : {
            nome: "",
            fluxo: "despesas",
            grupoResultados: "Despesas Variáveis",
            ativo: true,
          }
    );
  }

  function openCat(id?: string) {
    setFormDirty(false);
    const c = id ? state.categorias.find((x) => x.id === id) : undefined;
    setKind("categoria");
    setEditId(c?.id ?? null);
    setCatForm(
      c
        ? {
            nome: c.nome,
            planoId: c.planoId,
            classificacaoObra: c.classificacaoObra,
            ativo: c.ativo,
          }
        : {
            nome: "",
            planoId: state.planos.find((p) => p.ativo)?.id ?? "",
            classificacaoObra: "Outros",
            ativo: true,
          }
    );
  }

  function openNat(n?: NaturezaReceita) {
    setFormDirty(false);
    setKind("natureza");
    setEditId(n?.id ?? null);
    setNatForm(
      n
        ? {
            nome: n.nome,
            linhaResultados: n.linhaResultados ?? "",
            ativo: n.ativo,
          }
        : { nome: "", linhaResultados: "", ativo: true }
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Plano de contas e categorias"
        description="Incluir, editar e inativar. Exclusão bloqueada se houver lançamento."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/pagamentos">Pagamentos</Link>
            </Button>
            <Button size="sm" onClick={() => openPlano()}>
              Novo plano
            </Button>
          </>
        }
      />
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => openPlano()}>
          Novo plano
        </Button>
      </div>
      <ModuleSection title="Planos">
        <PaginatedTable
          columns={[
            { key: "nome", label: "Nome" },
            { key: "fluxo", label: "Fluxo" },
            { key: "grupo", label: "Grupo resultados" },
            { key: "ativo", label: "Ativo" },
            { key: "acao", label: "" },
          ]}
          rows={state.planos.map((p) => ({
            nome: p.nome,
            fluxo: p.fluxo,
            grupo: p.grupoResultados,
            ativo: (
              <StatusPill tone={p.ativo ? "ok" : "danger"}>
                {p.ativo ? "sim" : "não"}
              </StatusPill>
            ),
            acao: (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openPlano(p)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const r = removePlano(p.id);
                    if (!r.ok) notify("Não foi possível inativar", r.reason);
                    else notify("Plano inativado");
                  }}
                >
                  Inativar
                </Button>
              </div>
            ),
          }))}
        />
      </ModuleSection>
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => openCat()}>
          Nova categoria
        </Button>
      </div>
      <ModuleSection title="Categorias">
        <PaginatedTable
          columns={[
            { key: "nome", label: "Categoria" },
            { key: "plano", label: "Plano" },
            { key: "classif", label: "Gestão de obra" },
            { key: "ativo", label: "Ativo" },
            { key: "acao", label: "" },
          ]}
          rows={state.categorias.map((c) => ({
            nome: c.nome,
            plano:
              state.planos.find((p) => p.id === c.planoId)?.nome ?? "—",
            classif: c.classificacaoObra,
            ativo: (
              <StatusPill tone={c.ativo ? "ok" : "warn"}>
                {c.ativo ? "sim" : "não"}
              </StatusPill>
            ),
            acao: (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openCat(c.id)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const r = removeCategoria(c.id);
                    if (!r.ok) notify("Não foi possível inativar", r.reason);
                    else notify("Categoria inativada");
                  }}
                >
                  Inativar
                </Button>
              </div>
            ),
          }))}
        />
      </ModuleSection>
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => openNat()}>
          Nova natureza
        </Button>
      </div>
      <ModuleSection title="Naturezas de receita">
        <PaginatedTable
          columns={[
            { key: "nome", label: "Natureza" },
            { key: "linha", label: "Linha Resultados" },
            { key: "ativo", label: "Ativo" },
            { key: "acao", label: "" },
          ]}
          rows={state.naturezas.map((n) => ({
            nome: n.nome,
            linha: n.linhaResultados ?? "—",
            ativo: (
              <StatusPill tone={n.ativo ? "ok" : "warn"}>
                {n.ativo ? "sim" : "não"}
              </StatusPill>
            ),
            acao: (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openNat(n)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const r = removeNatureza(n.id);
                    if (!r.ok) notify("Não foi possível inativar", r.reason);
                    else notify("Natureza inativada");
                  }}
                >
                  Inativar
                </Button>
              </div>
            ),
          }))}
        />
      </ModuleSection>

      <FormSheet
        open={kind === "plano"}
        onOpenChange={(o) => !o && setKind(null)}
        title={editId ? "Editar plano" : "Novo plano"}
        submitLabel="Salvar"
        dirty={formDirty}
        onSubmit={() => {
          if (!planoForm.nome.trim()) {
            notify("Nome obrigatório");
            return;
          }
          if (editId) updatePlano(editId, planoForm);
          else addPlano(planoForm);
          notify(editId ? "Plano atualizado" : "Plano criado");
          setFormDirty(false);
          setKind(null);
        }}
      >
        <Field label="Nome *">
          <Input
            value={planoForm.nome}
            onChange={(e) =>
              patchPlano({ nome: e.target.value })
            }
          />
        </Field>
        <Field label="Fluxo">
          <select
            className={fieldControlClass}
            value={planoForm.fluxo}
            onChange={(e) =>
              patchPlano({ fluxo: e.target.value as "receitas" | "despesas",
              })
            }
          >
            <option value="despesas">Despesas</option>
            <option value="receitas">Receitas</option>
          </select>
        </Field>
        <Field label="Grupo em Resultados">
          <select
            className={fieldControlClass}
            value={planoForm.grupoResultados}
            onChange={(e) =>
              patchPlano({ grupoResultados: e.target.value as ResultadoGrupo,
              })
            }
          >
            {GRUPOS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
      </FormSheet>

      <FormSheet
        open={kind === "categoria"}
        onOpenChange={(o) => !o && setKind(null)}
        title={editId ? "Editar categoria" : "Nova categoria"}
        submitLabel="Salvar"
        dirty={formDirty}
        onSubmit={() => {
          if (!catForm.nome.trim() || !catForm.planoId) {
            notify("Nome e plano obrigatórios");
            return;
          }
          if (editId) updateCategoria(editId, catForm);
          else addCategoria(catForm);
          notify(editId ? "Categoria atualizada" : "Categoria criada");
          setFormDirty(false);
          setKind(null);
        }}
      >
        <Field label="Nome *">
          <Input
            value={catForm.nome}
            onChange={(e) =>
              patchCat({ nome: e.target.value })
            }
          />
        </Field>
        <Field label="Plano *">
          <select
            className={fieldControlClass}
            value={catForm.planoId}
            onChange={(e) =>
              patchCat({ planoId: e.target.value })
            }
          >
            {state.planos
              .filter((p) => p.ativo)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Classificação em Gestão">
          <select
            className={fieldControlClass}
            value={catForm.classificacaoObra}
            onChange={(e) =>
              patchCat({ classificacaoObra: e.target.value as ClassificacaoObra,
              })
            }
          >
            {CLASSIFS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </FormSheet>

      <FormSheet
        open={kind === "natureza"}
        onOpenChange={(o) => !o && setKind(null)}
        title={editId ? "Editar natureza" : "Nova natureza"}
        submitLabel="Salvar"
        dirty={formDirty}
        onSubmit={() => {
          if (!natForm.nome.trim()) {
            notify("Nome obrigatório");
            return;
          }
          if (editId) updateNatureza(editId, natForm);
          else addNatureza(natForm);
          notify(editId ? "Natureza atualizada" : "Natureza criada");
          setFormDirty(false);
          setKind(null);
        }}
      >
        <Field label="Nome *">
          <Input
            value={natForm.nome}
            onChange={(e) =>
              patchNat({ nome: e.target.value })
            }
          />
        </Field>
        <Field label="Linha em Resultados">
          <Input
            value={natForm.linhaResultados}
            onChange={(e) =>
              patchNat({ linhaResultados: e.target.value })
            }
          />
        </Field>
      </FormSheet>
    </div>
  );
}
