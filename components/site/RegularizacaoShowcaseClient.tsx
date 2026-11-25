"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  statusNucleoLabel,
  nucleoExtensaoLabel,
  type Nucleo,
  type StatusNucleo,
} from "@/lib/data/nucleos";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const badgeVariant: Record<StatusNucleo, "default" | "warning" | "success"> = {
  concluido: "success",
  em_registro: "warning",
  em_andamento: "default",
};

function NucleoFicha({
  n,
  showCrf,
}: {
  n: Nucleo;
  showCrf: boolean;
}) {
  return (
    <article
      id={n.slug}
      className="showcase-card group relative scroll-mt-24 overflow-hidden rounded-sm border border-paper/12 bg-paper/[0.04] transition-colors duration-300 hover:border-paper/25 hover:bg-paper/[0.07]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-latossolo/12 via-transparent to-mata/10"
      />
      <div className="relative grid gap-0 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)]">
        <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[220px]">
          <Image
            src={n.imagem}
            alt={`Núcleo Residencial ${n.nome}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/15 to-transparent md:bg-gradient-to-r md:from-transparent md:to-ink/25" />
          <Badge className="absolute left-4 top-4" variant={badgeVariant[n.status]}>
            {statusNucleoLabel[n.status]}
          </Badge>
        </div>

        <div className="relative flex flex-col p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-label text-[11px] uppercase tracking-[0.12em] text-paper/50">
              {n.cidade} — {n.estado}
            </span>
            <span className="text-paper/25" aria-hidden>
              ·
            </span>
            <span className="font-mono-label text-[11px] text-latossolo">
              {n.modalidade}
            </span>
          </div>

          <h3 className="font-display mt-3 text-2xl text-paper sm:text-[1.75rem]">
            <Link
              href={`/regularizacoes/${n.slug}`}
              className="inline-flex items-start gap-2 transition-colors hover:text-latossolo"
            >
              <span>Núcleo Residencial {n.nome}</span>
              <ArrowUpRight
                className="mt-1 size-5 shrink-0 text-paper/40 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </Link>
          </h3>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-paper/45">Tipo</dt>
              <dd className="mt-0.5 font-medium text-paper/90">{n.tipo}</dd>
            </div>
            <div>
              <dt className="text-paper/45">Extensão</dt>
              <dd className="mt-0.5 font-medium text-paper/90">
                {nucleoExtensaoLabel(n)}
              </dd>
            </div>
          </dl>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper/70">
            {n.resumo ??
              `${n.modalidade} · ${n.tipo} · ${nucleoExtensaoLabel(n)}${
                n.faseLabel ? `. ${n.faseLabel}.` : "."
              }`}
          </p>

          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            <Button
              asChild
              size="sm"
              className="border-paper/30 bg-paper text-ink hover:bg-latossolo hover:text-ink"
            >
              <Link href={`/regularizacoes/${n.slug}`}>Ver detalhes</Link>
            </Button>
            {showCrf && n.crfPdf ? (
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="text-paper/75 hover:bg-paper/10 hover:text-paper"
              >
                <a href={n.crfPdf} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  Baixar CRF
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function RegularizacaoShowcaseClient({
  byCity,
  crfAvailable,
}: {
  byCity: [string, Nucleo[]][];
  crfAvailable: Record<string, boolean>;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".showcase-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: (i % 4) * 0.05,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 90%" },
          }
        );
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      id="nucleos"
      ref={rootRef}
      className="relative scroll-mt-24 overflow-hidden border-b border-ink/30 bg-ink text-paper"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(237,134,0,0.14),transparent_48%),radial-gradient(ellipse_at_90%_50%,rgba(62,90,75,0.35),transparent_45%)]"
      />

      <div className="site-container relative py-20 lg:py-28">
        <SectionHeading
          number="03"
          eyebrow="Portfólio"
          title="Regularizações concluídas e em registro"
          subtitle="Informações oficiais de CRF, Diário Oficial e matrícula — o mesmo nível de detalhe do portfólio institucional."
          dark
        />

        <div className="mt-12 space-y-12">
          {byCity.map(([cidade, items]) => (
            <div key={cidade}>
              <div className="mb-4 flex items-baseline gap-3">
                <h3 className="font-display text-lg text-paper">{cidade}</h3>
                <span className="font-mono-label text-[11px] text-paper/45">
                  SP · {items.length}{" "}
                  {items.length === 1 ? "núcleo" : "núcleos"}
                </span>
              </div>
              <div className="grid gap-4">
                {items.map((n) => (
                  <NucleoFicha
                    key={n.id}
                    n={n}
                    showCrf={Boolean(crfAvailable[n.id])}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
