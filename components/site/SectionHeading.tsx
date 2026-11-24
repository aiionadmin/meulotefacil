import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  number: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  dark?: boolean;
};

/**
 * Cabeçalho de seção: número + título em Montserrat.
 */
export function SectionHeading({
  number,
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  dark = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl",
        className
      )}
    >
      <div
        className={cn(
          "flex items-baseline gap-3",
          align === "center" && "justify-center"
        )}
      >
        <span
          className={cn(
            "font-mono-label text-xs tabular-nums",
            dark ? "text-paper/50" : "text-mata"
          )}
        >
          {number}
        </span>
        {eyebrow ? (
          <span
            className={cn(
              "font-mono-label text-xs",
              dark ? "text-paper/65" : "text-muted-foreground"
            )}
          >
            {eyebrow}
          </span>
        ) : null}
      </div>
      <h2
        className={cn(
          "font-display mt-3 text-3xl leading-[1.15] sm:text-4xl lg:text-[2.75rem]",
          dark ? "text-paper" : "text-ink"
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-4 max-w-xl text-base leading-relaxed sm:text-lg",
            align === "center" && "mx-auto",
            dark ? "text-paper/70" : "text-muted-foreground"
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
