"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SpotlightFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: string;
};

/** Corner crosshair — Feature Grid Spotlight Cards (21st / hirael feature-08). */
function CrossDecor({ position }: { position: "top-start" | "bottom-end" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      className={cn(
        "pointer-events-none absolute z-10 size-3.5 shrink-0 text-ink/35",
        position === "top-start" &&
          "start-0 top-0 -translate-x-1/2 -translate-y-1/2",
        position === "bottom-end" &&
          "end-0 bottom-0 translate-x-1/2 translate-y-1/2"
      )}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function FeatureCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className={cn(
        "group relative flex h-full flex-col justify-start gap-5 bg-paper px-6 pb-6 pt-8",
        "bg-[radial-gradient(50%_80%_at_25%_0%,rgba(237,134,0,0.1),transparent)]",
        className
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_200px_at_var(--mx)_var(--my),rgba(237,134,0,0.14),transparent_70%)]"
      />
      <div className="absolute -inset-y-4 -start-px w-px bg-ink/10" />
      <div className="absolute -inset-y-4 -end-px w-px bg-ink/10" />
      <div className="absolute -inset-x-4 -top-px h-px bg-ink/10" />
      <div className="absolute -inset-x-4 -bottom-px h-px bg-ink/10" />
      {children}
    </div>
  );
}

type FeatureSpotlightGridProps = {
  features: readonly SpotlightFeature[];
  className?: string;
  columns?: 2 | 3;
};

/**
 * Feature Grid Spotlight Cards (21st/hirael) — tokens ink/paper/latossolo.
 * Flex + justify-center: última linha incompleta (ex.: 2 de 5) fica centralizada.
 */
export default function FeatureSpotlightGrid({
  features,
  className,
  columns = 3,
}: FeatureSpotlightGridProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-wrap justify-center gap-6",
        columns === 3 && "lg:gap-8",
        className
      )}
    >
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <FeatureCard
            key={feature.title}
            className={cn(
              "w-full sm:w-[calc((100%-1.5rem)/2)]",
              columns === 3 && "lg:w-[calc((100%-4rem)/3)]"
            )}
          >
            <CrossDecor position="top-start" />
            <CrossDecor position="bottom-end" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-sm border border-ink/12 bg-paper-muted/60 transition-colors duration-300 group-hover:border-latossolo/40">
                <Icon
                  aria-hidden
                  className="size-5 stroke-[1.5] text-ink"
                />
              </div>
              {feature.index ? (
                <span className="font-mono-label text-[11px] tabular-nums text-ink/45">
                  {feature.index}
                </span>
              ) : null}
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="font-display text-lg text-ink sm:text-xl">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </FeatureCard>
        );
      })}
    </div>
  );
}
