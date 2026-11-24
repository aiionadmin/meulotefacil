"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  buildWhatsAppSimulacaoUrl,
  simularParcelas,
} from "@/lib/simulador";
import { formatCurrency } from "@/lib/utils";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export function SimuladorWidget({ embedded = false }: { embedded?: boolean }) {
  const [valorLote, setValorLote] = useState(120000);
  const [entrada, setEntrada] = useState(12000);
  const [parcelas, setParcelas] = useState(120);
  const parcelaRef = useRef<HTMLSpanElement>(null);

  const resultado = useMemo(
    () => simularParcelas({ valorLote, entrada, parcelas }),
    [valorLote, entrada, parcelas]
  );

  useEffect(() => {
    const el = parcelaRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = formatCurrency(resultado.parcela);
      return;
    }
    const obj = { n: 0 };
    const current = Number(el.dataset.value || 0);
    obj.n = current;
    gsap.to(obj, {
      n: resultado.parcela,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = formatCurrency(obj.n);
      },
      onComplete: () => {
        el.dataset.value = String(resultado.parcela);
      },
    });
  }, [resultado.parcela]);

  const wa = buildWhatsAppSimulacaoUrl({
    ...resultado,
    valorLote,
    entrada,
    parcelas,
  });

  const body = (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Field
          label="Valor do lote"
          value={formatCurrency(valorLote)}
          min={50000}
          max={400000}
          step={5000}
          input={valorLote}
          onChange={(v) => {
            setValorLote(v);
            if (entrada > v) setEntrada(Math.round(v * 0.1));
          }}
        />
        <Field
          label="Entrada"
          value={formatCurrency(entrada)}
          min={0}
          max={valorLote}
          step={1000}
          input={entrada}
          onChange={setEntrada}
        />
        <Field
          label="Número de parcelas"
          value={`${parcelas}x`}
          min={12}
          max={180}
          step={6}
          input={parcelas}
          onChange={setParcelas}
        />
      </div>

      <div className="flex flex-col justify-between rounded-2xl bg-brand-navy p-6 text-brand-cream sm:p-8">
        <div>
          <p className="text-sm uppercase tracking-widest text-brand-orange">
            Parcela estimada
          </p>
          <p className="mt-3 font-display text-4xl sm:text-5xl">
            <span ref={parcelaRef} data-value="0">
              {formatCurrency(resultado.parcela)}
            </span>
          </p>
          <ul className="mt-6 space-y-2 text-sm text-brand-cream/70">
            <li>Saldo financiado: {formatCurrency(resultado.saldo)}</li>
            <li>Total estimado: {formatCurrency(resultado.totalPago)}</li>
            <li>Entrada: {resultado.entradaPercentual.toFixed(0)}% do valor</li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-brand-cream/50">
            Simulação ilustrativa sem valor de proposta. Taxa e condições reais
            sujeitas a análise. Consulte um consultor.
          </p>
        </div>
        <Button asChild size="lg" className="mt-8 w-full">
          <a href={wa} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Falar com consultor
          </a>
        </Button>
      </div>
    </div>
  );

  if (embedded) return body;

  return (
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            Simulador
          </p>
          <h2 className="font-display mt-3 text-3xl text-brand-navy sm:text-5xl">
            Quanto cabe no seu bolso?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ajuste os valores e veja a parcela em tempo real.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-brand-navy/8 bg-white p-6 shadow-sm sm:p-8">
          {body}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  min,
  max,
  step,
  input,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  input: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-brand-navy">{label}</span>
        <span className="font-semibold tabular-nums text-brand-orange">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={input}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-navy-100 accent-brand-orange"
      />
    </label>
  );
}
