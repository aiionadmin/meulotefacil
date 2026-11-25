"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import { pessoasMock } from "@/lib/data/sistema";

export default function PessoasPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Pessoas"
        description="Cadastro único com papéis: cliente, comprador, fornecedor, profissional, corretor e sócio. Inclui dados civis, cônjuge, procurador, contatos e mala direta."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/pessoas">Importar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/pessoas">Nova pessoa</Link>
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Pessoas", value: pessoasMock.length },
          {
            label: "Compradores",
            value: pessoasMock.filter((p) => p.papeis.includes("Comprador")).length,
          },
          {
            label: "Fornecedores",
            value: pessoasMock.filter((p) => p.papeis.includes("Fornecedor")).length,
          },
          {
            label: "Corretores",
            value: pessoasMock.filter((p) => p.papeis.includes("Corretor")).length,
          },
        ]}
      />
      <DataTable
        columns={[
          { key: "nome", label: "Nome / razão social" },
          { key: "doc", label: "CPF/CNPJ" },
          { key: "papeis", label: "Papéis" },
          { key: "cidade", label: "Cidade" },
          { key: "contato", label: "Contato" },
          { key: "status", label: "Status" },
        ]}
        rows={pessoasMock.map((p) => ({
          nome: <span className="font-medium">{p.nome}</span>,
          doc: p.doc,
          papeis: p.papeis.join(", "),
          cidade: p.cidade,
          contato: p.contato,
          status: (
            <StatusPill tone={p.status === "Ativo" ? "ok" : "warn"}>
              {p.status}
            </StatusPill>
          ),
        }))}
      />
    </div>
  );
}
