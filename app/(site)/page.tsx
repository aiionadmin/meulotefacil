import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { HowItWorks } from "@/components/site/HowItWorks";
import { EmpreendimentosGrid } from "@/components/site/EmpreendimentosGrid";
import { ArcDivider } from "@/components/site/ArcDivider";
import { SimuladorWidget } from "@/components/site/SimuladorWidget";
import { WhyUs } from "@/components/site/WhyUs";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { FinalCTA } from "@/components/site/FinalCTA";
import { LoteMapSection } from "@/components/site/LoteMap";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <HowItWorks />
      <ArcDivider from="cream" />
      <EmpreendimentosGrid limit={3} />
      <LoteMapSection />
      <SimuladorWidget />
      <WhyUs />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}
