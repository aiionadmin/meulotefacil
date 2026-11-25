"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type EditorialTestimonialItem = {
  id: number;
  quote: string;
  /** Papel genérico (ex.: “Morador”) — sem nomes pessoais em produção. */
  author: string;
  role: string;
  company: string;
  image: string;
  /** Só itens `published: true` entram no site em produção. */
  published?: boolean;
};

/**
 * Depoimentos REURB anônimos (sem nomes fictícios).
 * Rascunhos ficam com `published: false` até aprovação editorial.
 */
const defaultTestimonials: EditorialTestimonialItem[] = [
  {
    id: 1,
    quote:
      "Pra gente, isso aqui é mais que um papel. É a certeza de que o que a gente construiu com tanto esforço agora é nosso de verdade.",
    author: "Morador",
    role: "Família regularizada",
    company: "Vila Diva, Campinas",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80",
    published: true,
  },
  {
    id: 2,
    quote:
      "A regularização trouxe segurança jurídica para as famílias e valorização do imóvel. Dormimos mais tranquilos.",
    author: "Moradora",
    role: "Beneficiária REURB-S",
    company: "Vila Paula, Campinas",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
    published: true,
  },
  {
    id: 3,
    quote:
      "Processo acompanhado até o registro em cartório. A equipe conduziu cada etapa com clareza e profissionalismo.",
    author: "Representante",
    role: "Associação de moradores",
    company: "Campinas e região",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80",
    published: true,
  },
];

function resolvePublished(
  items: readonly EditorialTestimonialItem[],
  showUnpublished: boolean
) {
  if (showUnpublished) return [...items];
  return items.filter((t) => t.published === true);
}

export default function TestimonialsEditorial({
  testimonials = defaultTestimonials,
  className,
  /** Dev/preview: incluir itens com published:false. */
  showUnpublished = process.env.NEXT_PUBLIC_SHOW_UNPUBLISHED_TESTIMONIALS === "1",
}: {
  testimonials?: EditorialTestimonialItem[];
  className?: string;
  showUnpublished?: boolean;
}) {
  const visible = useMemo(
    () => resolvePublished(testimonials, showUnpublished),
    [testimonials, showUnpublished]
  );

  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleChange = (index: number) => {
    if (index === active || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActive(index);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const handlePrev = () => {
    if (visible.length === 0) return;
    const newIndex = active === 0 ? visible.length - 1 : active - 1;
    handleChange(newIndex);
  };

  const handleNext = () => {
    if (visible.length === 0) return;
    const newIndex = active === visible.length - 1 ? 0 : active + 1;
    handleChange(newIndex);
  };

  const current = visible[active] ?? visible[0];
  if (!current) return null;

  return (
    <div className={cn("mx-auto w-full max-w-3xl px-2 sm:px-0", className)}>
      <div className="flex items-start gap-6 sm:gap-8">
        <span
          className="hidden select-none font-display text-[100px] font-light leading-none text-foreground/10 transition-all duration-500 sm:block md:text-[120px]"
          style={{ fontFeatureSettings: '"tnum"' }}
          aria-hidden
        >
          {String(active + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1 pt-2 sm:pt-6">
          <blockquote
            className={cn(
              "font-display text-2xl font-light leading-relaxed tracking-tight text-foreground transition-all duration-300 md:text-3xl",
              isTransitioning
                ? "translate-x-4 opacity-0"
                : "translate-x-0 opacity-100"
            )}
          >
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          <div
            className={cn(
              "group mt-10 cursor-default transition-all delay-100 duration-300",
              isTransitioning ? "opacity-0" : "opacity-100"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-foreground/10 transition-all duration-300 group-hover:ring-foreground/30">
                <Image
                  src={current.image}
                  alt=""
                  fill
                  className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                  sizes="48px"
                />
              </div>
              <div>
                <p className="font-medium text-foreground">{current.author}</p>
                <p className="text-sm text-muted-foreground">
                  {current.role}
                  <span className="mx-2 text-foreground/20">/</span>
                  <span className="transition-colors duration-300 group-hover:text-foreground">
                    {current.company}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between gap-4 sm:mt-16">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            {visible.map((t, index) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleChange(index)}
                className="group relative py-4"
                aria-label={`Depoimento ${index + 1}`}
                aria-current={index === active}
              >
                <span
                  className={cn(
                    "block h-px transition-all duration-500 ease-out",
                    index === active
                      ? "w-12 bg-foreground"
                      : "w-6 bg-foreground/20 group-hover:w-8 group-hover:bg-foreground/40"
                  )}
                />
              </button>
            ))}
          </div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(visible.length).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="rounded-full p-2 text-foreground/40 transition-all duration-300 hover:bg-foreground/5 hover:text-foreground"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-full p-2 text-foreground/40 transition-all duration-300 hover:bg-foreground/5 hover:text-foreground"
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
