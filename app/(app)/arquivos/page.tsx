"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import { arquivosMock } from "@/lib/data/sistema";

export default function ArquivosPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Arquivos"
        description="Anexos em qualquer cadastro (até 10 MB) com tag e repositório central filtrável por período, rotina, tipo e tag."
        actions={
          <Button asChild size="sm">
            <Link href="/arquivos">Enviar arquivo</Link>
          </Button>
        }
      />
      <DataTable
        columns={[
          { key: "nome", label: "Arquivo" },
          { key: "rotina", label: "Rotina" },
          { key: "tag", label: "Tag" },
          { key: "tamanho", label: "Tamanho" },
          { key: "quando", label: "Data" },
        ]}
        rows={arquivosMock.map((a) => ({
          nome: <span className="font-medium">{a.nome}</span>,
          rotina: a.rotina,
          tag: <StatusPill tone="neutral">{a.tag}</StatusPill>,
          tamanho: a.tamanho,
          quando: a.quando,
        }))}
      />
    </div>
  );
}
