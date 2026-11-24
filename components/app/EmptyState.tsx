import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center",
        className
      )}
    >
      <svg viewBox="0 0 120 80" className="mb-4 h-16 w-24 text-brand-orange/40" aria-hidden>
        <path d="M10 60 Q60 20 110 60" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M5 70 Q60 35 115 70" fill="none" stroke="currentColor" strokeWidth="4" />
        <path
          d="M40 48 L60 28 L80 48 L80 68 L40 68 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
