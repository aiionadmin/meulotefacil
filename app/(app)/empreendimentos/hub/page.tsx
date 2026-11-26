"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import { fieldControlClass } from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import { useParte5 } from "@/lib/store/parte5-store";
import { useObras } from "@/lib/store/obras-store";
import { useFluxo } from "@/lib/store/fluxo-store";

const ABAS = [
  "resumo",
  "lotes",
  "vendas",
  "previsao",
  "inadimplencia",
  "demandas",
  "obras",
] as const;

export default function EmpreendimentoHubPage() {
  const { state: cart } = useCarteira();
  const { state: p5 } = useParte5();
  const { state: obras } = useObras();
  const { state: fluxo } = useFluxo();
  const [empId, setEmpId] = useState(cart.developments[0]?.id ?? "");
  const [aba, setAba] = useState<(typeof ABAS)[number]>("resumo");

  const emp =
    cart.developments.find((d) => d.id === empId) ?? cart.developments[0];

  const lotes = useMemo(
    () => cart.lots.filter((l) => l.developmentId === emp?.id),
    [cart.lots, emp?.id]
  );
  const contratos = useMemo(
    () => cart.contracts.filter((c) => c.developmentId === emp?.id),
    [cart.contracts, emp?.id]
  );
  const demandas = useMemo(
    () =>
      p5.demandas.filter(
        (d) =>
          d.empreendimentoId === emp?.id ||
          d.empreendimentoNome === emp?.nome
      ),
    [p5.demandas, emp]
  );
  const propostasCount = fluxo.proposals.filter(
    (p) => p.empNome === emp?.nome
  ).length;

  if (!emp) {
    return <p className="text-sm text-muted-foreground">Sem empreendimentos.</p>;
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Gestão do empreendimento"
        description="Visão única — resumo, lotes, vendas, inadimplência, demandas e obras."
        actions={
          <>
            <select
              className={fieldControlClass + " w-auto"}
              value={emp.id}
              onChange={(e) => setEmpId(e.target.value)}
            >
              {cart.developments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
            <Button size="sm" variant="outline" asChild>
              <Link href="/empreendimentos/planta">Planta</Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {ABAS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAba(a)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
              aba === a
                ? "bg-brand-green text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {a.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {aba === "resumo" ? (
        <KpiGrid
          items={[
            { label: "Lotes", value: lotes.length },
            {
              label: "Disponíveis",
              value: lotes.filter((l) => l.status === "disponivel").length,
            },
            { label: "Contratos", value: contratos.length },
            { label: "Demandas", value: demandas.length },
          ]}
        />
      ) : null}

      {aba === "lotes" ? (
        <ModuleSection title="Lotes">
          <PaginatedTable
            columns={[
              { key: "ql", label: "Q/L" },
              { key: "valor", label: "Valor" },
              { key: "st", label: "Status" },
            ]}
            rows={lotes.map((l) => ({
              ql: `${l.quadra}-${l.lote}`,
              valor: formatBRL(l.valor),
              st: l.status,
            }))}
          />
        </ModuleSection>
      ) : null}

      {aba === "vendas" ? (
        <ModuleSection title="Propostas e contratos">
          <p className="mb-2 text-sm text-muted-foreground">
            Propostas no funil: {propostasCount}
          </p>
          <PaginatedTable
            columns={[
              { key: "num", label: "Contrato" },
              { key: "cli", label: "Comprador" },
              { key: "st", label: "Status" },
              { key: "preco", label: "Preço" },
            ]}
            rows={contratos.map((c) => ({
              num: c.numero,
              cli: c.compradorNome,
              st: c.status,
              preco: formatBRL(c.preco),
            }))}
          />
        </ModuleSection>
      ) : null}

      {aba === "previsao" ? (
        <ModuleSection title="Previsão de carteira">
          <p className="text-sm text-muted-foreground">
            Recebimentos previstos (parcelas em aberto dos contratos deste
            empreendimento).
          </p>
          <p className="mt-2 font-display text-2xl">
            {formatBRL(
              cart.installments
                .filter(
                  (i) =>
                    contratos.some((c) => c.id === i.contractId) &&
                    i.status !== "paga" &&
                    i.status !== "cancelada"
                )
                .reduce((a, i) => a + i.valor, 0)
            )}
          </p>
        </ModuleSection>
      ) : null}

      {aba === "inadimplencia" ? (
        <ModuleSection title="Inadimplência">
          <PaginatedTable
            columns={[
              { key: "cli", label: "Cliente" },
              { key: "parc", label: "Parcela" },
              { key: "venc", label: "Vencimento" },
              { key: "valor", label: "Valor" },
            ]}
            rows={cart.installments
              .filter(
                (i) =>
                  contratos.some((c) => c.id === i.contractId) &&
                  i.status === "vencida"
              )
              .map((i) => ({
                cli: i.compradorNome,
                parc: i.contratoNumero,
                venc: i.vencimento,
                valor: formatBRL(i.valor),
              }))}
          />
        </ModuleSection>
      ) : null}

      {aba === "demandas" ? (
        <ModuleSection title="Demandas do empreendimento">
          <ul className="space-y-1 text-sm">
            {demandas.map((d) => (
              <li key={d.id} className="flex justify-between border-b py-1">
                <span>
                  {d.numero} · {d.descricao}
                </span>
                <StatusPill tone="info">
                  {d.status.replace(/_/g, " ")}
                </StatusPill>
              </li>
            ))}
            {!demandas.length ? (
              <li className="text-muted-foreground">Nenhuma demanda.</li>
            ) : null}
          </ul>
          <Button size="sm" variant="outline" className="mt-3" asChild>
            <Link href="/demandas">Abrir quadro</Link>
          </Button>
        </ModuleSection>
      ) : null}

      {aba === "obras" ? (
        <ModuleSection title="Obras vinculadas">
          <ul className="space-y-1 text-sm">
            {obras.obras
              .filter(
                (o) =>
                  o.developmentId === emp.id ||
                  o.developmentNome === emp.nome ||
                  !o.developmentId
              )
              .map((o) => (
                <li key={o.id} className="flex justify-between border-b py-1">
                  <Link
                    href={`/obras/${o.id}`}
                    className="hover:text-brand-orange"
                  >
                    {o.nome}
                  </Link>
                  <span>
                    {formatBRL(o.realizado)} / {formatBRL(o.orcado)}
                  </span>
                </li>
              ))}
          </ul>
        </ModuleSection>
      ) : null}
    </div>
  );
}
