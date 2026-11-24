"use client";

import { cn } from "@/lib/utils";

type LogoVariant = "full" | "symbol" | "mono";

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
  symbolClassName?: string;
  animated?: boolean;
};

/**
 * Logo Meu Lote Fácil — traço (stroke) para animação DrawSVG.
 * Casa externa → casa interna + janela → arcos concêntricos.
 */
export function Logo({
  variant = "full",
  className,
  symbolClassName,
  animated = false,
}: LogoProps) {
  const stroke =
    variant === "mono" ? "currentColor" : "var(--brand-orange, #F7821E)";
  const textFill =
    variant === "mono" ? "currentColor" : "var(--brand-orange, #F7821E)";

  return (
    <div
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="Meu Lote Fácil"
      role="img"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-10 w-10 shrink-0", symbolClassName)}
        aria-hidden
      >
        {/* Casa externa */}
        <path
          className="logo-house-outer"
          d="M22 58 L60 22 L98 58 L98 98 L22 98 Z"
          stroke={stroke}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={1}
          style={
            animated
              ? { strokeDasharray: 1, strokeDashoffset: 1 }
              : undefined
          }
        />
        {/* Casa interna */}
        <path
          className="logo-house-inner"
          d="M42 98 L42 68 L60 52 L78 68 L78 98"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={1}
          style={
            animated
              ? { strokeDasharray: 1, strokeDashoffset: 1 }
              : undefined
          }
        />
        {/* Janela 4 quadrados */}
        <g className="logo-window" style={animated ? { opacity: 0 } : undefined}>
          <rect
            x="52"
            y="70"
            width="7"
            height="7"
            fill={variant === "mono" ? "currentColor" : "#F7821E"}
            rx="1"
          />
          <rect
            x="61"
            y="70"
            width="7"
            height="7"
            fill={variant === "mono" ? "currentColor" : "#F7821E"}
            rx="1"
          />
          <rect
            x="52"
            y="79"
            width="7"
            height="7"
            fill={variant === "mono" ? "currentColor" : "#F7821E"}
            rx="1"
          />
          <rect
            x="61"
            y="79"
            width="7"
            height="7"
            fill={variant === "mono" ? "currentColor" : "#F7821E"}
            rx="1"
          />
        </g>
        {/* Arcos concêntricos (colinas / curvas de nível) */}
        <path
          className="logo-arc logo-arc-1"
          d="M18 108 Q60 88 102 108"
          stroke={stroke}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          style={
            animated
              ? { strokeDasharray: 1, strokeDashoffset: 1 }
              : undefined
          }
        />
        <path
          className="logo-arc logo-arc-2"
          d="M10 114 Q60 96 110 114"
          stroke={stroke}
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          style={
            animated
              ? { strokeDasharray: 1, strokeDashoffset: 1 }
              : undefined
          }
        />
        <path
          className="logo-arc logo-arc-3"
          d="M4 119 Q60 104 116 119"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          style={
            animated
              ? { strokeDasharray: 1, strokeDashoffset: 1 }
              : undefined
          }
        />
      </svg>

      {variant !== "symbol" && (
        <div className="logo-wordmark flex flex-col leading-none">
          <span
            className="text-[0.85em] font-medium lowercase tracking-wide"
            style={{ color: textFill }}
          >
            meu
          </span>
          <span
            className="font-display text-[1.05em] leading-[0.95]"
            style={{ color: textFill }}
          >
            LOTE FÁCIL
          </span>
        </div>
      )}
    </div>
  );
}
