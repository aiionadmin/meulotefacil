"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SITE_NAV } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

const PARENT_LABEL: Record<string, string> = {
  "/": "Início",
  "/servicos": "Serviços",
  "/regularizacao": "Regularização",
  "/regularizacoes": "Regularização",
  "/noticias": "Notícias",
  "/quem-somos": "Quem somos",
  "/contato": "Contato",
};

/** Destino de “voltar”: home nas páginas raiz; pai nas subpáginas. */
export function resolveSiteBack(pathname: string): {
  href: string;
  label: string;
} | null {
  if (!pathname || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  // /regularizacoes/[slug] → portfólio canônico
  if (segments[0] === "regularizacoes" && segments.length > 1) {
    return { href: "/regularizacao", label: "Regularização" };
  }

  if (segments.length === 1) {
    const isTopNav = SITE_NAV.some((n) => n.href === pathname);
    if (isTopNav || pathname === "/regularizacoes") {
      return { href: "/", label: "Início" };
    }
    return { href: "/", label: "Início" };
  }

  const parent = `/${segments.slice(0, -1).join("/")}`;
  const href = parent === "/regularizacoes" ? "/regularizacao" : parent;
  return {
    href,
    label: PARENT_LABEL[href] ?? "Voltar",
  };
}

export function SiteBackLink({ className }: { className?: string }) {
  const pathname = usePathname();
  const back = resolveSiteBack(pathname);

  if (!back) return null;

  return (
    <div
      className={cn(
        "site-container relative z-40 border-b border-linha/60 bg-paper/90 pt-[4.75rem] backdrop-blur-sm sm:pt-[5.25rem]",
        className
      )}
    >
      <Link
        href={back.href}
        className="inline-flex items-center gap-2 py-2.5 text-sm font-medium text-ink/75 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        Voltar para {back.label}
      </Link>
    </div>
  );
}
