"use client";

import { useEffect } from "react";

/** B11 — título da aba: "Nome da tela · Meu Lote Fácil" */
export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} · Meu Lote Fácil`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
