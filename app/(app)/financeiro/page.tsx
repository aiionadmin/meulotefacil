"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { statusLabel } from "@/lib/status/labels";
import { useOperacoes } from "@/lib/store/operacoes-store";
import type { Payable, Receivable } from "@/lib/domain/operacoes-types";

export default function FinanceiroPage() {
  const {
    state,
    baixarPagar,
    baixarReceber,
    addPayable,
    transferir,
    aprovarPreEntry,
    recusarPreEntry,
  } = useOperacoes();
  const [q, setQ] = useState("");
  const [selectedP, setSelectedP] = useState<Payable | null>(null);
  const [selectedR, setSelectedR] = useState<Receivable | null>(null);
  const [openPay, setOpenPay] = useState(false);
  const [openTr, setOpenTr] = useState(false);
  const [payForm, setPayForm] = useState({
    favorecido: "",
    descricao: "",
    categoria: "Obra · material",
    centroCusto: "Residencial Horizonte",
    vencimento: new Date().toISOString().slice(0, 10),
    valor: 1000,
    contaId: state.accounts[0]?.id ?? "",
  });
  const [trForm, setTrForm] = useState({
    deContaId: state.accounts[0]?.id ?? "",
    paraContaId: state.accounts[1]?.id ?? "",
    valor: 1000,
    descricao: "Transferência",
  });

  const pagar = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.payables;
    return state.payables.filter((p) =>
      [p.favorecido, p.categoria, p.status, p.centroCusto, p.descricao]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.payables, q]);

  const receber = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.receivables;
    return state.receivables.filter((p) =>
      [p.cliente, p.descricao, p.status, p.origem]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [state.receivables, q]);

  const abertoPagar = state.payables
    .filter((p) => p.status !== "pago")
    .reduce((a, p) => a + p.valor, 0);
  const abertoReceber = state.receivables
    .filter((p) => p.status !== "recebido")
    .reduce((a, p) => a + p.valor, 0);
  const saldoContas = state.accounts.reduce((a, c) => a + c.saldo, 0);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Financeiro"
        description="a pagar, a receber, contas, transferências e pré-lançamentos."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setOpenTr(true)}>
              Transferir
            </Button>
            <Button size="sm" onClick={() => setOpenPay(true)}>
              Novo a pagar
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Saldo contas", value: formatBRL(saldoContas) },
          { label: "A pagar", value: formatBRL(abertoPagar) },
          { label: "A receber financeiro", value: formatBRL(abertoReceber) },
          {
            label: "Pré-lançamentos",
            value: state.preEntries.filter((p) => p.status === "pendente").length,
          },
        ]}
      />

      <ModuleSection title="Contas bancárias">
        <DataTable
          columns={[
            { key: "nome", label: "Conta" },
            { key: "banco", label: "Banco" },
            { key: "tipo", label: "Tipo" },
            { key: "saldo", label: "Saldo" },
            { key: "boleto", label: "Boleto" },
          ]}
          rows={state.accounts.map((a) => ({
            nome: a.nome,
            banco: a.banco,
            tipo: a.tipo,
            saldo: formatBRL(a.saldo),
            boleto: a.boleto ? "sim" : "não",
          }))}
        />
      </ModuleSection>

      <FilterBar value={q} onChange={setQ} placeholder="Buscar favorecido, cliente, categoria…" />

      <ModuleSection title="Contas a pagar">
        <DataTable
          columns={[
            { key: "fav", label: "Favorecido" },
            { key: "desc", label: "Descrição" },
            { key: "venc", label: "Vencimento" },
            { key: "valor", label: "Valor" },
            { key: "status", label: "Status" },
          ]}
          rows={pagar.map((p) => ({
            fav: (
              <button
                type="button"
                className="font-medium hover:text-brand-orange"
                onClick={() => setSelectedP(p)}
              >
                {p.favorecido}
              </button>
            ),
            desc: p.descricao,
            venc: formatDateBR(p.vencimento),
            valor: formatBRL(p.valor),
            status: (
              <StatusPill
                tone={
                  p.status === "pago"
                    ? "ok"
                    : p.status === "vencido"
                      ? "danger"
                      : "warn"
                }
              >
                {statusLabel(p.status)}
              </StatusPill>
            ),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Contas a receber">
        <DataTable
          columns={[
            { key: "cli", label: "Cliente" },
            { key: "origem", label: "Origem" },
            { key: "venc", label: "Vencimento" },
            { key: "valor", label: "Valor" },
            { key: "status", label: "Status" },
          ]}
          rows={receber.map((r) => ({
            cli: (
              <button
                type="button"
                className="font-medium hover:text-brand-orange"
                onClick={() => setSelectedR(r)}
              >
                {r.cliente}
              </button>
            ),
            origem: r.origem === "contrato" ? `Contrato ${r.contratoRef}` : "Faturamento",
            venc: formatDateBR(r.vencimento),
            valor: formatBRL(r.valor),
            status: (
              <StatusPill
                tone={
                  r.status === "recebido"
                    ? "ok"
                    : r.status === "vencido"
                      ? "danger"
                      : "warn"
                }
              >
                {statusLabel(r.status)}
              </StatusPill>
            ),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Pré-lançamentos">
        <DataTable
          columns={[
            { key: "desc", label: "Descrição" },
            { key: "valor", label: "Valor" },
            { key: "centro", label: "Centro" },
            { key: "status", label: "Status" },
            { key: "acao", label: "" },
          ]}
          rows={state.preEntries.map((p) => ({
            desc: p.descricao,
            valor: formatBRL(p.valor),
            centro: p.centroCusto,
            status: <StatusPill tone="info">{p.status}</StatusPill>,
            acao:
              p.status === "pendente" ? (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      aprovarPreEntry(p.id);
                      notify("Pré-lançamento aprovado → a pagar");
                    }}
                  >
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      recusarPreEntry(p.id);
                      notify("Recusado");
                    }}
                  >
                    Recusar
                  </Button>
                </div>
              ) : (
                "—"
              ),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Transferências">
        <DataTable
          columns={[
            { key: "data", label: "Data" },
            { key: "de", label: "De" },
            { key: "para", label: "Para" },
            { key: "valor", label: "Valor" },
            { key: "desc", label: "Descrição" },
          ]}
          rows={state.transfers.map((t) => ({
            data: formatDateBR(t.data),
            de: state.accounts.find((a) => a.id === t.deContaId)?.nome ?? t.deContaId,
            para:
              state.accounts.find((a) => a.id === t.paraContaId)?.nome ??
              t.paraContaId,
            valor: formatBRL(t.valor),
            desc: t.descricao,
          }))}
        />
      </ModuleSection>

      <DetailSheet
        open={!!selectedP}
        onOpenChange={(o) => !o && setSelectedP(null)}
        title={selectedP?.favorecido ?? ""}
      >
        {selectedP ? (
          <div className="space-y-2">
            <DetailRow label="Descrição" value={selectedP.descricao} />
            <DetailRow label="Categoria" value={selectedP.categoria} />
            <DetailRow label="Centro" value={selectedP.centroCusto} />
            <DetailRow label="Valor" value={formatBRL(selectedP.valor)} />
            {selectedP.status !== "pago" ? (
              <Button
                size="sm"
                className="mt-3"
                onClick={() => {
                  baixarPagar(selectedP.id);
                  notify("Pago");
                  setSelectedP(null);
                }}
              >
                Pagar
              </Button>
            ) : null}
          </div>
        ) : null}
      </DetailSheet>

      <DetailSheet
        open={!!selectedR}
        onOpenChange={(o) => !o && setSelectedR(null)}
        title={selectedR?.cliente ?? ""}
      >
        {selectedR ? (
          <div className="space-y-2">
            <DetailRow label="Descrição" value={selectedR.descricao} />
            <DetailRow label="Origem" value={selectedR.origem} />
            <DetailRow label="Valor" value={formatBRL(selectedR.valor)} />
            {selectedR.status !== "recebido" ? (
              <Button
                size="sm"
                className="mt-3"
                onClick={() => {
                  baixarReceber(selectedR.id);
                  notify("Recebido");
                  setSelectedR(null);
                }}
              >
                Receber
              </Button>
            ) : null}
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={openPay}
        onOpenChange={setOpenPay}
        title="Novo lançamento a pagar"
        onSubmit={() => {
          if (!payForm.favorecido) {
            notify("Informe o favorecido");
            return;
          }
          addPayable(payForm);
          notify("Lançamento criado");
          setOpenPay(false);
        }}
      >
        <Field label="Favorecido *">
          <Input
            value={payForm.favorecido}
            onChange={(e) =>
              setPayForm({ ...payForm, favorecido: e.target.value })
            }
          />
        </Field>
        <Field label="Descrição">
          <Input
            value={payForm.descricao}
            onChange={(e) =>
              setPayForm({ ...payForm, descricao: e.target.value })
            }
          />
        </Field>
        <Field label="Valor">
          <Input
            type="number"
            value={payForm.valor}
            onChange={(e) =>
              setPayForm({ ...payForm, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Conta">
          <select
            className={fieldControlClass}
            value={payForm.contaId}
            onChange={(e) =>
              setPayForm({ ...payForm, contaId: e.target.value })
            }
          >
            {state.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </Field>
      </FormDialog>

      <FormDialog
        open={openTr}
        onOpenChange={setOpenTr}
        title="Transferência entre contas"
        onSubmit={() => {
          const ok = transferir(trForm);
          notify(ok ? "Transferência feita" : "Saldo insuficiente ou contas iguais");
          if (ok) setOpenTr(false);
        }}
      >
        <Field label="De">
          <select
            className={fieldControlClass}
            value={trForm.deContaId}
            onChange={(e) =>
              setTrForm({ ...trForm, deContaId: e.target.value })
            }
          >
            {state.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome} ({formatBRL(a.saldo)})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Para">
          <select
            className={fieldControlClass}
            value={trForm.paraContaId}
            onChange={(e) =>
              setTrForm({ ...trForm, paraContaId: e.target.value })
            }
          >
            {state.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Valor">
          <Input
            type="number"
            value={trForm.valor}
            onChange={(e) =>
              setTrForm({ ...trForm, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}
