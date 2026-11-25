"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { brl } from "@/lib/data/sistema";
import { useDemoStore, type Contrato } from "@/lib/store/demo-store";

const etapas = [
  "1. Selecionar lotes",
  "2. Comprador e promitentes",
  "3. Adicionais e recados",
  "4. Dados do lote",
  "5. Cópia de plano",
  "6. Plano de pagamento",
  "7. Comissão e finalização",
];

export default function VendasPage() {
  const { state, addContrato, updateContrato, updateLote, addPessoa } =
    useDemoStore();
  const [q, setQ] = useState("");
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Contrato | null>(null);
  const disponiveis = state.lotes.filter(
    (l) => l.status === "Disponível" && !l.bloqueiaVenda
  );
  const [form, setForm] = useState({
    loteId: disponiveis[0]?.id ?? "",
    comprador: "",
    corretor: "Ana Paula",
    entrada: 20000,
    parcelas: 120,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return state.contratos;
    return state.contratos.filter((c) =>
      [c.id, c.comprador, c.lote, c.status].join(" ").toLowerCase().includes(term)
    );
  }, [state.contratos, q]);

  const lote = state.lotes.find((l) => l.id === form.loteId);

  const finalizar = () => {
    if (!lote || !form.comprador.trim()) return;
    const valor = lote.valor;
    const saldo = Math.max(0, valor - Number(form.entrada));
    const contrato = addContrato({
      comprador: form.comprador.trim(),
      lote: `${lote.emp} ${lote.quadra}/${lote.lote}`,
      valor,
      status: "Aguardando assinatura",
      parcelas: `0/${form.parcelas}`,
      saldo,
      corretor: form.corretor,
    });
    updateLote(lote.id, { status: "Reservado", bloqueiaVenda: true });
    if (!state.pessoas.some((p) => p.nome === form.comprador.trim())) {
      addPessoa({
        nome: form.comprador.trim(),
        doc: "pendente",
        papeis: ["Comprador", "Cliente"],
        cidade: "Campinas",
        status: "Ativo",
        contato: "pendente",
      });
    }
    notify("Venda iniciada", contrato.id);
    setOpen(false);
    setStep(0);
    setForm({
      loteId: disponiveis.find((l) => l.id !== lote.id)?.id ?? "",
      comprador: "",
      corretor: "Ana Paula",
      entrada: 20000,
      parcelas: 120,
    });
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Vendas e contratos"
        description="Assistente em 7 etapas, planos em séries, reajuste, comissões e funil comercial."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setStep(0);
              setOpen(true);
            }}
            disabled={!disponiveis.length}
          >
            Iniciar venda
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Contratos", value: state.contratos.length },
          {
            label: "Ativos",
            value: state.contratos.filter((c) => c.status === "Ativo").length,
          },
          {
            label: "Aguardando",
            value: state.contratos.filter((c) =>
              c.status.includes("Aguardando")
            ).length,
          },
          { label: "Lotes disponíveis", value: disponiveis.length },
        ]}
      />

      <ModuleSection title="Assistente de venda">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {etapas.map((e, i) => (
            <Card
              key={e}
              className={
                open && step === i ? "border-brand-accent-strong" : undefined
              }
            >
              <CardContent className="py-4 text-sm font-medium text-ink">
                {e}
              </CardContent>
            </Card>
          ))}
        </div>
      </ModuleSection>

      <ModuleSection title="Contratos">
        <FilterBar value={q} onChange={setQ} placeholder="Buscar contrato…" />
        <DataTable
          onRowClick={(i) => setSelected(filtered[i])}
          columns={[
            { key: "id", label: "Contrato" },
            { key: "comprador", label: "Comprador" },
            { key: "lote", label: "Lote" },
            { key: "valor", label: "Valor" },
            { key: "parcelas", label: "Parcelas" },
            { key: "saldo", label: "Saldo" },
            { key: "corretor", label: "Corretor" },
            { key: "status", label: "Status" },
          ]}
          rows={filtered.map((c) => ({
            id: <span className="font-medium">{c.id}</span>,
            comprador: c.comprador,
            lote: c.lote,
            valor: brl(c.valor),
            parcelas: c.parcelas,
            saldo: brl(c.saldo),
            corretor: c.corretor,
            status: (
              <StatusPill
                tone={
                  c.status === "Ativo" || c.status === "Quitado"
                    ? "ok"
                    : c.status === "Renegociado"
                      ? "warn"
                      : "info"
                }
              >
                {c.status}
              </StatusPill>
            ),
          }))}
        />
      </ModuleSection>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={`Assistente de venda · etapa ${step + 1}/7`}
        submitLabel={step === 6 ? "Finalizar venda" : "Próxima etapa"}
        onSubmit={() => {
          if (step < 6) {
            if (step === 0 && !form.loteId) return;
            if (step === 1 && !form.comprador.trim()) return;
            setStep((s) => s + 1);
            return;
          }
          finalizar();
        }}
      >
        {step === 0 && (
          <Field label="Lote disponível">
            <select
              className={fieldControlClass}
              value={form.loteId}
              onChange={(e) => setForm({ ...form, loteId: e.target.value })}
            >
              {disponiveis.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.emp} {l.quadra}/{l.lote} · {brl(l.valor)}
                </option>
              ))}
            </select>
          </Field>
        )}
        {step === 1 && (
          <>
            <Field label="Comprador">
              <Input
                value={form.comprador}
                onChange={(e) =>
                  setForm({ ...form, comprador: e.target.value })
                }
                list="compradores-demo"
                required
              />
              <datalist id="compradores-demo">
                {state.pessoas
                  .filter((p) => p.papeis.includes("Comprador"))
                  .map((p) => (
                    <option key={p.id} value={p.nome} />
                  ))}
              </datalist>
            </Field>
            <Field label="Corretor">
              <Input
                value={form.corretor}
                onChange={(e) => setForm({ ...form, corretor: e.target.value })}
              />
            </Field>
          </>
        )}
        {step === 2 && (
          <p className="text-sm text-ink/80">
            Adicionais e recados podem ser registrados após a assinatura. Nesta
            demo, a etapa avança sem campos obrigatórios.
          </p>
        )}
        {step === 3 && lote && (
          <div className="space-y-2 text-sm">
            <DetailRow label="Empreendimento" value={lote.emp} />
            <DetailRow label="Quadra/Lote" value={`${lote.quadra}/${lote.lote}`} />
            <DetailRow label="Área" value={`${lote.area} m²`} />
            <DetailRow label="Valor" value={brl(lote.valor)} />
          </div>
        )}
        {step === 4 && (
          <p className="text-sm text-ink/80">
            Cópia de plano: será usado o plano padrão do empreendimento
            (série de prestações mensais).
          </p>
        )}
        {step === 5 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Entrada (R$)">
              <Input
                type="number"
                value={form.entrada}
                onChange={(e) =>
                  setForm({ ...form, entrada: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Nº de parcelas">
              <Input
                type="number"
                value={form.parcelas}
                onChange={(e) =>
                  setForm({ ...form, parcelas: Number(e.target.value) })
                }
              />
            </Field>
          </div>
        )}
        {step === 6 && lote && (
          <div className="space-y-2 text-sm">
            <p>
              Confirme a venda de <strong>{lote.emp} {lote.quadra}/{lote.lote}</strong>{" "}
              para <strong>{form.comprador}</strong>.
            </p>
            <DetailRow label="Valor" value={brl(lote.valor)} />
            <DetailRow label="Entrada" value={brl(form.entrada)} />
            <DetailRow
              label="Saldo"
              value={brl(Math.max(0, lote.valor - form.entrada))}
            />
            <DetailRow label="Parcelas" value={`${form.parcelas}x`} />
            <DetailRow label="Corretor" value={form.corretor} />
          </div>
        )}
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Voltar
          </Button>
        )}
      </FormDialog>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.id ?? "Contrato"}
        footer={
          selected && selected.status.includes("Aguardando") ? (
            <Button
              size="sm"
              onClick={() => {
                updateContrato(selected.id, { status: "Ativo" });
                setSelected({ ...selected, status: "Ativo" });
                notify("Contrato ativado", selected.id);
              }}
            >
              Confirmar assinatura
            </Button>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="Comprador" value={selected.comprador} />
            <DetailRow label="Lote" value={selected.lote} />
            <DetailRow label="Valor" value={brl(selected.valor)} />
            <DetailRow label="Parcelas" value={selected.parcelas} />
            <DetailRow label="Saldo" value={brl(selected.saldo)} />
            <DetailRow label="Corretor" value={selected.corretor} />
            <DetailRow label="Status" value={selected.status} />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}
