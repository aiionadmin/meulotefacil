"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Users,
  FileText,
  ScrollText,
  Wallet,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  LandPlot,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import type { Papel } from "@/lib/data/types";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "corretor", "cliente"] as Papel[] },
  { href: "/lotes", label: "Lotes", icon: LandPlot, roles: ["admin", "corretor"] as Papel[] },
  { href: "/lotes/mapa", label: "Mapa", icon: Map, roles: ["admin", "corretor"] as Papel[] },
  { href: "/clientes", label: "Clientes", icon: Users, roles: ["admin", "corretor"] as Papel[] },
  { href: "/propostas", label: "Propostas", icon: FileText, roles: ["admin", "corretor"] as Papel[] },
  { href: "/contratos", label: "Contratos", icon: ScrollText, roles: ["admin", "corretor", "cliente"] as Papel[] },
  { href: "/financeiro", label: "Financeiro", icon: Wallet, roles: ["admin", "corretor", "cliente"] as Papel[] },
  { href: "/documentos", label: "Documentos", icon: FolderOpen, roles: ["admin", "corretor", "cliente"] as Papel[] },
  { href: "/configuracoes", label: "Configurações", icon: Settings, roles: ["admin", "corretor", "cliente"] as Papel[] },
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
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/lotes/mapa" &&
              pathname.startsWith(item.href) &&
              !(item.href === "/lotes" && pathname.startsWith("/lotes/mapa")));
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
