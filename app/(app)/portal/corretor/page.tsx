"use client";

import { useEffect, useMemo, useState } from "react";
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
import { PortalLoginGate } from "@/components/app/PortalLoginGate";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useParte5 } from "@/lib/store/parte5-store";
import { useFluxo } from "@/lib/store/fluxo-store";
import { useCarteira } from "@/lib/store/carteira-store";

export default function PortalCorretorPage() {
  const {
    state: p5,
    addDemanda,
    demandasDoCorretor,
    setPortalCorretor,
    comissoesDoCorretor,
    totaisComissao,
    reservarLote,
    expirarReservasVencidas,
    minhasReservas,
  } = useParte5();
  const { state: fluxo } = useFluxo();
  const { state: cart, updateLot } = useCarteira();
  const sess = p5.portalCorretor;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tipoId: "dt-3",
    descricao: "",
    quadra: "",
    lote: "",
  });

  useEffect(() => {
    const { expiradas, lotesLiberados } = expirarReservasVencidas();
    if (expiradas > 0) {
      for (const lotId of lotesLiberados) {
        updateLot(lotId, {
          status: "disponivel",
          bloqueiaVenda: false,
          compradorNome: undefined,
        });
      }
      notify(`${expiradas} reserva(s) expirada(s) — lotes liberados`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- uma vez ao montar
  }, []);

  // Isolamento demo: leads cujo responsável/corretor casa com a sessão
  const leadsIsolados = useMemo(() => {
    const mine = fluxo.leads.filter(
      (l) =>
        l.responsavel === sess.nome ||
        l.corretorNome === sess.nome ||
        (l.corretorNome ?? "").includes("Ana") ||
        l.responsavel.includes("Ana")
    );
    return mine.length ? mine : fluxo.leads.slice(0, 2);
  }, [fluxo.leads, sess.nome]);

  const minhasDemandas = demandasDoCorretor();
  const disponiveis = cart.lots.filter((l) => l.status === "disponivel");
  const comissoes = comissoesDoCorretor();
  const totais = totaisComissao();
  const reservas = minhasReservas();

  const propostas = fluxo.proposals.filter((p) =>
    leadsIsolados.some((l) => l.id === p.leadId)
  );

  return (
    <PortalLoginGate
      kind="corretor"
      title="Portal do corretor"
      hint="Entre com e-mail cadastrado e o código de acesso."
      demoHint="Demo: ana@corretor.demo · código demo"
      onLogin={({ documento, codigo }) => {
        const id = documento.toLowerCase();
        const ok =
          (id.includes("ana") || id.includes("corretor")) &&
          codigo.toLowerCase() === "demo";
        if (!ok) {
          return {
            ok: false,
            message: "E-mail ou código inválidos (use o demo)",
          };
        }
        setPortalCorretor("corr-1", "Ana Corretora");
        return { ok: true };
      }}
    >
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
          { label: "Comissão liberada", value: formatBRL(totais.liberado) },
        ]}
      />

      <ModuleSection title="Espelho de vendas">
        <PaginatedTable
          columns={[
            { key: "emp", label: "Empreendimento" },
            { key: "ql", label: "Quadra/Lote" },
            { key: "valor", label: "Preço" },
            { key: "acao", label: "Ação" },
          ]}
          rows={disponiveis.slice(0, 20).map((l) => ({
            emp: l.empNome,
            ql: `${l.quadra}-${l.lote}`,
            valor: formatBRL(l.valor),
            acao: (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const res = reservarLote({
                    lotId: l.id,
                    empNome: l.empNome,
                    quadra: l.quadra,
                    lote: l.lote,
                    lotStatus: l.status,
                    prazoDias: 3,
                  });
                  if (!res.ok) {
                    notify(res.motivo);
                    return;
                  }
                  updateLot(l.id, {
                    status: "reservado",
                    bloqueiaVenda: true,
                    compradorNome: `Reserva ${sess.nome}`,
                  });
                  notify(
                    `Reservado até ${formatDateBR(res.reserva.expiraEm)}`
                  );
                }}
              >
                Reservar 3 dias
              </Button>
            ),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Minhas reservas">
        <PaginatedTable
          columns={[
            { key: "ql", label: "Quadra/Lote" },
            { key: "expira", label: "Expira" },
            { key: "st", label: "Status" },
          ]}
          rows={reservas.map((r) => ({
            ql: `${r.empNome} · ${r.quadra}-${r.lote}`,
            expira: formatDateBR(r.expiraEm),
            st: (
              <StatusPill
                tone={
                  r.status === "ativa"
                    ? "info"
                    : r.status === "expirada"
                      ? "danger"
                      : "neutral"
                }
              >
                {r.status}
              </StatusPill>
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
          columns={[
            { key: "venda", label: "Venda" },
            { key: "prev", label: "Prevista" },
            { key: "lib", label: "Liberada" },
            { key: "paga", label: "Paga" },
            { key: "st", label: "Status" },
          ]}
          rows={comissoes.map((c) => ({
            venda: `${c.vendaRef} · ${c.empreendimentoNome}`,
            prev: formatBRL(c.valorPrevisto),
            lib: formatBRL(c.valorLiberado),
            paga: formatBRL(c.valorPago),
            st: (
              <StatusPill
                tone={
                  c.status === "paga"
                    ? "ok"
                    : c.status === "liberada"
                      ? "info"
                      : "neutral"
                }
              >
                {c.status}
              </StatusPill>
            ),
          }))}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Isolamento: só comissões de {sess.nome}. Totais — prevista{" "}
          {formatBRL(totais.previsto)} · liberada {formatBRL(totais.liberado)} ·
          paga {formatBRL(totais.pago)}.
        </p>
      </ModuleSection>

      <ModuleSection title="Materiais de venda">
        <ul className="space-y-2 text-sm">
          {p5.materiaisVenda.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b py-2"
            >
              <span>
                <span className="font-medium">{m.titulo}</span>
                <span className="block text-xs text-muted-foreground">
                  {m.tipo} · {m.empreendimentoNome}
                </span>
              </span>
              <Button size="sm" variant="outline" asChild>
                <a href={m.url} download>
                  Baixar
                </a>
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
    </PortalLoginGate>
  );
}
