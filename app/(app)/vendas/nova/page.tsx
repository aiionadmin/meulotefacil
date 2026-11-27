"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import { Field, fieldControlClass, notify } from "@/components/app/ModuleToolkit";
import { SearchSelect } from "@/components/app/SearchSelect";
import {
  FORMAS_PAGAMENTO_VENDA,
  labelFormaPagamentoVenda,
  validatePermutaDescricao,
  type FormaPagamentoVenda,
} from "@/lib/domain/venda-pagamento";
import { formatBRL } from "@/lib/masks/br";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { useSystemSettings } from "@/lib/store/system-settings-store";

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
  const {
    state,
    addContract,
    changeLotStatus,
    addComissao,
    lockLotForSale,
    unlockLotForSale,
    unlockLotsForSale,
  } = useCarteira();
  const { state: f1, currentUser } = useFase1();
  const { indicePadrao } = useSystemSettings();
  const vendedor = {
    userId: currentUser?.id ?? "u-anon",
    nome: currentUser?.nome ?? "Usuário",
  };

  const [step, setStep] = useState(0);
  const [developmentId, setDevelopmentId] = useState(
    state.developments[0]?.id ?? ""
  );
  const [lotIds, setLotIds] = useState<string[]>([]);
  const [compradorId, setCompradorId] = useState("");
  const [compradorNome, setCompradorNome] = useState("");
  const [promitentes, setPromitentes] = useState<string[]>([]);
  const [promitenteDraft, setPromitenteDraft] = useState("");
  const [planId, setPlanId] = useState("");
  const [copyFromContractId, setCopyFromContractId] = useState("");
  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamentoVenda>("plano");
  const [permutaDescricao, setPermutaDescricao] = useState("");
  const [entradaPct, setEntradaPct] = useState(20);
  const [comissaoPct, setComissaoPct] = useState(3);
  const [corretor, setCorretor] = useState("Carla Corretora");
  const [recado, setRecado] = useState("");
  const [obsLote, setObsLote] = useState("");
  const precisaPlano = formaPagamento === "plano";
  const lotIdsRef = useRef<string[]>([]);
  lotIdsRef.current = lotIds;
  const unlockRef = useRef(unlockLotsForSale);
  unlockRef.current = unlockLotsForSale;

  const planosAtivos = useMemo(
    () =>
      state.paymentPlans.filter(
        (p) =>
          p.ativo &&
          (!p.developmentId || p.developmentId === developmentId)
      ),
    [state.paymentPlans, developmentId]
  );

  const plan = state.paymentPlans.find((p) => p.id === planId);

  // Liberar travas ao sair da página sem finalizar
  useEffect(() => {
    return () => {
      const ids = lotIdsRef.current;
      if (ids.length) unlockRef.current(ids);
    };
  }, []);

  const disponiveis = useMemo(
    () =>
      state.lots.filter((l) => {
        if (l.developmentId !== developmentId) return false;
        if (lotIds.includes(l.id)) return true;
        if (l.status === "disponivel" && !l.bloqueiaVenda) return true;
        if (
          l.vendaEmAndamento &&
          l.vendedorUserId === vendedor.userId &&
          l.status === "reservado"
        ) {
          return true;
        }
        return false;
      }),
    [state.lots, developmentId, lotIds, vendedor.userId]
  );

  const selectedLots = state.lots.filter((l) => lotIds.includes(l.id));
  const total = selectedLots.reduce((a, l) => a + l.valor, 0);
  const compradores = f1.people.filter(
    (p) =>
      p.papeis.includes("comprador") ||
      p.papeis.includes("cliente") ||
      p.papeis.includes("pre_cadastro")
  );
  const corretores = f1.people.filter((p) => p.papeis.includes("corretor"));

  const toggleLot = (id: string) => {
    if (lotIds.includes(id)) {
      unlockLotForSale(id);
      setLotIds((prev) => prev.filter((x) => x !== id));
      return;
    }
    const res = lockLotForSale(id, vendedor);
    if (!res.ok) {
      notify("Lote indisponível", res.reason ?? "");
      return;
    }
    setLotIds((prev) => [...prev, id]);
    notify("Lote travado", `Vendedor: ${vendedor.nome}`);
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
    if (step === 4) {
      const permutaErr = validatePermutaDescricao(
        formaPagamento,
        permutaDescricao
      );
      if (permutaErr) {
        notify("Permuta", permutaErr);
        return;
      }
      if (precisaPlano) {
        if (!planId || !plan) {
          notify(
            "Plano de pagamento obrigatório",
            "Cadastre/selecione um plano ativo antes de continuar"
          );
          return;
        }
        if (!plan.ativo) {
          notify("Plano inativo", "Escolha um plano ativo");
          return;
        }
      }
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const finalizar = () => {
    const permutaErr = validatePermutaDescricao(
      formaPagamento,
      permutaDescricao
    );
    if (permutaErr) {
      notify("Permuta", permutaErr);
      setStep(4);
      return;
    }
    if (precisaPlano && (!planId || !plan?.ativo)) {
      notify(
        "Plano de pagamento obrigatório",
        "Não é possível gerar venda sem plano cadastrado/ativo"
      );
      setStep(4);
      return;
    }
    if (lotIds.length === 0) {
      notify("Selecione ao menos um lote");
      return;
    }
    const isPermuta = formaPagamento === "permuta";
    const prestacoes = isPermuta ? 0 : plan?.prestacoes ?? 0;
    const entrada = isPermuta
      ? 0
      : Math.round(total * (entradaPct / 100) * 100) / 100;
    const resto = total - entrada;
    const valorParcela =
      prestacoes > 0
        ? Math.round((resto / Math.max(1, prestacoes)) * 100) / 100
        : 0;
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
        entrada: isPermuta
          ? 0
          : Math.round((lot.valor / total) * entrada * 100) / 100,
        qtdParcelas: prestacoes,
        valorParcela: isPermuta
          ? 0
          : Math.round((lot.valor / total) * valorParcela * 100) / 100,
        formaPagamento,
        permutaDescricao: isPermuta ? permutaDescricao.trim() : undefined,
        paymentPlanId: planId || undefined,
        tipoReajuste: indicePadrao,
      });
      if (ct) {
        changeLotStatus(
          [lot.id],
          "vendido",
          isPermuta ? `Permuta ${ct.numero}` : `Venda ${ct.numero}`
        );
        numeros.push(ct.numero);
        ok += 1;
      }
    }
    if (!ok) {
      notify(
        "Nenhum contrato gerado",
        formaPagamento === "permuta"
          ? "Informe a descrição da permuta e verifique os lotes"
          : "Verifique disponibilidade dos lotes"
      );
      return;
    }
    // limpa lista local para o unmount não “destravar” lotes já vendidos
    setLotIds([]);
    const comissaoValor = Math.round(((total * comissaoPct) / 100) * 100) / 100;
    addComissao({
      corretorNome: corretor,
      vendaRef: numeros.join(", "),
      valorPrevisto: comissaoValor,
    });
    notify(
      `${ok} contrato(s)`,
      `Vendedor ${vendedor.nome} · ${labelFormaPagamentoVenda(formaPagamento)}${
        plan ? ` · plano ${plan.nome}` : ""
      } · comissão ${comissaoPct}%`
    );
    router.push("/contratos");
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Nova venda"
        description="Lote travado ao selecionar. Forma de pagamento (inclui Permuta com descrição obrigatória). Plano obrigatório quando a forma for plano."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/vendas">Voltar</Link>
          </Button>
        }
      />

      <div className="rounded-sm border border-linha bg-paper-muted/40 px-3 py-2 text-sm">
        Vendendo como: <strong>{vendedor.nome}</strong>
        {planosAtivos.length === 0 ? (
          <span className="ml-2 text-amber-800">
            · Sem plano ativo neste empreendimento —{" "}
            <Link className="underline" href="/planos-pagamento">
              cadastrar plano
            </Link>
          </span>
        ) : null}
      </div>

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
                unlockLotsForSale(lotIds);
                setLotIds([]);
                setDevelopmentId(id);
                setPlanId("");
              }}
              placeholder="Buscar empreendimento…"
              options={state.developments.map((d) => ({
                value: d.id,
                label: d.nome,
              }))}
            />
          </Field>
          <p className="mt-2 text-xs text-muted-foreground">
            {lotIds.length} selecionado(s) · {formatBRL(total)} · clique trava o
            lote para você
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {disponiveis.map((l) => {
              const on = lotIds.includes(l.id);
              const travaOutro =
                l.vendaEmAndamento &&
                l.vendedorUserId &&
                l.vendedorUserId !== vendedor.userId;
              return (
                <button
                  key={l.id}
                  type="button"
                  disabled={!!travaOutro}
                  className={`rounded-md border px-3 py-2 text-left text-sm ${
                    on
                      ? "border-brand-orange bg-brand-orange/10"
                      : "border-border"
                  } ${travaOutro ? "opacity-50" : ""}`}
                  onClick={() => toggleLot(l.id)}
                >
                  <span className="font-medium">
                    {l.quadra}/{l.lote}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {formatBRL(l.valor)} · {l.area} m²
                  </span>
                  {on || l.vendaEmAndamento ? (
                    <div className="mt-1 text-xs text-amber-800">
                      Travado · {l.vendedorNome ?? vendedor.nome}
                    </div>
                  ) : null}
                  {travaOutro ? (
                    <div className="mt-1 text-xs text-destructive">
                      Em venda por {l.vendedorNome}
                    </div>
                  ) : null}
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
                label: p.nome,
              }))}
            />
          </Field>
          <Field label="Nome do comprador">
            <Input
              value={compradorNome}
              onChange={(e) => setCompradorNome(e.target.value)}
            />
          </Field>
        </ModuleSection>
      ) : null}

      {step === 2 ? (
        <ModuleSection title="Promitentes">
          <div className="flex gap-2">
            <Input
              value={promitenteDraft}
              onChange={(e) => setPromitenteDraft(e.target.value)}
              placeholder="Nome do promitente"
            />
            <Button
              size="sm"
              type="button"
              onClick={() => {
                if (!promitenteDraft.trim()) return;
                setPromitentes((p) => [...p, promitenteDraft.trim()]);
                setPromitenteDraft("");
              }}
            >
              Adicionar
            </Button>
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {promitentes.map((p) => (
              <li key={p} className="flex justify-between">
                {p}
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={() =>
                    setPromitentes((list) => list.filter((x) => x !== p))
                  }
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </ModuleSection>
      ) : null}

      {step === 3 ? (
        <ModuleSection title="Dados do lote">
          <ul className="space-y-2 text-sm">
            {selectedLots.map((l) => (
              <li key={l.id} className="rounded-md border border-border p-2">
                <div className="font-medium">
                  {l.empNome} · {l.quadra}/{l.lote}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatBRL(l.valor)} · {l.area} m² · travado por{" "}
                  {l.vendedorNome ?? vendedor.nome}
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
        <ModuleSection title="Forma e plano de pagamento">
          <Field label="Forma de pagamento *">
            <select
              className={fieldControlClass}
              value={formaPagamento}
              onChange={(e) =>
                setFormaPagamento(e.target.value as FormaPagamentoVenda)
              }
            >
              {FORMAS_PAGAMENTO_VENDA.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>
          {formaPagamento === "permuta" ? (
            <Field label="Como foi a permuta *">
              <textarea
                className={fieldControlClass + " min-h-[88px]"}
                value={permutaDescricao}
                onChange={(e) => setPermutaDescricao(e.target.value)}
                placeholder="Descreva o bem/serviço entregue, valores, partes e condições da permuta"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Obrigatório para forma Permuta. Sem descrição a venda não
                finaliza.
              </p>
            </Field>
          ) : null}
          {precisaPlano && planosAtivos.length === 0 ? (
            <p className="mb-3 text-sm text-amber-800">
              Não há plano ativo para este empreendimento.{" "}
              <Link className="underline" href="/planos-pagamento">
                Cadastre um plano
              </Link>{" "}
              antes de gerar a venda.
            </p>
          ) : null}
          {precisaPlano ? (
            <>
              <Field label="Copiar plano de contrato existente">
                <SearchSelect
                  value={copyFromContractId}
                  onChange={(id) => {
                    setCopyFromContractId(id);
                    const c = state.contracts.find((x) => x.id === id);
                    if (!c) return;
                    const match = planosAtivos.find(
                      (p) =>
                        p.developmentId === c.developmentId ||
                        p.nome
                          .toLowerCase()
                          .includes(c.tipoReajuste.toLowerCase())
                    );
                    if (match) setPlanId(match.id);
                    if (c.formaPagamento === "permuta" && c.permutaDescricao) {
                      setFormaPagamento("permuta");
                      setPermutaDescricao(c.permutaDescricao);
                    }
                    notify("Plano copiado", c.numero);
                  }}
                  placeholder="Buscar contrato modelo…"
                  options={state.contracts.map((c) => ({
                    value: c.id,
                    label: `${c.numero} · ${c.compradorNome}`,
                  }))}
                />
              </Field>
              <Field label="Plano *">
                <SearchSelect
                  value={planId}
                  onChange={setPlanId}
                  placeholder="Buscar plano ativo…"
                  options={planosAtivos.map((p) => ({
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
            </>
          ) : null}
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
              value={corretores.find((c) => c.nome === corretor)?.id ?? ""}
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
            Vendedor: <strong>{vendedor.nome}</strong>
          </p>
          <p className="text-sm">
            {selectedLots.length} lote(s) · {formatBRL(total)}
          </p>
          <p className="text-sm">Comprador: {compradorNome}</p>
          {promitentes.length ? (
            <p className="text-sm">Promitentes: {promitentes.join(", ")}</p>
          ) : null}
          <p className="text-sm">
            Forma:{" "}
            <strong>{labelFormaPagamentoVenda(formaPagamento)}</strong>
            {precisaPlano
              ? ` · plano ${plan?.nome ?? "— (obrigatório)"} · entrada ${entradaPct}%`
              : ""}
            {" · "}
            comissão {comissaoPct}% ({corretor})
          </p>
          {formaPagamento === "permuta" && permutaDescricao.trim() ? (
            <p className="text-sm text-muted-foreground">
              Permuta: {permutaDescricao.trim()}
            </p>
          ) : null}
          {obsLote ? (
            <p className="text-sm text-muted-foreground">Obs.: {obsLote}</p>
          ) : null}
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {selectedLots.map((l) => (
              <li key={l.id}>
                {l.empNome} {l.quadra}/{l.lote} · {formatBRL(l.valor)} · travado
                por {l.vendedorNome ?? vendedor.nome}
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
          <Button
            size="sm"
            onClick={finalizar}
            disabled={
              (precisaPlano && (!planId || !plan)) ||
              (formaPagamento === "permuta" && !permutaDescricao.trim())
            }
          >
            Finalizar venda
          </Button>
        )}
        {lotIds.length ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              unlockLotsForSale(lotIds);
              setLotIds([]);
              notify("Travas liberadas");
            }}
          >
            Liberar lotes
          </Button>
        ) : null}
      </div>
    </div>
  );
}
