"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { releaseDialogLock } from "@/lib/ui/release-dialog-lock";

export type ClientCardTab =
  | "resumo"
  | "cadastro"
  | "conversas"
  | "proposta"
  | "contrato"
  | "parcelas"
  | "boletos"
  | "cobranca"
  | "juridico"
  | "regularizacao"
  | "documentos"
  | "historico";

export type ClientCardRef = {
  /** Nome legível do cliente */
  nome: string;
  /** Documento (CPF/CNPJ) quando conhecido */
  documento?: string;
  personId?: string;
  leadId?: string;
  contractId?: string;
  collectionCaseId?: string;
  regularizationId?: string;
  tab?: ClientCardTab;
};

type ClientCardApi = {
  open: ClientCardRef | null;
  openClient: (ref: ClientCardRef) => void;
  closeClient: () => void;
};

const Ctx = createContext<ClientCardApi | null>(null);

export function ClientCardProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<ClientCardRef | null>(null);
  const pathname = usePathname();

  const openClient = useCallback((ref: ClientCardRef) => {
    setOpen(ref);
  }, []);

  const closeClient = useCallback(() => {
    setOpen(null);
    queueMicrotask(releaseDialogLock);
  }, []);

  // Close card on navigation so Sheet doesn't unmount mid-open.
  useEffect(() => {
    setOpen(null);
    releaseDialogLock();
  }, [pathname]);

  const value = useMemo(
    () => ({ open, openClient, closeClient }),
    [open, openClient, closeClient]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClientCard() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useClientCard must be used within ClientCardProvider");
  }
  return ctx;
}
