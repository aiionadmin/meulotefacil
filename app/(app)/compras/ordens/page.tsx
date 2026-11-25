"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  DetailRow,
  DetailSheet,
  FilterBar,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useCompras } from "@/lib/store/compras-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { podeAprovarPorAlcada } from "@/lib/domain/alcadas";
import type { OrdemCompra } from "@/lib/domain/compras-types";

export default function OrdensCompraPage() {
  const {
    state,
    aprovarOrdem,
    negarOrdem,
    marcarOcEntregue,
  } = useCompras();
  const { state: f1, currentUser } = useFase1();
  const perfil =
    f1.profiles.find((p) => p.id === currentUser?.profileId)?.nome ??
    "Administrador";
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<OrdemCompra | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.ordens;
    return state.ordens.filter((o) =>
      [o.numero, o.fornecedor, o.descricao, o.centro.label]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.ordens, q]);

  const totais = useMemo(() => {
    const by = (st: string) =>
      state.ordens
        .filter((o) => o.aprovacaoStatus === st)
        .reduce((a, o) => a + o.valor, 0);
    return {
      total: state.ordens.reduce((a, o) => a + o.valor, 0),
      aprovado: by("aprovado"),
      em_aberto: by("em_aberto"),
      negociando: by("negociando"),
      aguardando: by("aguardando_aprovacao"),
      negado: by("negado"),
    };
  }, [state.ordens]);

  const live = selected
    ? state.ordens.find((o) => o.id === selected.id) ?? selected
    : null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Ordens de compra"
        description="OC nasce da cotação (padrão: sem cotação bloqueado)."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/compras">Solicitações</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/compras/cotacoes">Cotações</Link>
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Ordens", value: state.ordens.length },
          { label: "Total", value: formatBRL(totais.total) },
          { label: "Aprovado", value: formatBRL(totais.aprovado) },
          {
            label: "Aguardando",
            value: formatBRL(totais.aguardando),
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Buscar OC…" />

      <ModuleSection title="Lista">
        <PaginatedTable
          columns={[
            { key: "numero", label: "Nº" },
            { key: "forn", label: "Fornecedor" },
            { key: "valor", label: "Valor" },
            { key: "desc", label: "Descrição" },
            { key: "centro", label: "Centro" },
            { key: "criacao", label: "Criação" },
            { key: "aprov", label: "Aprovação" },
            { key: "compra", label: "Compra" },
          ]}
          rows={filtered.map((o) => ({
            numero: (
              <button
                type="button"
                className="font-medium hover:text-brand-orange"
                onClick={() => setSelected(o)}
              >
                {o.numero}
              </button>
            ),
            forn: o.fornecedor,
            valor: formatBRL(o.valor),
            desc: o.descricao,
            centro: o.centro.label,
            criacao: formatDateBR(o.criadoEm),
            aprov: (
              <StatusPill tone="info">
                {o.aprovacaoStatus.replace(/_/g, " ")}
              </StatusPill>
            ),
            compra: (
              <StatusPill tone="ok">
                {o.compraStatus.replace(/_/g, " ")}
              </StatusPill>
            ),
          }))}
        />
      </ModuleSection>

      <p className="text-xs text-muted-foreground">
        Totais — Total {formatBRL(totais.total)} · Aprovado{" "}
        {formatBRL(totais.aprovado)} · Em aberto {formatBRL(totais.em_aberto)} ·
        Negociando {formatBRL(totais.negociando)} · Aguardando{" "}
        {formatBRL(totais.aguardando)} · Negado {formatBRL(totais.negado)}
      </p>
      {!state.config.permitirOcSemCotacao ? (
        <p className="text-xs text-muted-foreground">
          Configuração: OC sem cotação não permitida.
        </p>
      ) : null}

      <DetailSheet
        open={!!live}
        onOpenChange={(o) => !o && setSelected(null)}
        title={live?.numero ?? ""}
      >
        {live ? (
          <div className="space-y-3">
            <DetailRow label="Fornecedor" value={live.fornecedor} />
            <DetailRow label="Centro" value={live.centro.label} />
            <DetailRow label="Valor" value={formatBRL(live.valor)} />
            <DetailRow
              label="Cotação"
              value={
                state.cotacoes.find((c) => c.id === live.quotationId)?.numero ??
                "—"
              }
            />
            <DetailRow
              label="Aprovação"
              value={live.aprovacaoStatus.replace(/_/g, " ")}
            />
            <DetailRow
              label="Compra"
              value={live.compraStatus.replace(/_/g, " ")}
            />
            {live.payableId ? (
              <DetailRow label="Lançamento" value={live.payableId} />
            ) : null}
            <div className="text-sm font-medium">Itens</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {live.itens.map((it) => (
                <li key={it.id}>
                  {it.descricao} · {it.quantidade} {it.unidade} ×{" "}
                  {formatBRL(it.valorUnitario)} = {formatBRL(it.valor)}
                </li>
              ))}
            </ul>
            <div className="text-xs text-muted-foreground">
              + Frete {formatBRL(live.frete)} · + Despesas{" "}
              {formatBRL(live.outrasDespesas)} · + Impostos{" "}
              {formatBRL(live.impostos)} · − Desc. {formatBRL(live.desconto)}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {live.aprovacaoStatus === "aguardando_aprovacao" ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      const gate = podeAprovarPorAlcada(
                        f1.approvalRules,
                        "Ordem de compra",
                        live.valor,
                        perfil
                      );
                      if (!gate.ok) {
                        notify(gate.motivo ?? "Fora da sua alçada");
                        return;
                      }
                      const r = aprovarOrdem(live.id);
                      if (!r.ok) {
                        notify(
                          live.quotationId
                            ? "Não foi possível aprovar"
                            : "OC sem cotação bloqueada"
                        );
                        return;
                      }
                      notify(
                        r.payable
                          ? `Aprovada · a pagar ${formatBRL(r.payable.valor)}`
                          : "Aprovada"
                      );
                      setSelected(null);
                    }}
                  >
                    Aprovar + lançamento
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      negarOrdem(live.id);
                      notify("OC negada");
                      setSelected(null);
                    }}
                  >
                    Negar
                  </Button>
                </>
              ) : null}
              {live.aprovacaoStatus === "aprovado" &&
              live.compraStatus !== "entregue_total" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    marcarOcEntregue(live.id, false);
                    notify("Entrega total");
                    setSelected(null);
                  }}
                >
                  Marcar entregue
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DetailSheet>
    </div>
  );
}
