"use client";

import { SectionHeading } from "@/components/site/SectionHeading";
import MilestoneTimeline, {
  type Milestone,
} from "@/components/ui/milestone-timeline";
import { INSTITUTIONAL } from "@/lib/institutional";

const MILESTONES: Milestone[] = [
  {
    year: "2005",
    title: "Fundação",
    description: "Nascimento da Meu Lote Fácil em Campinas-SP.",
  },
  {
    year: "n/d",
    title: "Hortolândia",
    description: "Primeiros núcleos atendidos em Hortolândia.",
  },
  {
    year: "2023",
    title: "Jardim Uruguai",
    description: "Marco de escala: 1.148 lotes em um único núcleo.",
  },
  {
    year: "2025",
    title: "Vila Paula",
    description: "Novo núcleo em Campinas, avançando a regularização.",
  },
  {
    year: "2026",
    title: "Amparo",
    description: "Expansão da atuação para Amparo e região.",
  },
];

/**
 * Quem somos — linha do tempo institucional (21st Milestone Timeline + GSAP).
 */
export function LinhaDoTempo() {
  return (
    <section className="relative overflow-hidden border-y border-ink/10 bg-paper-muted">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(237,134,0,0.1),transparent_45%),radial-gradient(ellipse_at_90%_80%,rgba(62,90,75,0.12),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="site-container relative py-16 lg:py-24">
        <SectionHeading
          number="01"
          eyebrow="Trajetória"
          title="Linha do tempo"
          subtitle="Marcos da Meu Lote Fácil — da fundação em Campinas à atuação em Amparo."
        />

        <MilestoneTimeline items={MILESTONES} className="mt-12 md:mt-16" />

        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Atuação: {INSTITUTIONAL.atuacao.join(", ")} (SP), áreas urbanas e
          rurais.
        </p>
      </div>
    </section>
  );
}
