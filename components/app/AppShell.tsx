"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { DemoStoreProvider } from "@/lib/store/demo-store";
import { Fase1StoreProvider } from "@/lib/store/fase1-store";
import { CarteiraStoreProvider } from "@/lib/store/carteira-store";
import { OperacoesStoreProvider } from "@/lib/store/operacoes-store";
import { FluxoStoreProvider } from "@/lib/store/fluxo-store";
import { ObrasStoreProvider } from "@/lib/store/obras-store";
import { EmpresaProvider } from "@/lib/empresa/context";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Fase1StoreProvider>
        <EmpresaProvider>
          <CarteiraStoreProvider>
            <OperacoesStoreProvider>
              <FluxoStoreProvider>
                <ObrasStoreProvider>
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
                </ObrasStoreProvider>
              </FluxoStoreProvider>
            </OperacoesStoreProvider>
          </CarteiraStoreProvider>
        </EmpresaProvider>
      </Fase1StoreProvider>
    </ThemeProvider>
  );
}
