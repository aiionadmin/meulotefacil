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
import { useSystemSettings } from "@/lib/store/system-settings-store";

const GRUPOS = [
  {
    href: "/configuracoes/indices",
    titulo: "Índices",
    desc: "Índice a usar, catálogo e correção por atraso",
  },
  {
    href: "/configuracoes/parametros/vendas",
    titulo: "Vendas e reserva",
    desc: "Dias de reserva, plano, campos e comissão",
  },
  {
    href: "/configuracoes/parametros/encargos",
    titulo: "Encargos",
    desc: "Mora, multa e regras por empreendimento",
  },
  {
    href: "/configuracoes/parametros/reajuste",
    titulo: "Reajuste",
    desc: "Índice padrão, base anual e resíduo",
  },
  {
    href: "/configuracoes/parametros/caixa",
    titulo: "Caixa",
    desc: "Recibo, autenticação e estorno",
  },
  {
    href: "/configuracoes/parametros/boletos",
    titulo: "Boletos",
    desc: "Mensagens, nosso número e travas",
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
  {
    href: "/configuracoes/empresa",
    titulo: "Empresa",
    desc: "Dados cadastrais, logotipo e responsável",
  },
  {
    href: "/configuracoes/parametros/integracoes",
    titulo: "Integrações",
    desc: "NFSe, Sefaz, e-mail, WhatsApp e banco (stubs)",
  },
] as const;

export default function ConfiguracoesPage() {
  const { indicePadrao, validadeReservaDias } = useSystemSettings();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Parâmetros e regras"
        description="Todas as regras editáveis do sistema — índice, validade da reserva, encargos, vendas e demais grupos. Persistidos por organização."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Índice a usar</CardDescription>
            <CardTitle className="text-2xl">{indicePadrao}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" asChild>
              <Link href="/configuracoes/indices">Alterar</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reserva de lote</CardDescription>
            <CardTitle className="text-2xl">
              {validadeReservaDias} dia{validadeReservaDias === 1 ? "" : "s"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" asChild>
              <Link href="/configuracoes/parametros/vendas">Alterar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

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
