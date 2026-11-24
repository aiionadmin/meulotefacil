"use client";

import { useRef } from "react";
import {
  Handshake,
  FileCheck2,
  Wallet,
  Headphones,
  Map,
  ShieldCheck,
} from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { useCounter } from "@/components/motion/useCounter";

const items = [
  {
    icon: Wallet,
    title: "Parcelas acessíveis",
    text: "Condições pensadas para caber no orçamento familiar.",
    span: "sm:col-span-2",
  },
  {
    icon: FileCheck2,
    title: "Documentação em dia",
    text: "Processo transparente e regularizado.",
    span: "",
  },
  {
    icon: Map,
    title: "Lotes para construir",
    text: "Terrenos prontos para você projetar a casa dos sonhos.",
    span: "",
  },
  {
    icon: Headphones,
    title: "Atendimento humano",
    text: "Consultores reais acompanhando cada etapa.",
    span: "sm:col-span-2",
  },
  {
    icon: Handshake,
    title: "Reserva online",
    text: "Garanta seu lote com praticidade.",
    span: "",
  },
  {
    icon: ShieldCheck,
    title: "Sem letra miúda",
    text: "Clareza do primeiro contato à assinatura.",
    span: "",
  },
];

export function WhyUs() {
  const rootRef = useRef<HTMLElement>(null);
  const counterRef = useCounter<HTMLSpanElement>(1500, { suffix: "+" });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".bento-card").forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          }
        );

        const onMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty("--spot-x", `${x}px`);
          card.style.setProperty("--spot-y", `${y}px`);
        };
        card.addEventListener("mousemove", onMove);
      });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="bg-brand-navy py-20 text-brand-cream lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
              Por que Meu Lote Fácil
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-5xl">
              Mais do que um lote — um caminho claro
            </h2>
          </div>
          <p className="text-brand-cream/70">
            Mais de{" "}
            <span ref={counterRef} className="font-display text-3xl text-brand-orange">
              0
            </span>{" "}
            famílias já deram o primeiro passo conosco.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className={`bento-card relative overflow-hidden rounded-2xl border border-brand-cream/10 bg-brand-navy-deep p-6 ${item.span}`}
              style={{
                backgroundImage:
                  "radial-gradient(400px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(247,130,30,0.15), transparent 50%)",
              }}
            >
              <item.icon className="mb-4 h-6 w-6 text-brand-orange" />
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-brand-cream/65">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
