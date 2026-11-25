import { SectionHeading } from "@/components/site/SectionHeading";
import {
  REGULARIZACAO_INTRO,
  REURB_MODALIDADES,
  PROCESSO_ETAPAS,
} from "@/lib/data/regularizacao-content";

export function RegularizacaoIntro() {
  return (
    <>
      <section className="border-b border-linha bg-paper pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="site-container">
          <SectionHeading
            number="01"
            eyebrow={REGULARIZACAO_INTRO.eyebrow}
            title={REGULARIZACAO_INTRO.title}
            subtitle={REGULARIZACAO_INTRO.subtitle}
          />
          <div className="mt-12 grid gap-0 border border-linha sm:grid-cols-2">
            {REURB_MODALIDADES.map((m) => (
              <div
                key={m.id}
                className="border-b border-linha bg-card p-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <p className="font-mono-label text-xs uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <h3 className="font-display mt-2 text-2xl text-brand-navy">
                  {m.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/80">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-linha bg-brand-cream py-20 lg:py-28">
        <div className="site-container">
          <SectionHeading
            number="02"
            eyebrow="Método"
            title="Do diagnóstico ao registro"
            subtitle="Sequência completa até a matrícula individual de cada lote ou unidade."
          />
          <ol className="mt-12 grid gap-0 border border-linha sm:grid-cols-2 lg:grid-cols-5">
            {PROCESSO_ETAPAS.map((step, i) => (
              <li
                key={step.title}
                className="border-b border-linha bg-card p-5 last:border-b-0 sm:border-b lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <p className="font-mono-label text-xs text-ink/65">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display mt-3 text-xl text-brand-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
