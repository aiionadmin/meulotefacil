"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFase1 } from "@/lib/store/fase1-store";

const STEPS = [
  "Lotes",
  "Comprador",
  "Promitentes",
  "Plano",
  "Comissão",
  "Finalizar",
] as const;

export default function NovaVendaPage() {
  const router = useRouter();
  const { state, addContract, changeLotStatus } = useCarteira();
  const { state: f1 } = useFase1();
  const [step, setStep] = useState(0);
  const [developmentId, setDevelopmentId] = useState(
    state.developments[0]?.id ?? ""
  );
  const [lotIds, setLotIds] = useState<string[]>([]);
  const [compradorId, setCompradorId] = useState("");
  const [compradorNome, setCompradorNome] = useState("");
  const [promitentes, setPromitentes] = useState<string[]>([]);
  const [promitenteDraft, setPromitenteDraft] = useState("");
  const [planId, setPlanId] = useState(state.paymentPlans[0]?.id ?? "");
  const [entradaPct, setEntradaPct] = useState(20);
  const [comissaoPct, setComissaoPct] = useState(3);
  const [corretor, setCorretor] = useState("Carla Corretora");
  const [recado, setRecado] = useState("");

  const disponiveis = useMemo(
    () =>
      state.lots.filter(
        (l) =>
          l.developmentId === developmentId &&
          l.status === "disponivel" &&
          !l.bloqueiaVenda
      ),
    [state.lots, developmentId]
  );

  const selectedLots = state.lots.filter((l) => lotIds.includes(l.id));
  const total = selectedLots.reduce((a, l) => a + l.valor, 0);
  const plan = state.paymentPlans.find((p) => p.id === planId);
  const compradores = f1.people.filter(
    (p) =>
      p.papeis.includes("comprador") ||
      p.papeis.includes("cliente") ||
      p.papeis.includes("pre_cadastro")
  );

  const toggleLot = (id: string) => {
    setLotIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const next = () => {
    if (step === 0 && lotIds.length === 0) {
      notify("Selecione ao menos um lote");
      return;
    }
    if (step === 1 && !compradorNome.trim()) {
      notify("Informe o comprador");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const finalizar = () => {
    const prestacoes = plan?.prestacoes ?? 60;
    const entrada = Math.round(total * (entradaPct / 100) * 100) / 100;
    const resto = total - entrada;
    const valorParcela =
      Math.round((resto / Math.max(1, prestacoes)) * 100) / 100;
    let ok = 0;
    for (const lot of selectedLots) {
      const ct = addContract({
        developmentId,
        lotId: lot.id,
        compradorNome:
          promitentes.length > 0
            ? `${compradorNome} (+${promitentes.length})`
            : compradorNome,
        preco: lot.valor,
        entrada: Math.round((lot.valor / total) * entrada * 100) / 100,
        qtdParcelas: prestacoes,
        valorParcela: Math.round((lot.valor / total) * valorParcela * 100) / 100,
      });
      if (ct) {
        changeLotStatus([lot.id], "vendido", `Venda ${ct.numero}`);
        ok += 1;
      }
    }
    if (!ok) {
      notify("Nenhum contrato gerado", "Verifique disponibilidade dos lotes");
      return;
    }
    notify(
      `${ok} contrato(s)`,
      `Comissão ${comissaoPct}% · ${corretor}${recado ? ` · ${recado}` : ""}`
    );
    router.push("/contratos");
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Nova venda"
        description="Etapas LoteWin: lotes → comprador → promitentes → plano → comissão → finalizar."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/vendas">Voltar</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <StatusPill key={label} tone={i === step ? "info" : i < step ? "ok" : "neutral"}>
            {i + 1}. {label}
          </StatusPill>
        ))}
      </div>

      {step === 0 ? (
        <ModuleSection title="Selecionar lote(s)">
          <Field label="Empreendimento">
            <select
              className={fieldControlClass}
              value={developmentId}
              onChange={(e) => {
                setDevelopmentId(e.target.value);
                setLotIds([]);
              }}
            >
              {state.developments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </Field>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {disponiveis.map((l) => {
              const on = lotIds.includes(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-left text-sm ${
                    on
                      ? "border-brand-orange bg-brand-orange/10"
                      : "border-border"
                  }`}
                  onClick={() => toggleLot(l.id)}
                >
                  <span className="font-medium">
                    {l.quadra}/{l.lote}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {formatBRL(l.valor)} · {l.area} m²
                  </span>
                </button>
              );
            })}
          </div>
          {disponiveis.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum lote disponível neste empreendimento.
            </p>
          ) : null}
        </ModuleSection>
      ) : null}

      {step === 1 ? (
        <ModuleSection title="Comprador">
          <Field label="Pessoa cadastrada">
            <select
              className={fieldControlClass}
              value={compradorId}
              onChange={(e) => {
                const id = e.target.value;
                setCompradorId(id);
                const p = compradores.find((x) => x.id === id);
                if (p) setCompradorNome(p.nome);
              }}
            >
              <option value="">— digitar nome —</option>
              {compradores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} · {p.documento}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nome do comprador *">
            <Input
              value={compradorNome}
              onChange={(e) => setCompradorNome(e.target.value)}
            />
          </Field>
          <Button size="sm" variant="outline" asChild>
            <Link href="/cadastros/pre-cadastro">Pré-cadastro</Link>
          </Button>
        </ModuleSection>
      ) : null}

      {step === 2 ? (
        <ModuleSection title="Demais promitentes">
          <Field label="Adicionar promitente">
            <div className="flex gap-2">
              <Input
                value={promitenteDraft}
                onChange={(e) => setPromitenteDraft(e.target.value)}
                placeholder="Nome"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (!promitenteDraft.trim()) return;
                  setPromitentes((p) => [...p, promitenteDraft.trim()]);
                  setPromitenteDraft("");
                }}
              >
                Incluir
              </Button>
            </div>
          </Field>
          <ul className="mt-2 space-y-1 text-sm">
            {promitentes.map((n, i) => (
              <li key={`${n}-${i}`} className="flex justify-between gap-2">
                <span>{n}</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setPromitentes((p) => p.filter((_, j) => j !== i))
                  }
                >
                  Remover
                </button>
              </li>
            ))}
            {promitentes.length === 0 ? (
              <li className="text-muted-foreground">Nenhum promitente extra.</li>
            ) : null}
          </ul>
        </ModuleSection>
      ) : null}

      {step === 3 ? (
        <ModuleSection title="Plano de pagamento">
          <Field label="Plano">
            <select
              className={fieldControlClass}
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
            >
              {state.paymentPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} · {p.prestacoes}x · {p.moedaRef}
                </option>
              ))}
            </select>
          </Field>
          <Field label="% entrada">
            <Input
              type="number"
              value={entradaPct}
              onChange={(e) => setEntradaPct(Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Recado / adicionais">
            <Input
              value={recado}
              onChange={(e) => setRecado(e.target.value)}
            />
          </Field>
        </ModuleSection>
      ) : null}

      {step === 4 ? (
        <ModuleSection title="Comissão">
          <Field label="Corretor">
            <Input
              value={corretor}
              onChange={(e) => setCorretor(e.target.value)}
            />
          </Field>
          <Field label="% comissão">
            <Input
              type="number"
              value={comissaoPct}
              onChange={(e) => setComissaoPct(Number(e.target.value) || 0)}
            />
          </Field>
          <p className="text-sm text-muted-foreground">
            Previsto: {formatBRL((total * comissaoPct) / 100)}
          </p>
        </ModuleSection>
      ) : null}

      {step === 5 ? (
        <ModuleSection title="Resumo">
          <p className="text-sm">
            {selectedLots.length} lote(s) · {formatBRL(total)}
          </p>
          <p className="text-sm">Comprador: {compradorNome}</p>
          {promitentes.length ? (
            <p className="text-sm">
              Promitentes: {promitentes.join(", ")}
            </p>
          ) : null}
          <p className="text-sm">
            Plano: {plan?.nome ?? "—"} · entrada {entradaPct}% · comissão{" "}
            {comissaoPct}% ({corretor})
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {selectedLots.map((l) => (
              <li key={l.id}>
                {l.empNome} {l.quadra}/{l.lote} · {formatBRL(l.valor)}
              </li>
            ))}
          </ul>
        </ModuleSection>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Voltar
        </Button>
        {step < STEPS.length - 1 ? (
          <Button size="sm" onClick={next}>
            Continuar
          </Button>
        ) : (
          <Button size="sm" onClick={finalizar}>
            Finalizar venda
          </Button>
        )}
      </div>
    </div>
  );
}
