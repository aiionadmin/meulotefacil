"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { empreendimentos } from "@/lib/data/empreendimentos";
import { formatCurrency } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const statusLabel = {
  lancamento: "Lançamento",
  ultimas_unidades: "Últimas unidades",
  esgotado: "Esgotado",
} as const;

export function EmpreendimentosGrid({
  title = "Empreendimentos",
  subtitle = "Escolha o lugar onde a sua próxima história começa.",
  limit,
}: {
  title?: string;
  subtitle?: string;
  limit?: number;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const list = limit ? empreendimentos.slice(0, limit) : empreendimentos;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".emp-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          }
        );
      });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="bg-brand-navy py-20 text-brand-cream lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            Onde construir
          </p>
          <h2 className="font-display mt-3 text-3xl sm:text-5xl">{title}</h2>
          <p className="mt-4 text-brand-cream/90">{subtitle}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((emp) => (
            <Link
              key={emp.id}
              href={`/empreendimentos/${emp.slug}`}
              data-cursor="Ver"
              className="emp-card group relative overflow-hidden rounded-2xl border border-transparent bg-brand-navy-deep transition-colors hover:border-brand-orange"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={emp.imagem}
                  alt={emp.nome}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent" />
                <Badge className="absolute left-4 top-4" variant="default">
                  {statusLabel[emp.status]}
                </Badge>
              </div>
              <div className="space-y-2 p-5">
                <h3 className="text-xl font-bold">{emp.nome}</h3>
                <p className="text-sm text-brand-cream/85">
                  {emp.cidade}/{emp.estado}
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-sm">
                  <span>
                    A partir de <strong>{emp.metragemDesde} m²</strong>
                  </span>
                  <span className="text-brand-orange">
                    Parcelas desde{" "}
                    <strong>{formatCurrency(emp.parcelaDesde)}</strong>
                  </span>
                </div>
              </div>
              <span className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-brand-orange opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        {limit && (
          <div className="mt-10 text-center">
            <Link
              href="/empreendimentos"
              className="inline-flex font-semibold text-brand-orange hover:underline"
            >
              Ver todos os empreendimentos
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
