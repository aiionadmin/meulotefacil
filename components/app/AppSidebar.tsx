"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  FileSignature,
  Wallet,
  Receipt,
  RefreshCw,
  HardHat,
  ShoppingCart,
  Landmark,
  FileSpreadsheet,
  FolderKanban,
  Map,
  FolderOpen,
  Hash,
  BarChart3,
  CheckSquare,
  Files,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { APP_NAV } from "@/lib/app-nav";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/notificacoes": Bell,
  "/tarefas": CheckSquare,
  "/quadros/jornada": FolderKanban,
  "/quadros/cobranca": Wallet,
  "/quadros/regularizacao": FolderKanban,
  "/quadros/compras": ShoppingCart,
  "/quadros/obras": HardHat,
  "/quadros/tarefas": CheckSquare,
  "/cadastros/pessoas": Users,
  "/cadastros/clientes": Users,
  "/cadastros/fornecedores": Users,
  "/cadastros/profissionais": Users,
  "/cadastros/corretores": Users,
  "/pessoas": Users,
  "/usuarios": Shield,
  "/empreendimentos": Building2,
  "/vendas": FileSignature,
  "/carteira": Wallet,
  "/boletos": Receipt,
  "/reajustes": RefreshCw,
  "/obras": HardHat,
  "/compras": ShoppingCart,
  "/financeiro": Landmark,
  "/fiscal": FileSpreadsheet,
  "/processos": FolderKanban,
  "/nucleos": Map,
  "/documentos": FolderOpen,
  "/protocolo": Hash,
  "/relatorios": BarChart3,
  "/arquivos": Files,
  "/configuracoes": Settings,
  "/configuracoes/empresa": Settings,
  "/configuracoes/usuarios": Shield,
  "/configuracoes/perfis": Shield,
  "/configuracoes/alcadas": Shield,
  "/configuracoes/listas": Files,
  "/configuracoes/auditoria": Shield,
};

export function AppSidebar({
  collapsed,
  onToggle,
  mobile,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  papel?: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const showLabels = !collapsed || mobile;

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-brand-navy-deep text-brand-cream transition-all duration-300",
        mobile ? "w-72" : collapsed ? "w-[72px]" : "w-72"
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
        <Link href="/dashboard" onClick={onNavigate} className="min-w-0">
          {collapsed && !mobile ? (
            <Logo variant="symbol" symbolClassName="h-8 w-8 text-brand-cream" />
          ) : (
            <Logo variant="mono" className="scale-90 text-brand-cream" />
          )}
        </Link>
        {!mobile && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md p-1.5 text-brand-cream/70 hover:bg-brand-navy hover:text-orange-300"
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

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {APP_NAV.map((group) => (
          <div key={group.id}>
            {showLabels ? (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-brand-cream/45">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                const Icon = ICONS[item.href] ?? LayoutDashboard;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-navy text-orange-300"
                        : "text-brand-cream/80 hover:bg-brand-navy hover:text-brand-cream",
                      collapsed && !mobile && "justify-center px-2"
                    )}
                    title={item.description ?? item.label}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-orange-300" />
                    )}
                    <Icon className="h-4 w-4 shrink-0" />
                    {showLabels ? (
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <span className="truncate">{item.label}</span>
                        <ArrowRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
