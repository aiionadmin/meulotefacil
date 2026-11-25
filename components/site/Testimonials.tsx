import { SectionHeading } from "@/components/site/SectionHeading";

// TODO: substituir por depoimentos reais / vídeos Vila Paula
const testimonials = [
  {
    quote:
      "A regularização trouxe segurança jurídica para as famílias e valorização do imóvel. (Depoimento placeholder, aguardando conteúdo real.)",
    author: "Morador, placeholder",
  },
  {
    quote:
      "Vila Paula: vídeos do prefeito Dário Saadi e do vice Wanderley de Almeida são bons para esta seção. (TODO: incorporar mídia real.)",
    author: "Campinas, placeholder institucional",
  },
  {
    quote:
      "Processo acompanhado até o registro em cartório. (Placeholder, substituir por depoimento real.)",
    author: "Associação, placeholder",
  },
];

export function Testimonials() {
  return (
    <section className="border-b border-linha bg-brand-cream py-20 lg:py-28">
      <div className="site-container">
        <SectionHeading
          number="05"
          eyebrow="Depoimentos"
          title="Histórias de quem já tem escritura"
          subtitle="Conteúdo placeholder, aguardando depoimentos e vídeos reais."
        />

        <div className="mt-12 grid gap-0 border border-linha md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote
              key={t.author}
              className="border-b border-linha bg-card p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
            >
              <p className="font-display text-lg leading-snug text-brand-ink">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="font-mono-label mt-6 text-xs text-muted-foreground">
                {t.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
