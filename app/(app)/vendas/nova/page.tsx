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
import { Field, notify } from "@/components/app/ModuleToolkit";
import { SearchSelect } from "@/components/app/SearchSelect";
import { formatBRL } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFase1 } from "@/lib/store/fase1-store";

const STEPS = [
  "Lotes",
  "Comprador",
  "Promitentes",
  "Dados do lote",
  "Plano",
  "Comissão",
  "Finalizar",
] as const;

export default function NovaVendaPage() {
  const router = useRouter();
  const { state, addContract, changeLotStatus, addComissao } = useCarteira();
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
  const [copyFromContractId, setCopyFromContractId] = useState("");
  const [entradaPct, setEntradaPct] = useState(20);
  const [comissaoPct, setComissaoPct] = useState(3);
  const [corretor, setCorretor] = useState("Carla Corretora");
  const [recado, setRecado] = useState("");
  const [obsLote, setObsLote] = useState("");

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
  const corretores = f1.people.filter((p) => p.papeis.includes("corretor"));

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
    const numeros: string[] = [];
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
        numeros.push(ct.numero);
        ok += 1;
      }
    }
    if (!ok) {
      notify("Nenhum contrato gerado", "Verifique disponibilidade dos lotes");
      return;
    }
    const comissaoValor = Math.round(((total * comissaoPct) / 100) * 100) / 100;
    addComissao({
      corretorNome: corretor,
      vendaRef: numeros.join(", "),
      valorPrevisto: comissaoValor,
    });
    notify(
      `${ok} contrato(s)`,
      `Comissão ${comissaoPct}% · ${corretor}${recado ? ` · ${recado}` : ""}${
        obsLote ? ` · ${obsLote}` : ""
      }`
    );
    router.push("/contratos");
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Nova venda"
        description="H10 — multi-lote: lotes → comprador → promitentes → dados → plano → comissão → finalizar."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/vendas">Voltar</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <StatusPill
            key={label}
            tone={i === step ? "info" : i < step ? "ok" : "neutral"}
          >
            {i + 1}. {label}
          </StatusPill>
        ))}
      </div>

      {step === 0 ? (
        <ModuleSection title="Selecionar lote(s)">
          <Field label="Empreendimento">
            <SearchSelect
              value={developmentId}
              onChange={(id) => {
                setDevelopmentId(id);
                setLotIds([]);
              }}
              placeholder="Buscar empreendimento…"
              options={state.developments.map((d) => ({
                value: d.id,
                label: d.nome,
              }))}
            />
          </Field>
          <p className="mt-2 text-xs text-muted-foreground">
            {lotIds.length} selecionado(s) · {formatBRL(total)}
          </p>
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
            <SearchSelect
              value={compradorId}
              onChange={(id) => {
                setCompradorId(id);
                const p = compradores.find((x) => x.id === id);
                if (p) setCompradorNome(p.nome);
              }}
              placeholder="Buscar comprador…"
              options={compradores.map((p) => ({
                value: p.id,
                label: `${p.nome} · ${p.documento}`,
              }))}
            />
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
        <ModuleSection title="Dados do(s) lote(s)">
          <ul className="space-y-2 text-sm">
            {selectedLots.map((l) => (
              <li
                key={l.id}
                className="rounded-md border border-border px-3 py-2"
              >
                <div className="font-medium">
                  {l.empNome} · {l.quadra}/{l.lote}
                </div>
                <div className="text-xs text-muted-foreground">
                  Área {l.area} m² · {formatBRL(l.valor)} · m²{" "}
                  {formatBRL(l.valorM2)}
                  {l.matricula ? ` · matrícula ${l.matricula}` : ""}
                </div>
                {(l.frente || l.fundo || l.direita || l.esquerda) && (
                  <div className="text-xs text-muted-foreground">
                    Confrontações: F {l.frente ?? "—"} · Fd {l.fundo ?? "—"} · D{" "}
                    {l.direita ?? "—"} · E {l.esquerda ?? "—"}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Field label="Observações / recados do lote">
            <Input
              value={obsLote}
              onChange={(e) => setObsLote(e.target.value)}
              placeholder="Ex.: entrega de escritura em 90 dias"
            />
          </Field>
        </ModuleSection>
      ) : null}

      {step === 4 ? (
        <ModuleSection title="Plano de pagamento">
          <Field label="Copiar plano de contrato existente">
            <SearchSelect
              value={copyFromContractId}
              onChange={(id) => {
                setCopyFromContractId(id);
                const c = state.contracts.find((x) => x.id === id);
                if (!c) return;
                const match = state.paymentPlans.find(
                  (p) =>
                    p.developmentId === c.developmentId ||
                    p.nome.toLowerCase().includes(c.tipoReajuste.toLowerCase())
                );
                if (match) setPlanId(match.id);
                notify("Plano copiado", c.numero);
              }}
              placeholder="Buscar contrato modelo…"
              options={state.contracts.map((c) => ({
                value: c.id,
                label: `${c.numero} · ${c.compradorNome}`,
              }))}
            />
          </Field>
          <Field label="Plano">
            <SearchSelect
              value={planId}
              onChange={setPlanId}
              placeholder="Buscar plano…"
              options={state.paymentPlans.map((p) => ({
                value: p.id,
                label: `${p.nome} · ${p.prestacoes}x · ${p.moedaRef}`,
              }))}
            />
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

      {step === 5 ? (
        <ModuleSection title="Comissão">
          <Field label="Corretor">
            <SearchSelect
              value={
                corretores.find((c) => c.nome === corretor)?.id ?? ""
              }
              onChange={(id) => {
                const p = corretores.find((x) => x.id === id);
                if (p) setCorretor(p.nome);
              }}
              placeholder="Buscar corretor…"
              options={corretores.map((p) => ({
                value: p.id,
                label: p.nome,
              }))}
            />
          </Field>
          <Field label="Nome do corretor">
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

      {step === 6 ? (
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
          {obsLote ? (
            <p className="text-sm text-muted-foreground">Obs.: {obsLote}</p>
          ) : null}
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
