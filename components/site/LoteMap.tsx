"use client";

import { useEffect, useRef, useState } from "react";
import { lotes, loteStatusColor, loteStatusLabel } from "@/lib/data/lotes";
import type { Lote, StatusLote } from "@/lib/data/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";
import Link from "next/link";

type LoteMapProps = {
  mode?: "site" | "gestao";
  onStatusChange?: (id: string, status: StatusLote) => void;
  className?: string;
};

export function LoteMap({ mode = "site", onStatusChange, className }: LoteMapProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(lotes);
  const [hover, setHover] = useState<Lote | null>(null);
  const [selected, setSelected] = useState<Lote | null>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const polys = gsap.utils.toArray<SVGPolygonElement>(".lote-poly");
      gsap.fromTo(
        polys,
        { opacity: 0 },
        {
          opacity: 0.9,
          duration: 0.4,
          stagger: {
            amount: 1.2,
            from: "random",
          },
          ease: "power2.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
        }
      );
    },
    { scope: rootRef }
  );

  useEffect(() => {
    setItems(lotes);
  }, []);

  const cycleStatus = (lote: Lote) => {
    if (mode !== "gestao") return;
    const order: StatusLote[] = ["disponivel", "reservado", "vendido"];
    const next = order[(order.indexOf(lote.status) + 1) % order.length];
    setItems((prev) =>
      prev.map((l) => (l.id === lote.id ? { ...l, status: next } : l))
    );
    onStatusChange?.(lote.id, next);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        {(Object.keys(loteStatusLabel) as StatusLote[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ background: loteStatusColor[s] }}
            />
            {loteStatusLabel[s]}
          </span>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-brand-navy/10 bg-white p-4 dark:bg-brand-navy">
        <svg
          viewBox="0 0 460 420"
          className="h-auto w-full"
          role="img"
          aria-label="Mapa ilustrado de lotes do empreendimento"
        >
          <rect x="0" y="0" width="460" height="420" fill="#FFF6EC" rx="12" />
          <path
            d="M20 390 Q230 340 440 390"
            fill="none"
            stroke="#F7821E"
            strokeWidth="8"
            opacity="0.25"
          />
          <text x="30" y="40" fill="#1E1856" fontSize="14" fontWeight="700">
            Residencial Horizonte, mapa ilustrado
          </text>
          {items.map((lote) => (
            <polygon
              key={lote.id}
              className="lote-poly cursor-pointer transition-opacity"
              points={lote.points}
              fill={loteStatusColor[lote.status]}
              fillOpacity={0.85}
              stroke="#1E1856"
              strokeWidth="2"
              tabIndex={0}
              role="button"
              aria-label={`Quadra ${lote.quadra} lote ${lote.numero}, ${lote.metragem} metros quadrados, ${loteStatusLabel[lote.status]}, ${formatCurrency(lote.valor)}`}
              onMouseEnter={(e) => {
                setHover(lote);
                const rect = (e.target as SVGPolygonElement).ownerSVGElement
                  ?.parentElement
                  ?.getBoundingClientRect();
                if (rect) {
                  setTooltip({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
              }}
              onMouseMove={(e) => {
                const rect = (e.target as SVGPolygonElement).ownerSVGElement
                  ?.parentElement
                  ?.getBoundingClientRect();
                if (rect) {
                  setTooltip({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
              }}
              onMouseLeave={() => setHover(null)}
              onClick={() => {
                if (mode === "gestao") cycleStatus(lote);
                else setSelected(lote);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (mode === "gestao") cycleStatus(lote);
                  else setSelected(lote);
                }
              }}
            />
          ))}
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg bg-brand-navy px-3 py-2 text-xs text-brand-cream shadow-lg"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <p className="font-semibold">
              Quadra {hover.quadra}, Lote {hover.numero}
            </p>
            <p>
              {hover.metragem} m², {formatCurrency(hover.valor)}
            </p>
            <p className="text-brand-orange">{loteStatusLabel[hover.status]}</p>
          </div>
        )}
      </div>

      {mode === "gestao" && (
        <p className="mt-3 text-xs text-muted-foreground">
          Clique em um lote para alternar o status (modo gestão, mock).
        </p>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent>
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>
                  Quadra {selected.quadra}, Lote {selected.numero}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Metragem:</span>{" "}
                  <strong>{selected.metragem} m²</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Valor:</span>{" "}
                  <strong>{formatCurrency(selected.valor)}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <strong>{loteStatusLabel[selected.status]}</strong>
                </p>
                <Button asChild className="mt-4 w-full">
                  <Link href="/contato">Falar com consultor</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/simulador">Simular parcelas</Link>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function LoteMapSection() {
  return (
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            Mapa de lotes
          </p>
          <h2 className="font-display mt-3 text-3xl text-brand-navy sm:text-5xl">
            Veja disponibilidade em tempo real
          </h2>
          <p className="mt-4 text-muted-foreground">
            Passe o mouse nos lotes e abra os detalhes. Ilustração demonstrativa
            com dados mock.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <LoteMap mode="site" />
        </div>
      </div>
    </section>
  );
}
