import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/SectionHeading";

export const metadata: Metadata = {
  title: "Notícias",
  description:
    "Atualizações sobre regularização fundiária, núcleos e a atuação da Meu Lote Fácil.",
};

/** Stub de listagem, MDX na etapa Notícias. */
export default function NoticiasPage() {
  return (
    <div className="bg-paper pt-6">
      <section className="site-container py-20 sm:py-28">
        <SectionHeading
          number="01"
          eyebrow="Editorial"
          title="Notícias"
          subtitle="Em breve: publicações sobre núcleos, legislação e o dia a dia da regularização em Campinas e região."
        />
      </section>
    </div>
  );
}
