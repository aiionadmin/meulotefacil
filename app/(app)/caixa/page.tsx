"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { SearchSelect } from "@/components/app/SearchSelect";
import { downloadExcel, printList } from "@/lib/export/list-export";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { formatBRL } from "@/lib/masks/br";

export default function CaixaPage() {
  const { state, receberNoCaixa, estornarCaixa, fecharCaixa } = useCarteira();
  const { currentUser, state: f1 } = useFase1();
  const perfilNome =
    f1.profiles.find((p) => p.id === currentUser?.profileId)?.nome ?? "—";
  const params = state.receiptParams ?? {
    multaAcumulativa: false,
    naoReceberAtuaisComAtrasadas: true,
    pagamentoParcial: true,
    unirVendasNoCaixa: false,
    despesaBancariaPadrao: 2.5,
    textoRecibo: "Recebemos a importância acima em pagamento de parcela(s).",
    reciboVias: 1 as const,
    autenticacao: true,
    estornoSoAdmin: true,
  };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    cliente: "",
    valor: 0,
    forma: "dinheiro",
    vias: params.reciboVias as 1 | 2,
    parcial: false,
  });

  const clientes = useMemo(() => {
    const names = new Set<string>();
    for (const c of state.contracts) names.add(c.compradorNome);
    for (const m of state.caixa) names.add(m.cliente);
    return [...names].filter(Boolean).sort();
  }, [state.contracts, state.caixa]);

  const isAdmin = /admin/i.test(perfilNome);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Caixa"
        description="H20 — recebimento, recibo, autenticação e estorno (admin)."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadExcel(
                  "caixa",
                  [
                    "Data",
                    "Cliente",
                    "Valor",
                    "Forma",
                    "Autenticação",
                    "Vias",
                    "Estornado",
                  ],
                  state.caixa.map((m) => [
                    m.data,
                    m.cliente,
                    m.valor,
                    m.forma,
                    m.autenticacao,
                    m.vias,
                    m.estornado ? "sim" : "não",
                  ])
                );
                notify("Excel exportado");
              }}
            >
              Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void printList(
                  "Caixa",
                  [
                    "Data",
                    "Cliente",
                    "Valor",
                    "Forma",
                    "Autenticação",
                    "Vias",
                    "Estornado",
                  ],
                  state.caixa.map((m) => [
                    m.data,
                    m.cliente,
                    m.valor,
                    m.forma,
                    m.autenticacao,
                    m.vias,
                    m.estornado ? "sim" : "não",
                  ]),
                  { filename: "caixa" }
                );
                notify("Impressão gerada");
              }}
            >
              Imprimir
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!window.confirm("Fechar o caixa com os movimentos abertos?"))
                  return;
                const f = fecharCaixa(currentUser?.nome ?? "Admin Demo");
                if (!f) {
                  notify("Nada a fechar — sem movimentos abertos");
                  return;
                }
                notify(
                  "Caixa fechado",
                  `${f.data} · ${formatBRL(f.saldoDepois)} · ${f.qtdMovimentos} mov.`
                );
              }}
            >
              Fechar caixa
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Receber
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Saldo do caixa", value: formatBRL(state.caixaSaldo) },
          { label: "Movimentos", value: String(state.caixa.length) },
          {
            label: "Abertos",
            value: String(
              state.caixa.filter((m) => !m.fechamentoId && !m.estornado).length
            ),
          },
          {
            label: "Fechamentos",
            value: String((state.caixaFechamentos ?? []).length),
          },
        ]}
      />
      <ProcessList
        storageKey="caixa-mov"
        exportName="caixa"
        rows={state.caixa}
        empty="Nenhum recebimento no caixa nesta sessão."
        bulkActions={
          params.estornoSoAdmin && !isAdmin
            ? undefined
            : [
                {
                  label: "Estornar abertos",
                  tone: "danger",
                  onClick: (ids) => {
                    let n = 0;
                    for (const id of ids) {
                      const m = state.caixa.find((x) => x.id === id);
                      if (!m || m.estornado || m.fechamentoId) continue;
                      if (estornarCaixa(id)) n += 1;
                    }
                    notify(n ? `${n} estorno(s)` : "Nenhum aberto");
                  },
                },
              ]
        }
        columns={[
          {
            key: "data",
            label: "Data",
            filter: { type: "period" },
            getValue: (m) => m.data,
          },
          {
            key: "cliente",
            label: "Cliente",
            filter: { type: "text" },
            getValue: (m) => m.cliente,
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (m) => m.valor,
            render: (m) => formatBRL(m.valor),
          },
          {
            key: "forma",
            label: "Forma",
            filter: { type: "text" },
            getValue: (m) => m.forma,
          },
          {
            key: "auth",
            label: "Autenticação",
            filter: { type: "text" },
            getValue: (m) => m.autenticacao,
            render: (m) =>
              m.estornado ? (
                <span className="text-destructive">ESTORNADO</span>
              ) : (
                m.autenticacao
              ),
          },
          {
            key: "fech",
            label: "Fechamento",
            filter: {
              type: "status",
              options: [
                { value: "aberto", label: "Aberto" },
                { value: "fechado", label: "Fechado" },
              ],
            },
            getValue: (m) => (m.fechamentoId ? "fechado" : "aberto"),
          },
          {
            key: "acao",
            label: "",
            getValue: () => "",
            render: (m) =>
              !m.estornado &&
              !m.fechamentoId &&
              (!params.estornoSoAdmin || isAdmin) ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!window.confirm("Estornar este recebimento?")) return;
                    if (!estornarCaixa(m.id)) {
                      notify("Não foi possível estornar");
                      return;
                    }
                    notify("Estorno registrado", m.autenticacao);
                  }}
                >
                  Estornar
                </Button>
              ) : (
                "—"
              ),
          },
        ]}
      />
      {(state.caixaFechamentos ?? []).length ? (
        <ModuleSection title="Histórico de fechamentos (H20)">
          <ProcessList
            storageKey="caixa-fech"
            exportName="fechamentos-caixa"
            rows={state.caixaFechamentos ?? []}
            columns={[
              {
                key: "data",
                label: "Data",
                filter: { type: "period" },
                getValue: (f) => f.data,
              },
              {
                key: "antes",
                label: "Saldo antes",
                filter: { type: "range" },
                getValue: (f) => f.saldoAntes,
                render: (f) => formatBRL(f.saldoAntes),
              },
              {
                key: "ent",
                label: "Entradas",
                filter: { type: "range" },
                getValue: (f) => f.entradas,
                render: (f) => formatBRL(f.entradas),
              },
              {
                key: "est",
                label: "Estornos",
                filter: { type: "range" },
                getValue: (f) => f.estornos,
                render: (f) => formatBRL(f.estornos),
              },
              {
                key: "depois",
                label: "Saldo depois",
                filter: { type: "range" },
                getValue: (f) => f.saldoDepois,
                render: (f) => formatBRL(f.saldoDepois),
              },
              {
                key: "qtd",
                label: "Mov.",
                filter: { type: "range" },
                getValue: (f) => f.qtdMovimentos,
              },
              {
                key: "quem",
                label: "Quem",
                filter: { type: "text" },
                getValue: (f) => f.quem,
              },
            ]}
          />
        </ModuleSection>
      ) : null}
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Recebimento no caixa"
        onSubmit={() => {
          if (!form.cliente || form.valor <= 0) {
            notify("Cliente e valor obrigatórios");
            return;
          }
          if (form.parcial && !params.pagamentoParcial) {
            notify("Pagamento parcial desabilitado nos parâmetros");
            return;
          }
          const mov = receberNoCaixa({
            cliente: form.cliente,
            valor: form.valor,
            forma: form.forma,
            vias: form.vias,
          });
          if (!mov) {
            notify("Falha ao registrar");
            return;
          }
          notify(
            "Recebido no caixa",
            `${mov.cliente} · ${formatBRL(mov.valor)} · ${mov.vias} via(s)`
          );
          notify("Recibo", params.textoRecibo);
          setOpen(false);
          setForm({
            cliente: "",
            valor: 0,
            forma: "dinheiro",
            vias: params.reciboVias,
            parcial: false,
          });
        }}
      >
        <Field label="Cliente *">
          <SearchSelect
            value={form.cliente}
            onChange={(cliente) => setForm({ ...form, cliente })}
            placeholder="Buscar cliente…"
            options={clientes.map((c) => ({ value: c, label: c }))}
          />
        </Field>
        <Field label="Valor *">
          <Input
            type="number"
            value={form.valor || ""}
            onChange={(e) =>
              setForm({ ...form, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Forma">
          <select
            className={fieldControlClass}
            value={form.forma}
            onChange={(e) => setForm({ ...form, forma: e.target.value })}
          >
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">Pix</option>
            <option value="transferencia">Transferência</option>
            <option value="boleto">Boleto</option>
          </select>
        </Field>
        <Field label="Vias do recibo">
          <select
            className={fieldControlClass}
            value={form.vias}
            onChange={(e) =>
              setForm({
                ...form,
                vias: Number(e.target.value) === 2 ? 2 : 1,
              })
            }
          >
            <option value={1}>1 via</option>
            <option value={2}>2 vias</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.parcial}
            onChange={(e) =>
              setForm({ ...form, parcial: e.target.checked })
            }
          />
          Pagamento parcial
        </label>
      </FormDialog>
    </div>
  );
}
