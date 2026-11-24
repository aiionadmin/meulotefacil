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
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
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
    <section ref={rootRef} className="bg-brand-navy py-20 text-brand-cream lg:py-28">
      <div className="site-container">
        <SectionHeading
          number={sectionNumber}
          eyebrow="Núcleos"
          title={title}
          subtitle={subtitle}
          dark
        />

        <div className="mt-12 grid gap-0 border border-brand-cream/15 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((n) => (
            <Link
              key={n.id}
              href={`/regularizacoes/${n.slug}`}
              data-cursor="Ver"
              className="reg-card group relative overflow-hidden border-b border-r border-brand-cream/15 bg-brand-navy-deep transition-colors hover:bg-brand-navy"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={n.imagem}
                  alt={n.nome}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent" />
                <Badge className="absolute left-4 top-4" variant={badgeVariant[n.status]}>
                  {statusNucleoLabel[n.status]}
                </Badge>
              </div>
              <div className="space-y-2 p-5">
                <h3 className="text-xl font-bold">{n.nome}</h3>
                <p className="text-sm text-brand-cream/85">
                  {n.cidade}/{n.estado}, {n.modalidade}, {n.tipo}
                </p>
                <p className="text-sm font-medium text-orange-300">
                  <strong>{lotesLabel(n)}</strong>
                </p>
                <p className="pt-1 text-sm font-medium text-brand-cream/90 transition-colors group-hover:text-orange-300">
                  Ver detalhes →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {limit && (
          <div className="mt-10 text-center">
            <Link
              href="/regularizacoes"
              className="inline-flex font-semibold text-orange-300 hover:text-orange-200 hover:underline"
            >
              Ver todas as regularizações →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
