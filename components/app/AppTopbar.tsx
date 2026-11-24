"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { demoUser } from "@/lib/data/clientes";
import { createClient } from "@/lib/supabase/client";
import { clearDemoSession } from "@/lib/auth-demo";

const crumbs: Record<string, string> = {
  dashboard: "Dashboard",
  lotes: "Lotes",
  mapa: "Mapa",
  clientes: "Clientes",
  propostas: "Propostas",
  contratos: "Contratos",
  financeiro: "Financeiro",
  documentos: "Documentos",
  configuracoes: "Configurações",
};

const commands = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lotes", label: "Lotes" },
  { href: "/lotes/mapa", label: "Mapa de lotes" },
  { href: "/clientes", label: "Clientes" },
  { href: "/propostas", label: "Propostas" },
  { href: "/contratos", label: "Contratos" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/documentos", label: "Documentos" },
  { href: "/configuracoes", label: "Configurações" },
];

export function AppTopbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const parts = pathname.split("/").filter(Boolean);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const logout = async () => {
    clearDemoSession();
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4">
      <Button variant="ghost" size="icon" className="lg:hidden text-foreground" onClick={onMenu}>
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="hidden text-sm text-muted-foreground sm:flex sm:items-center sm:gap-1">
        <Link href="/dashboard" className="hover:text-brand-orange">
          App
        </Link>
        {parts.map((p, i) => (
          <span key={p} className="flex items-center gap-1">
            <span>/</span>
            <span className={i === parts.length - 1 ? "font-medium text-foreground" : ""}>
              {crumbs[p] || p}
            </span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 text-muted-foreground md:inline-flex"
          onClick={() => setOpen(true)}
        >
          <Search className="h-3.5 w-3.5" />
          Buscar
          <kbd className="rounded border border-border bg-muted px-1.5 text-[10px]">⌘K</kbd>
        </Button>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
          <Search className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Alternar tema"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {demoUser.nome
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-sm">
              <p className="font-medium">{demoUser.nome}</p>
              <p className="text-xs text-muted-foreground">{demoUser.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/configuracoes">
                <User className="mr-2 h-4 w-4" /> Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracoes">
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar páginas, módulos…" />
        <CommandList>
          <CommandEmpty>Nenhum resultado.</CommandEmpty>
          <CommandGroup heading="Navegação">
            {commands.map((c) => (
              <CommandItem
                key={c.href}
                onSelect={() => {
                  setOpen(false);
                  router.push(c.href);
                }}
              >
                {c.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
