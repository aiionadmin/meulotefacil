"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Deep-link `/gestao/[obra]` → lista de gestão com obra pré-selecionada via query. */
export default function GestaoObraDeepLinkPage() {
  const params = useParams<{ obra: string }>();
  const router = useRouter();

  useEffect(() => {
    const obra = params.obra;
    if (obra) {
      router.replace(`/gestao?obra=${encodeURIComponent(obra)}`);
    } else {
      router.replace("/gestao");
    }
  }, [params.obra, router]);

  return (
    <p className="p-6 text-sm text-ink/70">Abrindo gestão da obra…</p>
  );
}
