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
import {
  buildSegundaViaPix,
  downloadInformeAnual,
} from "@/lib/export/portal-cliente";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useParte5 } from "@/lib/store/parte5-store";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFinanceiro } from "@/lib/store/financeiro-store";

export default function PortalClientePage() {
  const { state: p5, addDemanda, demandasDoCliente } = useParte5();
  const { state: cart, saldoDevedor } = useCarteira();
  const { state: fin } = useFinanceiro();
  const sess = p5.portalCliente;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tipoId: "dt-1",
    descricao: "",
  });

  const meusContratos = useMemo(() => {
    const byName = cart.contracts.filter((c) =>
      c.compradorNome
        .toLowerCase()
        .includes(sess.nome.split(" ")[0].toLowerCase())
    );
    return byName.length ? byName : cart.contracts.slice(0, 1);
  }, [cart.contracts, sess.nome]);

  const outrasPessoas = cart.contracts.filter(
    (c) => !meusContratos.some((m) => m.id === c.id)
  );

  const minhasDemandas = demandasDoCliente();
  const meusRecs = fin.recebimentos.filter(
    (r) =>
      r.origem === "contrato" &&
      r.cliente.toLowerCase().includes(sess.nome.split(" ")[0].toLowerCase())
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title={`Portal do cliente · ${sess.nome}`}
        description={`Login CPF ${sess.cpf} — só contratos e demandas próprios.`}
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/portal/corretor">Portal corretor</Link>
          </Button>
        }
      />

      <KpiGrid
        items={[
          { label: "Meus contratos", value: meusContratos.length },
          {
            label: "Saldo (1º contrato)",
            value: formatBRL(
              meusContratos[0] ? saldoDevedor(meusContratos[0].id) : 0
            ),
          },
          { label: "Parcelas em aberto", value: meusRecs.length },
          { label: "Minhas demandas", value: minhasDemandas.length },
        ]}
      />

      <ModuleSection title="Meus lotes / contratos">
        <PaginatedTable
          columns={[
            { key: "num", label: "Contrato" },
            { key: "cli", label: "Cliente" },
            { key: "st", label: "Status" },
            { key: "saldo", label: "Saldo" },
          ]}
          rows={meusContratos.map((c) => ({
            num: c.numero,
            cli: c.compradorNome,
            st: c.status,
            saldo: formatBRL(saldoDevedor(c.id)),
          }))}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Isolamento: {outrasPessoas.length} contrato(s) de outros clientes{" "}
          <strong>ocultos</strong> neste portal.
        </p>
      </ModuleSection>

      <ModuleSection title="Parcelas / 2ª via">
        <PaginatedTable
          columns={[
            { key: "venc", label: "Vencimento" },
            { key: "valor", label: "Valor" },
            { key: "st", label: "Status" },
            { key: "ref", label: "Ref." },
          ]}
          rows={meusRecs.map((r) => ({
            venc: formatDateBR(r.vencimento),
            valor: formatBRL(r.valor),
            st: (
              <StatusPill
                tone={r.status === "vencido" ? "danger" : "info"}
              >
                {r.status}
              </StatusPill>
            ),
            ref: r.contratoRef ?? "—",
          }))}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const alvo = meusRecs.find((r) => r.status !== "recebido") ?? meusRecs[0];
              const ctr = meusContratos[0];
              if (!alvo || !ctr) {
                notify("Sem parcela para 2ª via");
                return;
              }
              const text = buildSegundaViaPix({
                cliente: sess.nome,
                contrato: ctr.numero,
                valor: alvo.valor,
                vencimento: alvo.vencimento,
              });
              downloadTextTemplate(
                `segunda-via-${ctr.numero}.txt`,
                text
              );
              notify("2ª via / Pix gerados", `Ctr ${ctr.numero}`);
            }}
          >
            Gerar 2ª via boleto / Pix
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              downloadInformeAnual({
                ano: 2026,
                cliente: sess.nome,
                cpf: sess.cpf,
                contratos: meusContratos.map((c) => ({
                  numero: c.numero,
                  empreendimento: c.empNome,
                  preco: c.preco,
                  saldo: saldoDevedor(c.id),
                })),
                parcelasPagas: meusRecs
                  .filter((r) => r.status === "recebido")
                  .map((r) => ({
                    vencimento: r.vencimento,
                    valor: r.valor,
                    status: r.status,
                    contratoRef: r.contratoRef,
                  })),
              });
              notify("Informe anual", "2026");
            }}
          >
            Informe anual
          </Button>
        </div>
      </ModuleSection>

      <ModuleSection title="Minhas demandas">
        <div className="mb-3">
          <Button size="sm" onClick={() => setOpen(true)}>
            Abrir pedido
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
        </ul>
      </ModuleSection>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova demanda (portal cliente)"
        onSubmit={() => {
          const dem = addDemanda({
            tipoId: form.tipoId || "dt-1",
            empreendimentoId: "dev-horizonte",
            empreendimentoNome: "Residencial Horizonte",
            clienteId: sess.clienteId,
            clienteNome: sess.nome,
            descricao: form.descricao,
            prioridade: "normal",
            origem: "portal_cliente",
          });
          if (!dem) {
            notify("Informe a descrição");
            return;
          }
          notify(`${dem.numero} enviada ao quadro interno`);
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
      </FormDialog>
    </div>
  );
}
