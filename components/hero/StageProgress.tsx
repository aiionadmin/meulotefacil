"use client";

import { cn } from "@/lib/utils";
import { HERO_STAGES } from "./heroStages";

type StageProgressProps = {
  activeIndex: number; // 0-based
  onSelect: (index: number) => void;
  className?: string;
};

/**
 * 12 pontos de progresso — vertical (desktop) / horizontal (mobile).
 * Clique rola até a etapa (via callback do ScrollHero).
 */
export function StageProgress({
  activeIndex,
  onSelect,
  className,
}: StageProgressProps) {
  return (
    <>
      {/* Desktop — vertical direita */}
      <nav
        aria-label="Etapas do hero"
        className={cn(
          "pointer-events-auto absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 lg:flex xl:right-8",
          className
        )}
      >
        {HERO_STAGES.map((s, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(i)}
              className="group flex items-center justify-end gap-3 text-right"
              aria-current={active ? "step" : undefined}
              aria-label={`Etapa ${String(s.id).padStart(2, "0")}: ${s.kicker}`}
            >
              <span
                className={cn(
                  "max-w-[9rem] text-[10px] font-semibold uppercase tracking-wider transition-opacity",
                  active
                    ? "text-brand-orange opacity-100"
                    : "text-brand-cream/50 opacity-0 group-hover:opacity-100"
                )}
              >
                {s.kicker}
              </span>
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full transition-all",
                  active
                    ? "scale-125 bg-brand-orange shadow-[0_0_0_3px_rgba(247,130,30,0.35)]"
                    : "bg-brand-cream/35 group-hover:bg-brand-cream/70"
                )}
              />
            </button>
          );
        })}
      </nav>

      {/* Mobile — horizontal rodapé */}
      <nav
        aria-label="Etapas do hero"
        className="pointer-events-auto absolute inset-x-0 bottom-14 z-30 flex justify-center gap-1.5 px-4 lg:hidden"
      >
        {HERO_STAGES.map((s, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                active ? "w-5 bg-brand-orange" : "w-1.5 bg-brand-cream/40"
              )}
              aria-label={`Etapa ${s.id}: ${s.kicker}`}
              aria-current={active ? "step" : undefined}
            />
          );
        })}
      </nav>
    </>
  );
}
