"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fichaFinanceiraNav } from "@/lib/financeiro/ficha-links";
import { releaseDialogLock } from "@/lib/ui/release-dialog-lock";
import { cn } from "@/lib/utils";

type Props = {
  contractId?: string;
  /** Fecha sheet/dialog pai antes de navegar (evita lock de pointer-events). */
  onBeforeNavigate?: () => void;
  className?: string;
  linkClassName?: string;
};

function navigateAfterUnlock(href: string, onBeforeNavigate?: () => void) {
  onBeforeNavigate?.();
  releaseDialogLock();
  // Deixa o Sheet desmontar / limpar remove-scroll antes do push
  window.setTimeout(() => {
    releaseDialogLock();
    window.location.assign(href);
  }, 30);
}

/**
 * Links da ficha financeira que fecham o sheet atual e limpam o lock
 * do Radix antes de navegar (full assign evita portal órfão do soft-nav).
 */
export function FichaNavLinks({
  contractId,
  onBeforeNavigate,
  className,
  linkClassName,
}: Props) {
  const links = fichaFinanceiraNav(contractId);

  return (
    <div className={cn("flex flex-wrap gap-2 text-xs", className)}>
      {links.map((l) => (
        <Link
          key={l.label}
          href={l.href}
          className={cn("underline", linkClassName)}
          onClick={(e) => {
            e.preventDefault();
            navigateAfterUnlock(l.href, onBeforeNavigate);
          }}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export function FichaFinanceiraButton({
  href,
  onBeforeNavigate,
  children = "Ficha financeira",
  className,
  variant = "outline",
  size = "sm",
}: {
  href: string;
  onBeforeNavigate?: () => void;
  children?: ReactNode;
  className?: string;
  variant?: "outline" | "default" | "ghost" | "secondary" | "destructive" | "link";
  size?: "sm" | "default" | "lg" | "icon";
}) {
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={() => navigateAfterUnlock(href, onBeforeNavigate)}
    >
      {children}
    </Button>
  );
}