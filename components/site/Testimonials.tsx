import { SectionHeading } from "@/components/site/SectionHeading";
import TestimonialsEditorial from "@/components/ui/editorial-testimonial";

export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-b border-linha bg-brand-cream py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(237,134,0,0.06),transparent_45%)]"
      />
      <div className="site-container relative">
        <SectionHeading
          number="05"
          eyebrow="Depoimentos"
          title="Histórias de quem já tem escritura"
          subtitle="Relatos de quem passou pelo processo de regularização fundiária conosco."
        />
        <div className="mt-12 border border-linha bg-card/80 px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
          <TestimonialsEditorial />
        </div>
      </div>
    </section>
  );
}
