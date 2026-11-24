"use client";

import { useState } from "react";
import { clientes } from "@/lib/data/clientes";
import { lotes } from "@/lib/data/lotes";
import { contratos, documentos, parcelas } from "@/lib/data/clientes";
import type { Cliente } from "@/lib/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";

export default function ClientesPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Cliente | null>(null);

  const filtered = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(q.toLowerCase()) ||
      c.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Clientes
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastro e histórico · {/* TODO: plugar Supabase */}
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Lista</CardTitle>
          <Input
            placeholder="Buscar cliente…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">E-mail</th>
                <th className="px-3 py-2">Telefone</th>
                <th className="px-3 py-2">Desde</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="px-3 py-3 font-medium">{c.nome}</td>
                  <td className="px-3 py-3">{c.email}</td>
                  <td className="px-3 py-3">{c.telefone}</td>
                  <td className="px-3 py-3">{c.criadoEm}</td>
                  <td className="px-3 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelected(c)}>
                      Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.nome}</SheetTitle>
              </SheetHeader>
              <Tabs defaultValue="dados" className="mt-6">
                <TabsList>
                  <TabsTrigger value="dados">Dados</TabsTrigger>
                  <TabsTrigger value="lotes">Lotes</TabsTrigger>
                  <TabsTrigger value="contratos">Contratos</TabsTrigger>
                  <TabsTrigger value="parcelas">Parcelas</TabsTrigger>
                  <TabsTrigger value="docs">Docs</TabsTrigger>
                </TabsList>
                <TabsContent value="dados" className="space-y-2 text-sm">
                  <p>E-mail: {selected.email}</p>
                  <p>Telefone: {selected.telefone}</p>
                  <p>CPF: {selected.cpf}</p>
                  <p>Desde: {selected.criadoEm}</p>
                </TabsContent>
                <TabsContent value="lotes" className="space-y-2 text-sm">
                  {selected.lotesIds.length === 0 && <p>Nenhum lote vinculado.</p>}
                  {selected.lotesIds.map((id) => {
                    const l = lotes.find((x) => x.id === id);
                    return l ? (
                      <p key={id}>
                        Quadra {l.quadra}/{l.numero} · {formatCurrency(l.valor)}
                      </p>
                    ) : null;
                  })}
                </TabsContent>
                <TabsContent value="contratos" className="space-y-2 text-sm">
                  {contratos
                    .filter((c) => c.clienteNome === selected.nome)
                    .map((c) => (
                      <p key={c.id}>
                        {c.loteLabel} · {c.status}
                      </p>
                    ))}
                  {!contratos.some((c) => c.clienteNome === selected.nome) && (
                    <p>Nenhum contrato.</p>
                  )}
                </TabsContent>
                <TabsContent value="parcelas" className="space-y-2 text-sm">
                  {parcelas
                    .filter((p) => p.clienteNome === selected.nome)
                    .map((p) => (
                      <p key={p.id}>
                        {p.numero}/{p.totalParcelas} · {formatCurrency(p.valor)} ·{" "}
                        {p.status}
                      </p>
                    ))}
                  {!parcelas.some((p) => p.clienteNome === selected.nome) && (
                    <p>Nenhuma parcela.</p>
                  )}
                </TabsContent>
                <TabsContent value="docs" className="space-y-2 text-sm">
                  {documentos
                    .filter((d) => d.relacionadoA === selected.nome)
                    .map((d) => (
                      <p key={d.id}>
                        {d.nome} · {d.tamanho}
                      </p>
                    ))}
                  {!documentos.some((d) => d.relacionadoA === selected.nome) && (
                    <p>Nenhum documento.</p>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
