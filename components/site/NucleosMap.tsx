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
import { SectionHeading } from "@/components/site/SectionHeading";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";

const statusColor: Record<StatusNucleo, string> = {
  concluido: "#3E5A4B",
  em_registro: "#ED8600",
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
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-ink/80">
        {(Object.keys(statusNucleoLabel) as StatusNucleo[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: statusColor[s] }} />
            {statusNucleoLabel[s]}
          </span>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-sm border border-ink/10 bg-paper-muted/40 p-3 sm:p-4">
        <svg
          viewBox="0 0 480 320"
          className="h-auto w-full"
          role="img"
          aria-label="Mapa ilustrado de núcleos atendidos em Campinas e região"
        >
          <rect width="480" height="320" fill="#F3F1EC" rx="4" />
          <path
            d="M40 280 Q240 240 440 280"
            fill="none"
            stroke="#ED8600"
            strokeWidth="10"
            opacity="0.18"
          />
          <text x="24" y="36" fill="#111614" fontSize="14" fontWeight="700">
            Núcleos atendidos, Campinas e região
          </text>
          {Object.entries(cityPos).map(([city, pos]) => (
            <text
              key={city}
              x={pos.x}
              y={pos.y - 28}
              textAnchor="middle"
              fill="#111614"
              fontSize="11"
              fontWeight="600"
              opacity="0.5"
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
              stroke="#111614"
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
          <div className="pointer-events-none absolute bottom-6 left-6 right-6 rounded-sm bg-ink px-3 py-2 text-xs text-paper shadow-lg sm:left-auto sm:right-6 sm:w-64">
            <p className="font-semibold">{hover.nome}</p>
            <p>
              {hover.cidade}, {lotesLabel(hover)}
            </p>
            <p className="text-latossolo">{statusNucleoLabel[hover.status]}</p>
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
    <section className="relative overflow-hidden border-b border-ink/10 bg-paper py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(237,134,0,0.08),transparent_45%),radial-gradient(ellipse_at_10%_80%,rgba(62,90,75,0.08),transparent_40%)]"
      />
      <div className="site-container relative">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading
            number="05"
            eyebrow="Mapa"
            title="Onde estamos regularizando"
            subtitle="10 núcleos concluídos ou em registro e 17 em andamento, em 4 cidades. Clique nos marcadores para abrir a ficha."
            align="center"
          />
        </div>
        <div className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-sm border border-ink/12 bg-paper p-3 sm:p-5">
          <NucleosMap />
        </div>
      </div>
    </section>
  );
}
