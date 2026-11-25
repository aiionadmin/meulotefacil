"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";
import { BoardViews } from "@/components/kanban/BoardViews";
import { useFluxo } from "@/lib/store/fluxo-store";
import { notify } from "@/components/app/ModuleToolkit";
import type { RegularizationCase } from "@/lib/domain/fluxo-types";
import { useCarteira } from "@/lib/store/carteira-store";
import { useMemo } from "react";

const COLS = [
  { id: "documentos", label: "Documentos do cliente" },
  { id: "prefeitura", label: "Prefeitura" },
  { id: "cartorio", label: "Cartório" },
  { id: "registro", label: "Registro" },
  { id: "matricula", label: "Matrícula pronta" },
  { id: "entregue", label: "Entregue" },
] as const;

export default function QuadroRegularizacaoPage() {
  const { state, moverRegularizacao } = useFluxo();
  const { state: carteira } = useCarteira();

  const empByName = useMemo(() => {
    const m = new Map(carteira.developments.map((d) => [d.nome, d]));
    return m;
  }, [carteira.developments]);

  const cards = useMemo(
    () =>
      state.regularization
        .filter((r) => {
          const emp = empByName.get(r.empNome);
          if (!emp) return true;
          return emp.modalidade !== "loteamento";
        })
        .map((r) => ({
          id: r.id,
          columnId: r.etapa,
          title: r.cliente,
          subtitle: `${r.empNome} · ${r.loteLabel}`,
          meta: r.responsavel,
          badge: r.prazo ? `prazo ${r.prazo}` : undefined,
        })),
    [state.regularization, empByName]
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Quadro: regularização e escritura"
        description="Só avança. Empreendimentos só de loteamento não entram neste quadro."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/processos">Processos</Link>
          </Button>
        }
      />
      <BoardViews
        storageKey="regularizacao"
        columns={COLS.map((c) => ({ ...c, droppable: true }))}
        cards={cards}
        onMove={(cardId, to) => {
          const ok = moverRegularizacao(
            cardId,
            to as RegularizationCase["etapa"]
          );
          if (!ok) {
            notify(
              "Movimento bloqueado",
              "O card só pode avançar para etapas à frente."
            );
          } else {
            notify("Etapa avançada");
          }
          return ok;
        }}
      />
    </div>
  );
}
