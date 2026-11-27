"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import { useFinanceiro } from "@/lib/store/financeiro-store";

export default function PlanoContasPage() {
  const { state } = useFinanceiro();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Plano de contas e categorias"
        description="Carga inicial Mais Controle; exclusão bloqueada se houver lançamento (demo)."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/financeiro/pagamentos">Pagamentos</Link>
          </Button>
        }
      />
      <ModuleSection title="Planos">
        <PaginatedTable
          columns={[
            { key: "nome", label: "Nome" },
            { key: "fluxo", label: "Fluxo" },
            { key: "grupo", label: "Grupo resultados" },
            { key: "ativo", label: "Ativo" },
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
          }))}
        />
      </ModuleSection>
      <ModuleSection title="Categorias">
        <PaginatedTable
          columns={[
            { key: "nome", label: "Categoria" },
            { key: "plano", label: "Plano" },
            { key: "classif", label: "Gestão de obra" },
          ]}
          rows={state.categorias.map((c) => ({
            nome: c.nome,
            plano:
              state.planos.find((p) => p.id === c.planoId)?.nome ?? "—",
            classif: c.classificacaoObra,
          }))}
        />
      </ModuleSection>
      <ModuleSection title="Naturezas de receita">
        <ul className="flex flex-wrap gap-2 text-sm">
          {state.naturezas.map((n) => (
            <li
              key={n.id}
              className="rounded-md bg-muted px-2 py-1 text-muted-foreground"
            >
              {n.nome}
            </li>
          ))}
        </ul>
      </ModuleSection>
    </div>
  );
}
