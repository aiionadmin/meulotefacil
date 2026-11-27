"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * Abre o formulário de cadastro quando a URL traz `?novo=1`
 * (atalhos do botão Novo no topo).
 */
export function useNovoParam(
  initial = false
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [open, setOpen] = useState(initial);

  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("novo") === "1") {
        setOpen(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  return [open, setOpen];
}
