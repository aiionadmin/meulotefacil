"use client";

import { useState } from "react";
import { processos, statusProcessoLabel } from "@/lib/data/processos";
import { faseLabel } from "@/lib/data/nucleos";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProtocoloPage() {
  const [q, setQ] = useState("");
  const [found, setFound] = useState<(typeof processos)[0] | null | undefined>(
    undefined
  );

  const buscar = () => {
    const hit = processos.find(
      (p) => p.protocolo.toLowerCase() === q.trim().toLowerCase()
    );
    setFound(hit ?? null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Consultar protocolo
        </h1>
        <p className="text-sm text-muted-foreground">
          Informe o número do protocolo, {/* TODO: plugar Supabase */}
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Busca</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Ex.: MLF-2026-0142"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
          />
          <Button onClick={buscar}>Buscar</Button>
        </CardContent>
      </Card>

      {found === null && (
        <p className="text-sm text-muted-foreground">
          Protocolo não encontrado nos mocks. Experimente MLF-2026-0142.
        </p>
      )}

      {found && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {found.protocolo}
              <Badge variant="secondary">{statusProcessoLabel[found.status]}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Núcleo:</span>{" "}
              <strong>{found.nucleoNome}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Morador:</span>{" "}
              <strong>{found.moradorNome}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Fase:</span>{" "}
              <strong>{faseLabel[found.fase]}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Atualizado em:</span>{" "}
              {found.atualizadoEm}
            </p>
            <p>
              <span className="text-muted-foreground">Docs pendentes:</span>{" "}
              {found.docsPendentes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
