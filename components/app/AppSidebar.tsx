"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  FolderKanban,
  FolderOpen,
  Hash,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import type { Papel } from "@/lib/data/types";

const nav = [
  {
    href: "/dashboard",
    label: "Painel",
    icon: LayoutDashboard,
    roles: ["admin", "corretor", "cliente"] as Papel[],
  },
  {
    href: "/processos",
    label: "Processos",
    icon: FolderKanban,
    roles: ["admin", "corretor", "cliente"] as Papel[],
  },
  {
    href: "/nucleos",
    label: "Núcleos",
    icon: Map,
    roles: ["admin", "corretor"] as Papel[],
  },
  {
    href: "/documentos",
    label: "Documentos",
    icon: FolderOpen,
    roles: ["admin", "corretor", "cliente"] as Papel[],
  },
  {
    href: "/protocolo",
    label: "Protocolo",
    icon: Hash,
    roles: ["admin", "corretor", "cliente"] as Papel[],
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: Settings,
    roles: ["admin", "corretor", "cliente"] as Papel[],
  },
];

export function AppSidebar({
  collapsed,
  onToggle,
  papel = "admin",
  mobile,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  papel?: Papel;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = nav.filter((i) => i.roles.includes(papel));

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-brand-navy-deep text-brand-cream transition-all duration-300",
        mobile ? "w-72" : collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
        <Link href="/dashboard" onClick={onNavigate} className="min-w-0">
          {collapsed && !mobile ? (
            <Logo variant="symbol" symbolClassName="h-8 w-8" />
          ) : (
            <Logo variant="full" className="scale-90" />
          )}
        </Link>
        {!mobile && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md p-1.5 text-brand-cream/70 hover:bg-brand-navy hover:text-brand-orange"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-navy text-brand-orange"
                  : "text-brand-cream/75 hover:bg-brand-navy hover:text-brand-cream",
                collapsed && !mobile && "justify-center px-2"
              )}
              title={item.label}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-brand-orange" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
