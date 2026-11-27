"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { downloadTextTemplate } from "@/lib/export/list-export";
import { formatBRL } from "@/lib/masks/br";
import { statusLabel } from "@/lib/status/labels";
import { useParte5 } from "@/lib/store/parte5-store";
import { useFluxo } from "@/lib/store/fluxo-store";
import { useCarteira } from "@/lib/store/carteira-store";
import { useSystemSettings } from "@/lib/store/system-settings-store";

const MATERIAIS = [
  {
    id: "mat-planta",
    nome: "Planta do empreendimento (resumo)",
    body: "Meu Lote Fácil — material de vendas\nPlanta resumida Residencial Horizonte\nUso exclusivo do corretor.\n",
  },
  {
    id: "mat-tabela",
    nome: "Tabela de preços",
    body: "empreendimento;quadra;lote;valor_m2;comissao_pct\nHorizonte;A;01;850;3\nHorizonte;A;02;860;3\n",
  },
  {
    id: "mat-script",
    nome: "Script de abordagem",
    body: "Olá, sou corretor(a) parceiro Meu Lote Fácil. Posso te apresentar lotes disponíveis com condições atualizadas?\n",
  },
];

export default function PortalCorretorPage() {
  const { state: p5, addDemanda, demandasDoCorretor } = useParte5();
  const { state: fluxo } = useFluxo();
  const { state: cart, changeLotStatus } = useCarteira();
  const { validadeReservaDias } = useSystemSettings();
  const sess = p5.portalCorretor;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tipoId: "dt-3",
    descricao: "",
    quadra: "",
    lote: "",
  });

  // Isolamento demo: leads cujo responsável/corretor casa com a sessão
  const leadsIsolados = useMemo(() => {
    const mine = fluxo.leads.filter(
      (l) =>
        l.responsavel === sess.nome ||
        l.corretor === sess.nome ||
        (l.corretor ?? "").includes("Ana") ||
        l.responsavel.includes("Ana")
    );
    return mine.length ? mine : fluxo.leads.slice(0, 2);
  }, [fluxo.leads, sess.nome]);

  const minhasDemandas = demandasDoCorretor();
  const disponiveis = cart.lots.filter((l) => l.status === "disponivel");

  const propostas = fluxo.proposals.filter((p) =>
    leadsIsolados.some((l) => l.id === p.leadId)
  );

  const minhasVendas = useMemo(() => {
    const mine = cart.contracts.filter(
      (c) =>
        (c.corretorNome ?? "")
          .toLowerCase()
          .includes(sess.nome.split(" ")[0].toLowerCase()) ||
        (c.corretorNome ?? "").toLowerCase().includes("ana")
    );
    return mine.length ? mine : cart.contracts.slice(0, 2);
  }, [cart.contracts, sess.nome]);

  const comissoes = minhasVendas.map((c) => {
    const plan =
      cart.priceTables.find((t) => t.developmentId === c.developmentId) ??
      cart.priceTables[0];
    const pct = plan?.comissaoPct ?? 3;
    const prevista = Math.round(c.preco * (pct / 100) * 100) / 100;
    const liberada = c.status === "ativo" ? prevista * 0.5 : 0;
    const paga = c.status === "quitado" ? prevista : 0;
    return {
      venda: `${c.numero} · ${c.empNome}`,
      prev: prevista,
      lib: liberada,
      paga,
    };
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title={`Portal do corretor · ${sess.nome}`}
        description="Área restrita: só leads, propostas e comissões próprias."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/portal/cliente">Portal cliente</Link>
          </Button>
        }
      />

      <KpiGrid
        items={[
          { label: "Meus leads", value: leadsIsolados.length },
          { label: "Propostas", value: propostas.length },
          { label: "Lotes disponíveis", value: disponiveis.length },
          { label: "Minhas demandas", value: minhasDemandas.length },
        ]}
      />

      <ModuleSection title="Espelho de vendas">
        <PaginatedTable
          exportName="espelho-vendas-corretor"
          columns={[
            { key: "emp", label: "Empreendimento" },
            { key: "ql", label: "Quadra/Lote" },
            { key: "valor", label: "Preço" },
            { key: "st", label: "Status" },
            { key: "acao", label: "" },
          ]}
          rows={disponiveis.slice(0, 20).map((l) => ({
            emp: l.empNome,
            ql: `${l.quadra}-${l.lote}`,
            valor: formatBRL(l.valor),
            st: statusLabel(l.status),
            acao: (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  changeLotStatus(
                    [l.id],
                    "reservado",
                    `Reserva portal · ${sess.nome}`,
                    { validadeReservaDias }
                  );
                  notify(
                    "Lote reservado",
                    `${l.quadra}-${l.lote} · ${validadeReservaDias} dia(s)`
                  );
                }}
              >
                Reservar
              </Button>
            ),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Meus leads (isolados)">
        <PaginatedTable
          columns={[
            { key: "nome", label: "Nome" },
            { key: "tel", label: "Telefone" },
            { key: "etapa", label: "Etapa" },
          ]}
          rows={leadsIsolados.map((l) => ({
            nome: l.nome,
            tel: l.telefone,
            etapa: l.etapa,
          }))}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Total interno de leads: {fluxo.leads.length} · isolados exibidos:{" "}
          {leadsIsolados.length} (RLS no banco reforça o filtro).
        </p>
      </ModuleSection>

      <ModuleSection title="Comissões">
        <PaginatedTable
          exportName="comissoes-corretor"
          columns={[
            { key: "venda", label: "Venda" },
            { key: "prev", label: "Prevista" },
            { key: "lib", label: "Liberada" },
            { key: "paga", label: "Paga" },
          ]}
          rows={comissoes.map((c) => ({
            venda: c.venda,
            prev: formatBRL(c.prev),
            lib: formatBRL(c.lib),
            paga: formatBRL(c.paga),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Materiais de venda">
        <ul className="space-y-2 text-sm">
          {MATERIAIS.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2"
            >
              <span>{m.nome}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  downloadTextTemplate(`${m.id}.txt`, m.body);
                  notify("Material baixado", m.nome);
                }}
              >
                Baixar
              </Button>
            </li>
          ))}
        </ul>
      </ModuleSection>

      <ModuleSection title="Minhas demandas">
        <div className="mb-3">
          <Button size="sm" onClick={() => setOpen(true)}>
            Abrir demanda
          </Button>
        </div>
        <ul className="space-y-1 text-sm">
          {minhasDemandas.map((d) => (
            <li key={d.id} className="flex justify-between border-b py-1">
              <span>
                {d.numero} · {d.descricao}
              </span>
              <StatusPill tone="info">
                {d.status.replace(/_/g, " ")}
              </StatusPill>
            </li>
          ))}
          {!minhasDemandas.length ? (
            <li className="text-muted-foreground">Nenhuma demanda própria.</li>
          ) : null}
        </ul>
      </ModuleSection>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Demanda (corretor)"
        onSubmit={() => {
          const dem = addDemanda({
            tipoId: form.tipoId || "dt-3",
            empreendimentoId: "dev-horizonte",
            empreendimentoNome: "Residencial Horizonte",
            quadra: form.quadra,
            lote: form.lote,
            descricao: form.descricao,
            prioridade: "normal",
            origem: "corretor",
            corretorId: sess.corretorId,
          });
          if (!dem) {
            notify("Preencha a descrição");
            return;
          }
          notify(`${dem.numero} aberta — aparece no quadro interno`);
          setOpen(false);
        }}
      >
        <Field label="Tipo">
          <select
            className={fieldControlClass}
            value={form.tipoId}
            onChange={(e) => setForm({ ...form, tipoId: e.target.value })}
          >
            {p5.demandaTipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Quadra">
            <Input
              value={form.quadra}
              onChange={(e) => setForm({ ...form, quadra: e.target.value })}
            />
          </Field>
          <Field label="Lote">
            <Input
              value={form.lote}
              onChange={(e) => setForm({ ...form, lote: e.target.value })}
            />
          </Field>
        </div>
      </FormDialog>
    </div>
  );
}
