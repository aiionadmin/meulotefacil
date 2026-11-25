"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type LogoVariant = "full" | "symbol" | "mono";
/** Cor do asset oficial conforme o fundo */
export type LogoTone = "orange" | "ink" | "paper";

type LogoProps = {
  variant?: LogoVariant;
  /** orange = oficial; ink = fundos claros; paper = fundos escuros */
  tone?: LogoTone;
  className?: string;
  symbolClassName?: string;
  /** Mantém SVG stroke para o Preloader (DrawSVG) */
  animated?: boolean;
};

const FULL: Record<LogoTone, string> = {
  orange: "/brand/mlf-full-orange.png",
  ink: "/brand/mlf-full-ink.png",
  paper: "/brand/mlf-full-paper.png",
};

const MARK: Record<LogoTone, string> = {
  orange: "/brand/mlf-mark-orange.png",
  ink: "/brand/mlf-mark-ink.png",
  paper: "/brand/mlf-mark-paper.png",
};

/**
 * Logo oficial Meu Lote Fácil (pack Logotipo MLF).
 * `animated` usa o SVG de traço só no preloader.
 */
export function Logo({
  variant = "full",
  tone = "orange",
  className,
  symbolClassName,
  animated = false,
}: LogoProps) {
  if (animated) {
    return (
      <LogoStroke
        variant={variant}
        className={className}
        symbolClassName={symbolClassName}
      />
    );
  }

  const src = variant === "symbol" ? MARK[tone] : FULL[tone];
  const isMark = variant === "symbol";

  return (
    <div
      className={cn("inline-flex items-center", className)}
      aria-label="Meu Lote Fácil"
      role="img"
    >
      <Image
        src={src}
        alt="Meu Lote Fácil"
        width={isMark ? 40 : 168}
        height={isMark ? 40 : 116}
        className={cn(
          "h-auto w-auto object-contain",
          isMark ? "h-9 w-9 sm:h-10 sm:w-10" : "h-9 w-auto sm:h-11",
          symbolClassName
        )}
        priority
      />
    </div>
  );
}

/** Marca LA (pack Logotipo LA) — monograma vermelho/preto */
export function LaLogo({
  tone = "color",
  className,
}: {
  tone?: "color" | "preto" | "branco" | "cinza";
  className?: string;
}) {
  const src =
    tone === "branco"
      ? "/brand/la/logo-branco.png"
      : tone === "preto"
        ? "/brand/la/logo-preto.png"
        : tone === "cinza"
          ? "/brand/la/logo-cinza-escuro.png"
          : "/brand/la/logo-imagem.png";

  return (
    <div
      className={cn("inline-flex items-center", className)}
      aria-label="LA"
      role="img"
    >
      <Image
        src={src}
        alt="LA"
        width={40}
        height={40}
        className="h-9 w-9 object-contain sm:h-10 sm:w-10"
      />
    </div>
  );
}

/** SVG de traço — só para animação do preloader */
function LogoStroke({
  variant,
  className,
  symbolClassName,
}: {
  variant: LogoVariant;
  className?: string;
  symbolClassName?: string;
}) {
  const stroke = "var(--logo-orange, #ED8600)";
  const textFill = stroke;

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
        <path
          className="logo-house-outer"
          d="M22 58 L60 22 L98 58 L98 98 L22 98 Z"
          stroke={stroke}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
        />
        <path
          className="logo-house-inner"
          d="M42 98 L42 68 L60 52 L78 68 L78 98"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
        />
        <g className="logo-window" style={{ opacity: 0 }}>
          <rect x="52" y="70" width="7" height="7" fill="#ED8600" rx="1" />
          <rect x="61" y="70" width="7" height="7" fill="#ED8600" rx="1" />
          <rect x="52" y="79" width="7" height="7" fill="#ED8600" rx="1" />
          <rect x="61" y="79" width="7" height="7" fill="#ED8600" rx="1" />
        </g>
        <path
          className="logo-arc logo-arc-1"
          d="M18 108 Q60 88 102 108"
          stroke={stroke}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
        />
        <path
          className="logo-arc logo-arc-2"
          d="M10 114 Q60 96 110 114"
          stroke={stroke}
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
        />
        <path
          className="logo-arc logo-arc-3"
          d="M4 119 Q60 104 116 119"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
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
