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
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { statusLabel } from "@/lib/status/labels";
import { useCarteira } from "@/lib/store/carteira-store";
import { useParte5 } from "@/lib/store/parte5-store";
import { useObras } from "@/lib/store/obras-store";
import { useFluxo } from "@/lib/store/fluxo-store";
import { useFase1 } from "@/lib/store/fase1-store";

const ABAS = [
  "resumo",
  "planta",
  "lotes",
  "vendas",
  "boletos",
  "previsao",
  "inadimplencia",
  "regularizacao",
  "demandas",
  "obras",
  "arquivos",
] as const;

export default function EmpreendimentoHubPage() {
  const { state: cart } = useCarteira();
  const { state: p5 } = useParte5();
  const { state: obras } = useObras();
  const { state: fluxo } = useFluxo();
  const { state: fase1 } = useFase1();
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
  const boletos = useMemo(
    () =>
      cart.bankSlips.filter((b) =>
        contratos.some((c) => c.id === b.contractId)
      ),
    [cart.bankSlips, contratos]
  );
  const regularizacao = useMemo(
    () =>
      fluxo.regularization.filter(
        (r) => r.empNome === emp?.nome || r.empNome.includes(emp?.nome ?? "")
      ),
    [fluxo.regularization, emp?.nome]
  );
  const arquivos = useMemo(
    () =>
      fase1.files.filter(
        (f) =>
          f.comentario?.toLowerCase().includes((emp?.nome ?? "").toLowerCase()) ||
          f.nome.toLowerCase().includes((emp?.codigo ?? "").toLowerCase())
      ),
    [fase1.files, emp?.nome, emp?.codigo]
  );

  if (!emp) {
    return <p className="text-sm text-muted-foreground">Sem empreendimentos.</p>;
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Gestão do empreendimento"
        description="Visão única I02 — resumo, planta, lotes, vendas, boletos, carteira, regularização, demandas, obras e arquivos."
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

      {aba === "planta" ? (
        <ModuleSection title="Planta">
          <p className="mb-3 text-sm text-muted-foreground">
            Visualização e edição de áreas na planta do empreendimento.
          </p>
          <Button size="sm" asChild>
            <Link href={`/empreendimentos/planta?emp=${emp.id}`}>
              Abrir planta
            </Link>
          </Button>
        </ModuleSection>
      ) : null}

      {aba === "lotes" ? (
        <ModuleSection title="Lotes">
          <PaginatedTable
            exportName="hub-lotes"
            columns={[
              { key: "ql", label: "Q/L" },
              { key: "valor", label: "Valor" },
              { key: "st", label: "Status" },
            ]}
            rows={lotes.map((l) => ({
              ql: `${l.quadra}-${l.lote}`,
              valor: formatBRL(l.valor),
              st: statusLabel(l.status),
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

      {aba === "boletos" ? (
        <ModuleSection title="Boletos">
          <PaginatedTable
            exportName="hub-boletos"
            columns={[
              { key: "nn", label: "Nosso nº" },
              { key: "ctr", label: "Contrato" },
              { key: "venc", label: "Vencimento" },
              { key: "valor", label: "Valor" },
              { key: "st", label: "Status" },
            ]}
            rows={boletos.map((b) => ({
              nn: b.nossoNumero,
              ctr: b.contratoNumero,
              venc: formatDateBR(b.vencimento),
              valor: formatBRL(b.valor),
              st: statusLabel(b.status),
            }))}
          />
          <Button size="sm" variant="outline" className="mt-3" asChild>
            <Link href="/boletos">Módulo de boletos</Link>
          </Button>
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

      {aba === "regularizacao" ? (
        <ModuleSection title="Regularização">
          <PaginatedTable
            exportName="hub-regularizacao"
            columns={[
              { key: "cli", label: "Cliente" },
              { key: "lote", label: "Lote" },
              { key: "etapa", label: "Etapa" },
              { key: "prazo", label: "Prazo" },
            ]}
            rows={regularizacao.map((r) => ({
              cli: r.cliente,
              lote: r.loteLabel,
              etapa: statusLabel(r.etapa),
              prazo: r.prazo ? formatDateBR(r.prazo) : "—",
            }))}
          />
          <Button size="sm" variant="outline" className="mt-3" asChild>
            <Link href="/quadros/regularizacao">Quadro regularização</Link>
          </Button>
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

      {aba === "arquivos" ? (
        <ModuleSection title="Arquivos">
          <PaginatedTable
            exportName="hub-arquivos"
            columns={[
              { key: "nome", label: "Nome" },
              { key: "tag", label: "Tag" },
              { key: "tam", label: "Tamanho" },
            ]}
            rows={arquivos.map((f) => ({
              nome: f.nome,
              tag: f.tag,
              tam: f.tamanho,
            }))}
          />
          {!arquivos.length ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum arquivo etiquetado com este empreendimento.
            </p>
          ) : null}
          <Button size="sm" variant="outline" className="mt-3" asChild>
            <Link href="/arquivos">Central de arquivos</Link>
          </Button>
        </ModuleSection>
      ) : null}
    </div>
  );
}
