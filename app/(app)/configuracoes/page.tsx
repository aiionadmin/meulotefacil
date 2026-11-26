"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModuleHeader } from "@/components/app/ModulePage";

const GRUPOS = [
  {
    href: "/configuracoes/empresa",
    titulo: "Empresa",
    desc: "Dados cadastrais, logotipo e responsável",
  },
  {
    href: "/configuracoes/parametros/encargos",
    titulo: "Encargos",
    desc: "Mora, multa e regras por empreendimento",
  },
  {
    href: "/configuracoes/parametros/caixa",
    titulo: "Caixa",
    desc: "Recibo, autenticação e estorno",
  },
  {
    href: "/configuracoes/parametros/vendas",
    titulo: "Vendas",
    desc: "Plano automático, parcelas e comissão",
  },
  {
    href: "/configuracoes/parametros/boletos",
    titulo: "Boletos",
    desc: "Mensagens, nosso número e travas",
  },
  {
    href: "/configuracoes/parametros/reajuste",
    titulo: "Reajuste",
    desc: "Tipos, base anual e resíduo",
  },
  {
    href: "/configuracoes/parametros/financeiro",
    titulo: "Financeiro",
    desc: "Provisionamento e documento obrigatório",
  },
  {
    href: "/configuracoes/parametros/compras",
    titulo: "Compras",
    desc: "Numeração e ordem sem cotação",
  },
  {
    href: "/configuracoes/parametros/obras",
    titulo: "Obras",
    desc: "Expediente, BDI e arredondamento",
  },
  {
    href: "/configuracoes/parametros/aparencia",
    titulo: "Aparência",
    desc: "Cores da planta e máscara do lote",
  },
] as const;

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Parâmetros"
        description="Cada grupo abre uma tela funcional. Usuários, perfis, alçadas e listas ficam no menu ao lado."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {GRUPOS.map((g) => (
          <Card key={g.href}>
            <CardHeader>
              <CardTitle className="text-base">{g.titulo}</CardTitle>
              <CardDescription>{g.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" asChild>
                <Link href={g.href}>Abrir</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
