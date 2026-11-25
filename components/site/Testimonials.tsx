import { SectionHeading } from "@/components/site/SectionHeading";
import TestimonialsEditorial from "@/components/ui/editorial-testimonial";

/**
 * Depoimentos — faixa paper clara após Três pilares (ink-deep).
 */
export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-b border-linha bg-paper py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(237,134,0,0.07),transparent_45%),radial-gradient(ellipse_at_0%_100%,rgba(62,90,75,0.05),transparent_40%)]"
      />
      <div className="site-container relative">
        <SectionHeading
          number="05"
          eyebrow="Depoimentos"
          title="Histórias de quem já tem escritura"
          subtitle="Relatos de quem passou pelo processo de regularização fundiária conosco."
        />
        <div className="mt-12 overflow-hidden rounded-sm border border-linha bg-card px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
          <TestimonialsEditorial />
        </div>
      </div>
    </section>
  );
}
