"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Menu,
  Moon,
  Plus,
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
import { createClient } from "@/lib/supabase/client";
import { clearDemoSession } from "@/lib/auth-demo";
import { APP_FLAT_NAV, NOVO_ATALHOS } from "@/lib/app-nav";
import { useFase1 } from "@/lib/store/fase1-store";
import { useEmpresa } from "@/lib/empresa/context";
import { useClientCard } from "@/lib/client/client-card-context";
import { fieldControlClass } from "@/components/app/ModuleToolkit";
import { cn } from "@/lib/utils";

const crumbs: Record<string, string> = Object.fromEntries(
  APP_FLAT_NAV.map((i) => [i.href.replace(/^\//, ""), i.label])
);

const commands = APP_FLAT_NAV.map((i) => ({
  href: i.href,
  label: `${i.label} · ${i.group}`,
}));

export function AppTopbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { currentUser, currentProfileName, state, can } = useFase1();
  const { empresas, selectedId, selected, setSelectedId } = useEmpresa();
  const { openClient } = useClientCard();
  const [open, setOpen] = useState(false);
  const parts = pathname.split("/").filter(Boolean);
  const unread = state.notifications.filter((n) => !n.lida).length;
  const novoLiberados = NOVO_ATALHOS.filter((a) =>
    can(a.rotina, "inserirAlterar")
  );

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
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="hidden text-sm text-muted-foreground sm:flex sm:items-center sm:gap-1">
        <Link href="/dashboard" className="hover:text-brand-orange">
          Sistema
        </Link>
        {parts.map((p, i) => (
          <span key={`${p}-${i}`} className="flex items-center gap-1">
            <span>/</span>
            <span
              className={
                i === parts.length - 1 ? "font-medium text-foreground" : ""
              }
            >
              {crumbs[parts.slice(0, i + 1).join("/")] ||
                crumbs[p] ||
                p}
            </span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <label className="flex min-w-0 items-center gap-1.5">
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            Empresa
          </span>
          <select
            className={cn(
              fieldControlClass,
              "h-8 max-w-[42vw] py-0 text-xs sm:w-[200px] sm:max-w-none"
            )}
            value={selectedId}
            onChange={(e) =>
              setSelectedId(e.target.value as string | "todas")
            }
            aria-label="Selecionar empresa"
            title={
              selected
                ? `${selected.nome} · ${selected.cnpj}`
                : "Todas as empresas"
            }
          >
            <option value="todas">Todas as empresas</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </label>
        {novoLiberados.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="inline-flex">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[70vh] overflow-y-auto">
              {novoLiberados.map((a) => (
                <DropdownMenuItem key={`${a.label}:${a.href}`} asChild>
                  <Link href={a.href}>{a.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 text-muted-foreground md:inline-flex"
          onClick={() => setOpen(true)}
        >
          <Search className="h-3.5 w-3.5" />
          Buscar
          <kbd className="rounded border border-border bg-muted px-1.5 text-[10px]">
            ⌘K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificações"
          asChild
        >
          <Link href="/notificacoes" className="relative">
            <Bell className="h-4 w-4" />
            {unread > 0 ? (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand-accent-strong" />
            ) : null}
          </Link>
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
            <button
              type="button"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {(currentUser?.nome ?? "AD")
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
              <p className="font-medium">{currentUser?.nome ?? "Demo"}</p>
              <p className="text-xs text-muted-foreground">
                {currentUser?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentProfileName}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/configuracoes/empresa">
                <User className="mr-2 h-4 w-4" /> Empresa
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
        <CommandInput placeholder="Buscar páginas, pessoa, CPF…" />
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
          <CommandGroup heading="Pessoas">
            {state.people.slice(0, 8).map((p) => (
              <CommandItem
                key={p.id}
                onSelect={() => {
                  setOpen(false);
                  openClient({
                    nome: p.nome,
                    documento: p.documento,
                    personId: p.id,
                    tab: "resumo",
                  });
                }}
              >
                {p.nome} · {p.documento}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
