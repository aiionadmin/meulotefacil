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
                  "font-mono-label max-w-[9rem] text-[10px] transition-opacity",
                  active
                    ? "text-brand-cream opacity-100"
                    : "text-brand-cream/50 opacity-0 group-hover:opacity-100"
                )}
              >
                {s.kicker}
              </span>
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full transition-all",
                  active
                    ? "bg-latossolo ring-1 ring-latossolo/50 ring-offset-1 ring-offset-transparent"
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
                active ? "w-5 bg-latossolo" : "w-1.5 bg-brand-cream/40"
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
