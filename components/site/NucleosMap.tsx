"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  nucleos,
  statusNucleoLabel,
  lotesLabel,
  type Nucleo,
  type StatusNucleo,
} from "@/lib/data/nucleos";
import { Button } from "@/components/ui/button";
import MapVisual from "@/components/ui/map";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";

const statusColor: Record<StatusNucleo, string> = {
  concluido: "#3E5A4B",
  em_registro: "#A8502A",
  em_andamento: "#6B756E",
};

/** Posições ilustrativas por cidade no mapa regional */
const cityPos: Record<string, { x: number; y: number }> = {
  Campinas: { x: 220, y: 180 },
  Hortolândia: { x: 140, y: 210 },
  Valinhos: { x: 300, y: 150 },
  Amparo: { x: 360, y: 90 },
};

function nucleoPoint(n: Nucleo, indexInCity: number) {
  const base = cityPos[n.cidade] ?? { x: 220, y: 180 };
  const angle = (indexInCity / 8) * Math.PI * 2;
  const r = 18 + (indexInCity % 4) * 10;
  return {
    cx: base.x + Math.cos(angle) * r,
    cy: base.y + Math.sin(angle) * r,
  };
}

export function NucleosMap({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Nucleo | null>(null);
  const [hover, setHover] = useState<Nucleo | null>(null);

  const byCityIndex = new Map<string, number>();
  const points = nucleos.map((n) => {
    const i = byCityIndex.get(n.cidade) ?? 0;
    byCityIndex.set(n.cidade, i + 1);
    return { n, ...nucleoPoint(n, i) };
  });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const dots = gsap.utils.toArray<SVGCircleElement>(".nucleo-dot");
      gsap.fromTo(
        dots,
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          stagger: { amount: 1.1, from: "random" },
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-brand-ink dark:text-brand-cream">
        {(Object.keys(statusNucleoLabel) as StatusNucleo[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: statusColor[s] }} />
            {statusNucleoLabel[s]}
          </span>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-brand-navy/10 bg-white p-4 dark:bg-brand-navy">
        <svg
          viewBox="0 0 480 320"
          className="h-auto w-full"
          role="img"
          aria-label="Mapa ilustrado de núcleos atendidos em Campinas e região"
        >
          <rect width="480" height="320" fill="#FFF6EC" rx="12" />
          <path
            d="M40 280 Q240 240 440 280"
            fill="none"
            stroke="#F7821E"
            strokeWidth="10"
            opacity="0.2"
          />
          <text x="24" y="36" fill="#1E1856" fontSize="14" fontWeight="700">
            Núcleos atendidos, Campinas e região
          </text>
          {Object.entries(cityPos).map(([city, pos]) => (
            <text
              key={city}
              x={pos.x}
              y={pos.y - 28}
              textAnchor="middle"
              fill="#1E1856"
              fontSize="11"
              fontWeight="600"
              opacity="0.55"
            >
              {city}
            </text>
          ))}
          {points.map(({ n, cx, cy }) => (
            <circle
              key={n.id}
              className="nucleo-dot cursor-pointer"
              cx={cx}
              cy={cy}
              r={hover?.id === n.id ? 9 : 7}
              fill={statusColor[n.status]}
              stroke="#1E1856"
              strokeWidth="1.5"
              tabIndex={0}
              role="button"
              aria-label={`${n.nome}, ${n.cidade}, ${statusNucleoLabel[n.status]}, ${lotesLabel(n)}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setSelected(n)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(n);
                }
              }}
            />
          ))}
        </svg>

        {hover && (
          <div className="pointer-events-none absolute bottom-6 left-6 right-6 rounded-lg bg-brand-navy px-3 py-2 text-xs text-brand-cream shadow-lg sm:left-auto sm:right-6 sm:w-64">
            <p className="font-semibold">{hover.nome}</p>
            <p>
              {hover.cidade}, {lotesLabel(hover)}
            </p>
            <p className="text-brand-orange">{statusNucleoLabel[hover.status]}</p>
          </div>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent>
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.nome}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Cidade:</span>{" "}
                  <strong>
                    {selected.cidade}/{selected.estado}
                  </strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Modalidade:</span>{" "}
                  <strong>{selected.modalidade}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Tipo:</span>{" "}
                  <strong>{selected.tipo}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Tamanho:</span>{" "}
                  <strong>{lotesLabel(selected)}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <strong>{statusNucleoLabel[selected.status]}</strong>
                </p>
                {selected.faseLabel && (
                  <p className="text-muted-foreground">{selected.faseLabel}</p>
                )}
                <Button asChild className="mt-4 w-full">
                  <Link href={`/regularizacoes/${selected.slug}`}>Ver detalhes</Link>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function NucleosMapSection() {
  return (
    <section className="border-b border-linha bg-paper py-20 lg:py-28">
      <div className="site-container">
        <SectionHeading
          number="04"
          eyebrow="Mapa"
          title="Onde estamos regularizando"
          subtitle="10 núcleos concluídos ou em registro e 17 em andamento, em 4 cidades. Passe o mouse no mapa para ver os marcadores."
        />
        <div className="relative mx-auto mt-12 h-[400px] w-full max-w-[600px] overflow-hidden border border-linha bg-paper">
          <MapVisual />
        </div>
        <ul className="mx-auto mt-8 flex max-w-[600px] flex-wrap justify-center gap-5 text-sm text-ink">
          {(Object.keys(statusNucleoLabel) as StatusNucleo[]).map((s) => (
            <li key={s} className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: statusColor[s] }}
                aria-hidden
              />
              {statusNucleoLabel[s]}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
