import type { Metadata } from "next";
import { RegularizacoesGrid } from "@/components/site/RegularizacoesGrid";
import { SectionHeading } from "@/components/site/SectionHeading";

export const metadata: Metadata = {
  title: "Regularização",
  description:
    "REURB-S e REURB-E, do diagnóstico ao registro em cartório. Núcleos em Campinas, Hortolândia, Valinhos e Amparo.",
};

/**
 * Shell da rota canônica /regularizacao.
 * Conteúdo completo (processo pinado, FAQ, mapa) na etapa Regularização.
 */
export default function RegularizacaoPage() {
  return (
    <div className="bg-paper pt-6">
      <section className="site-container py-12 sm:py-16">
        <SectionHeading
          number="01"
          eyebrow="REURB"
          title="Regularização fundiária"
          subtitle="Portfólio de núcleos concluídos e em andamento. O método completo desta página chega na próxima etapa de conteúdo."
        />
      </section>
      <RegularizacoesGrid
        title="Núcleos"
        subtitle="10 núcleos concluídos ou em registro e 17 em andamento, em 4 cidades."
      />
    </div>
  );
}
