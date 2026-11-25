"use client";

import Link from "next/link";
import { demoUser } from "@/lib/data/clientes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleHeader } from "@/components/app/ModulePage";
import { configGrupos } from "@/lib/data/sistema";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Configurações e parâmetros"
        description="Empresa, encargos, caixa, vendas, boletos, reajuste, financeiro, compras, obras e aparência (~75 chaves do LoteWin a validar com o cliente)."
      />

      <Tabs defaultValue="parametros">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="parametros" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {configGrupos.map((g) => (
              <Card key={g.grupo}>
                <CardHeader>
                  <CardTitle className="text-base">{g.grupo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {g.itens.map((item) => (
                    <label
                      key={item}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span>{item}</span>
                      <Switch defaultChecked />
                    </label>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Usuário logado (demo)</CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-lg gap-4">
              <div>
                <Label>Nome</Label>
                <Input className="mt-1.5" defaultValue={demoUser.nome} />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input className="mt-1.5" defaultValue={demoUser.email} />
              </div>
              <Button type="button" className="w-fit">
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Empresa</CardTitle>
              <CardDescription>
                Mais de um CNPJ na mesma conta, com seletor
              </CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-lg gap-4">
              <div>
                <Label>Razão social</Label>
                <Input className="mt-1.5" defaultValue="Meu Lote Fácil Ltda" />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input className="mt-1.5" placeholder="00.000.000/0001-00" />
              </div>
              <div>
                <Label>Advogado (OAB)</Label>
                <Input className="mt-1.5" placeholder="Nome · CPF · OAB" />
              </div>
              <Button type="button" className="w-fit">
                Salvar empresa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>
                Cada uma é projeto à parte (relatório §10)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Open Finance / conciliação bancária",
                "Remessa e retorno de boletos",
                "NFe / NFSe + certificado digital",
                "WhatsApp",
                "Exportação contábil",
                "DIMOB / SPED",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between border-b border-linha py-2 last:border-0"
                >
                  <span>{item}</span>
                  <Button asChild variant="outline" size="sm" arrow={false}>
                    <Link href="/configuracoes">Configurar</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
