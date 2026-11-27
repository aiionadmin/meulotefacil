"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { DemoStoreProvider } from "@/lib/store/demo-store";
import { Fase1StoreProvider } from "@/lib/store/fase1-store";
import { CarteiraStoreProvider } from "@/lib/store/carteira-store";
import { OperacoesStoreProvider } from "@/lib/store/operacoes-store";
import { FluxoStoreProvider } from "@/lib/store/fluxo-store";
import { ObrasStoreProvider } from "@/lib/store/obras-store";
import { ComprasStoreProvider } from "@/lib/store/compras-store";
import { FinanceiroStoreProvider } from "@/lib/store/financeiro-store";
import { Parte5StoreProvider } from "@/lib/store/parte5-store";
import { UiStoreProvider } from "@/lib/store/ui-store";
import { SystemSettingsStoreProvider } from "@/lib/store/system-settings-store";
import { ClientCardProvider } from "@/lib/client/client-card-context";
import { ClientCardSheet } from "@/components/client/ClientCardSheet";
import { EmpresaProvider } from "@/lib/empresa/context";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";
import { DialogLockGuard } from "./DialogLockGuard";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Fase1StoreProvider>
        <EmpresaProvider>
          <SystemSettingsStoreProvider>
          <CarteiraStoreProvider>
            <OperacoesStoreProvider>
              <FluxoStoreProvider>
                <ObrasStoreProvider>
                  <ComprasStoreProvider>
                  <FinanceiroStoreProvider>
                  <Parte5StoreProvider>
                  <UiStoreProvider>
                    <ClientCardProvider>
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
                          {mobileOpen ? (
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
                          ) : null}
                        </Sheet>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <AppTopbar onMenu={() => setMobileOpen(true)} />
                          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {children}
                          </main>
                        </div>
                      </div>
                      <Toaster richColors position="top-right" closeButton />
                      <DialogLockGuard />
                      <ClientCardSheet />
                    </DemoStoreProvider>
                    </ClientCardProvider>
                  </UiStoreProvider>
                  </Parte5StoreProvider>
                  </FinanceiroStoreProvider>
                  </ComprasStoreProvider>
                </ObrasStoreProvider>
              </FluxoStoreProvider>
            </OperacoesStoreProvider>
          </CarteiraStoreProvider>
          </SystemSettingsStoreProvider>
        </EmpresaProvider>
      </Fase1StoreProvider>
    </ThemeProvider>
  );
}
