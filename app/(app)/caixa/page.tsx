"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  DataTable,
  KpiGrid,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
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
              onClick={() => printList("Caixa")}
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
      <DataTable
        columns={[
          { key: "data", label: "Data" },
          { key: "cliente", label: "Cliente" },
          { key: "valor", label: "Valor" },
          { key: "forma", label: "Forma" },
          { key: "auth", label: "Autenticação" },
          { key: "fech", label: "Fechamento" },
          { key: "acao", label: "" },
        ]}
        rows={state.caixa.map((m) => ({
          data: m.data,
          cliente: m.cliente,
          valor: formatBRL(m.valor),
          forma: m.forma,
          auth: m.estornado ? (
            <span className="text-destructive">ESTORNADO</span>
          ) : (
            m.autenticacao
          ),
          fech: m.fechamentoId ? "fechado" : "aberto",
          acao:
            !m.estornado &&
            !m.fechamentoId &&
            (!params.estornoSoAdmin || isAdmin) ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
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
        }))}
        empty="Nenhum recebimento no caixa nesta sessão."
      />
      {(state.caixaFechamentos ?? []).length ? (
        <ModuleSection title="Histórico de fechamentos (H20)">
          <DataTable
            columns={[
              { key: "data", label: "Data" },
              { key: "antes", label: "Saldo antes" },
              { key: "ent", label: "Entradas" },
              { key: "est", label: "Estornos" },
              { key: "depois", label: "Saldo depois" },
              { key: "qtd", label: "Mov." },
              { key: "quem", label: "Quem" },
            ]}
            rows={(state.caixaFechamentos ?? []).map((f) => ({
              data: f.data,
              antes: formatBRL(f.saldoAntes),
              ent: formatBRL(f.entradas),
              est: formatBRL(f.estornos),
              depois: formatBRL(f.saldoDepois),
              qtd: String(f.qtdMovimentos),
              quem: f.quem,
            }))}
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
