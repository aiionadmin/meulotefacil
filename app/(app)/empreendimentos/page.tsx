"use client";

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
  empreendimentosSistema,
  lotesSistema,
  brl,
  sistemaKpis,
} from "@/lib/data/sistema";

export default function EmpreendimentosPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Empreendimentos e lotes"
        description="Lado venda (quadras, lotes, planta, tabela de preços) e lado obra (ART, CEI/CNO, custos). Status com bloqueio de venda e financeiro."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/empreendimentos">Gerar lotes em massa</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/empreendimentos">Novo empreendimento</Link>
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Empreendimentos", value: sistemaKpis.empreendimentos },
          { label: "Lotes", value: sistemaKpis.lotes.toLocaleString("pt-BR") },
          {
            label: "Vendidos",
            value: sistemaKpis.lotesVendidos.toLocaleString("pt-BR"),
          },
          { label: "Na amostra", value: empreendimentosSistema.length },
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
          rows={empreendimentosSistema.map((e) => ({
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
        <DataTable
          columns={[
            { key: "id", label: "Empreendimento + Quadra + Lote" },
            { key: "area", label: "Área" },
            { key: "valor", label: "Valor" },
            { key: "status", label: "Status" },
            { key: "bloqueios", label: "Bloqueios" },
          ]}
          rows={lotesSistema.map((l) => ({
            id: (
              <span className="font-medium">
                {l.emp} {l.quadra}/{l.lote}
              </span>
            ),
            area: `${l.area} m²`,
            valor: l.valor ? brl(l.valor) : "n/d",
            status: (
              <StatusPill
                tone={
                  l.status === "Disponível"
                    ? "ok"
                    : l.status === "Jurídico"
                      ? "danger"
                      : "info"
                }
              >
                {l.status}
              </StatusPill>
            ),
            bloqueios: [
              l.bloqueiaVenda ? "venda" : null,
              l.bloqueiaFinanceiro ? "financeiro" : null,
            ]
              .filter(Boolean)
              .join(", ") || "nenhum",
          }))}
        />
      </ModuleSection>
    </div>
  );
}
