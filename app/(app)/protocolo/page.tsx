"use client";

import { useState } from "react";
import Link from "next/link";
import { processos, statusProcessoLabel } from "@/lib/data/processos";
import { faseLabel } from "@/lib/data/nucleos";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ModuleHeader,
  StatusPill,
} from "@/components/app/ModulePage";

export default function ProtocoloPage() {
  const [q, setQ] = useState("MLF-2026-0142");
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
      <ModuleHeader
        title="Consultar protocolo"
        description="Busque pelo número do protocolo para ver fase, status e documentos pendentes."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/processos">Lista de processos</Link>
          </Button>
        }
      />

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
          Protocolo não encontrado. Experimente MLF-2026-0142.
        </p>
      )}

      {found && (
        <Card className="max-w-xl border-linha">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-3">
              {found.protocolo}
              <StatusPill tone="info">
                {statusProcessoLabel[found.status]}
              </StatusPill>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-ink">
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
            <Button asChild size="sm" className="mt-3">
              <Link href="/documentos">Abrir documentos</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
