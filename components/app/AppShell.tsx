"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { DemoStoreProvider } from "@/lib/store/demo-store";
import { Fase1StoreProvider } from "@/lib/store/fase1-store";
import { CarteiraStoreProvider } from "@/lib/store/carteira-store";
import { OperacoesStoreProvider } from "@/lib/store/operacoes-store";
import { FluxoStoreProvider } from "@/lib/store/fluxo-store";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Remove dark residual (toggle antigo) — o sistema fica em tema claro legível
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try {
      localStorage.removeItem("theme");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ThemeProvider attribute="class" forcedTheme="light" defaultTheme="light" enableSystem={false}>
      <Fase1StoreProvider>
        <CarteiraStoreProvider>
          <OperacoesStoreProvider>
            <FluxoStoreProvider>
              <DemoStoreProvider>
                <div className="flex h-svh overflow-hidden bg-background text-foreground">
                  <div className="hidden lg:block">
                    <AppSidebar
                      collapsed={collapsed}
                      onToggle={() => setCollapsed((v) => !v)}
                      papel="admin"
                    />
                  </div>

                  <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent
                      side="left"
                      className="w-72 border-0 bg-transparent p-0"
                    >
                      <AppSidebar
                        collapsed={false}
                        onToggle={() => undefined}
                        mobile
                        onNavigate={() => setMobileOpen(false)}
                      />
                    </SheetContent>
                  </Sheet>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <AppTopbar onMenu={() => setMobileOpen(true)} />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                      {children}
                    </main>
                  </div>
                </div>
                <Toaster richColors position="top-right" closeButton />
              </DemoStoreProvider>
            </FluxoStoreProvider>
          </OperacoesStoreProvider>
        </CarteiraStoreProvider>
      </Fase1StoreProvider>
    </ThemeProvider>
  );
}
