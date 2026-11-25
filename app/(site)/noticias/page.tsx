import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/SectionHeading";
import { NoticiasList } from "@/components/site/NoticiasList";
import { noticias } from "@/lib/data/noticias";

export const metadata: Metadata = {
  title: "Notícias",
  description:
    "Notícias sobre regularização fundiária, Campinas e região, e temas gerais do setor imobiliário.",
};

/** Listagem editorial — ramo, Campinas e geral. */
export default function NoticiasPage() {
  return (
    <div className="bg-paper pt-6">
      <section className="relative overflow-hidden border-b border-ink/10 bg-paper pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(237,134,0,0.1),transparent_45%),radial-gradient(ellipse_at_90%_40%,rgba(62,90,75,0.08),transparent_48%)]"
        />
        <div className="site-container relative">
          <SectionHeading
            number="01"
            eyebrow="Editorial"
            title="Notícias"
            subtitle={`Atualizações do ramo, de Campinas e região, e temas gerais — ${noticias.length} publicações com acompanhamento contínuo da agenda fundiária.`}
          />
          <div className="mt-12">
            <NoticiasList />
          </div>
        </div>
      </section>
    </div>
  );
}
