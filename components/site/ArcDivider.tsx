import { cn } from "@/lib/utils";

export function ArcDivider({
  from = "navy",
  className,
}: {
  from?: "navy" | "cream";
  className?: string;
}) {
  const fill = from === "navy" ? "var(--brand-navy)" : "var(--brand-cream)";
  const next = from === "navy" ? "var(--brand-cream)" : "var(--brand-navy)";

  return (
    <div className={cn("relative -mb-px h-16 w-full sm:h-24", className)} style={{ background: next }}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 0 H1440 V40 Q1080 120 720 70 T0 40 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
