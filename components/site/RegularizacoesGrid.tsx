"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  nucleos,
  statusNucleoLabel,
  lotesLabel,
  type StatusNucleo,
} from "@/lib/data/nucleos";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const badgeVariant: Record<StatusNucleo, "default" | "warning" | "success"> = {
  concluido: "success",
  em_registro: "warning",
  em_andamento: "default",
};

/**
 * Portfólio — faixa paper-muted clara (contrasta com Método ink acima
 * e com Três pilares ink-deep abaixo). Cards editoriais no padrão 21st.
 */
export function RegularizacoesGrid({
  title = "Portfólio de regularizações",
  subtitle = "Núcleos concluídos, em registro e em andamento em Campinas e região.",
  limit,
  status,
  sectionNumber = "03",
}: {
  title?: string;
  subtitle?: string;
  limit?: number;
  status?: StatusNucleo | StatusNucleo[];
  sectionNumber?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  let list = nucleos;
  if (status) {
    const set = new Set(Array.isArray(status) ? status : [status]);
    list = list.filter((n) => set.has(n.status));
  }
  if (limit) list = list.slice(0, limit);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".reg-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            delay: i * 0.05,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          }
        );
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden border-b border-ink/10 bg-paper-muted text-ink"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(62,90,75,0.08),transparent_42%),radial-gradient(ellipse_at_10%_40%,rgba(237,134,0,0.06),transparent_40%)]"
      />

      <div className="site-container relative py-20 lg:py-28">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            number={sectionNumber}
            eyebrow="Núcleos"
            title={title}
            subtitle={subtitle}
          />
          {limit ? (
            <Link
              href="/regularizacao#nucleos"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/70 transition-colors hover:text-ink lg:pb-1"
            >
              Ver todas as regularizações
            </Link>
          ) : null}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {list.map((n) => (
            <Link
              key={n.id}
              href={`/regularizacoes/${n.slug}`}
              data-cursor="Ver"
              className="reg-card group relative flex flex-col overflow-hidden rounded-sm border border-ink/10 bg-card transition-colors duration-300 hover:border-ink/25"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={n.imagem}
                  alt={n.nome}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
                <Badge className="absolute left-4 top-4" variant={badgeVariant[n.status]}>
                  {statusNucleoLabel[n.status]}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
                <h3 className="font-display text-xl text-ink sm:text-2xl">{n.nome}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {n.cidade}/{n.estado} · {n.modalidade} · {n.tipo}
                </p>
                <p className="text-sm font-medium text-latossolo">
                  {lotesLabel(n)}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-ink/70 transition-colors group-hover:text-ink">
                  Ver detalhes
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
