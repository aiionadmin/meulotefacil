import type { Metadata } from "next";
import { RegularizacaoIntro } from "@/components/site/RegularizacaoIntro";
import { RegularizacaoShowcase } from "@/components/site/RegularizacaoShowcase";
import { RegularizacoesGrid } from "@/components/site/RegularizacoesGrid";
import { NucleosMapSection } from "@/components/site/NucleosMap";
import { RegularizacaoFAQ } from "@/components/site/RegularizacaoFAQ";
import { FinalCTA } from "@/components/site/FinalCTA";

export const metadata: Metadata = {
  title: "Regularização",
  description:
    "REURB-S e REURB-E em Campinas e região: do diagnóstico ao registro. Portfólio completo com CRF, Diário Oficial e matrículas.",
};

export default function RegularizacaoPage() {
  return (
    <div className="bg-paper">
      <RegularizacaoIntro />
      <RegularizacaoShowcase />
      <RegularizacoesGrid
        title="Todos os núcleos"
        subtitle="10 concluídos ou em registro e 17 em andamento, em 4 cidades — clique para abrir a ficha."
        sectionNumber="04"
      />
      <NucleosMapSection />
      <RegularizacaoFAQ />
      <FinalCTA />
    </div>
  );
}
