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
import { PortalLoginGate } from "@/components/app/PortalLoginGate";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { regularizacoesDoCliente } from "@/lib/domain/regularizacao-timeline";
import { useParte5 } from "@/lib/store/parte5-store";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import { useFluxo } from "@/lib/store/fluxo-store";

function digits(s: string) {
  return s.replace(/\D/g, "");
}

export default function PortalClientePage() {
  const { state: p5, addDemanda, demandasDoCliente, setPortalCliente } =
    useParte5();
  const { state: cart, saldoDevedor } = useCarteira();
  const { state: fin } = useFinanceiro();
  const { state: fluxo } = useFluxo();
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
  const minhasReg = useMemo(
    () =>
      regularizacoesDoCliente(
        fluxo.regularization,
        sess.nome,
        sess.cpf
      ),
    [fluxo.regularization, sess.nome, sess.cpf]
  );

  return (
    <PortalLoginGate
      kind="cliente"
      title="Portal do cliente"
      hint="Entre com CPF e o código enviado por SMS/e-mail."
      demoHint="Demo: CPF 123.456.789-00 · código demo"
      onLogin={({ documento, codigo }) => {
        const okCpf =
          digits(documento) === digits(sess.cpf) ||
          digits(documento) === "12345678900";
        if (!okCpf || codigo.toLowerCase() !== "demo") {
          return {
            ok: false,
            message: "CPF ou código inválidos (use o demo)",
          };
        }
        setPortalCliente("cli-1", "Maria Souza", "123.456.789-00");
        return { ok: true };
      }}
    >
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
          { label: "Regularizações", value: minhasReg.length },
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
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={() => notify("2ª via / Pix gerados (demo)")}
        >
          Gerar 2ª via boleto / Pix
        </Button>
      </ModuleSection>

      <ModuleSection title="Minha regularização">
        {minhasReg.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum processo de regularização vinculado a este CPF.
          </p>
        ) : (
          <div className="space-y-6">
            {minhasReg.map((view) => (
              <div key={view.caso.id} className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    {view.caso.empNome} · lote {view.caso.loteLabel}
                  </p>
                  {view.previsaoEscritura ? (
                    <p className="text-xs text-muted-foreground">
                      Previsão escritura:{" "}
                      {formatDateBR(view.previsaoEscritura)}
                    </p>
                  ) : null}
                </div>
                <ol className="flex flex-wrap gap-2">
                  {view.etapas.map((step) => (
                    <li key={step.etapa}>
                      <StatusPill
                        tone={
                          step.status === "concluida"
                            ? "ok"
                            : step.status === "atual"
                              ? "info"
                              : "neutral"
                        }
                      >
                        {step.label}
                        {step.status === "atual" ? " · atual" : ""}
                      </StatusPill>
                    </li>
                  ))}
                </ol>
                {view.docsPendentes.length > 0 ? (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Documentos pendentes
                    </p>
                    <ul className="list-inside list-disc text-sm">
                      {view.docsPendentes.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        notify("Envio de documento registrado (demo)")
                      }
                    >
                      Enviar documento
                    </Button>
                  </div>
                ) : null}
                {view.exigencias.length > 0 ? (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Exigências
                    </p>
                    <ul className="list-inside list-disc text-sm">
                      {view.exigencias.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
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
    </PortalLoginGate>
  );
}
