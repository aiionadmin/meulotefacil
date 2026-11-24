import { ScrollHero } from "@/components/hero/ScrollHero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { ServicosCards } from "@/components/site/ServicosCards";
import { RegularizacoesGrid } from "@/components/site/RegularizacoesGrid";
import { ConsultaBairro } from "@/components/site/ConsultaBairro";
import { WhyUs } from "@/components/site/WhyUs";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { FinalCTA } from "@/components/site/FinalCTA";
import { NucleosMapSection } from "@/components/site/NucleosMap";

export default function HomePage() {
  return (
    <>
      <ScrollHero />
      <div className="after-scroll-hero bg-brand-cream">
        <ServicosCards />
        <HowItWorks />
        <RegularizacoesGrid
          limit={6}
          title="Regularizações em destaque"
          subtitle="Concluídas, em registro e em andamento — veja o portfólio completo."
          sectionNumber="03"
        />
        <NucleosMapSection />
        <ConsultaBairro />
        <WhyUs />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </div>
    </>
  );
}
