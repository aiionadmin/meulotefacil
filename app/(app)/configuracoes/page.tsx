"use client";

import { demoUser } from "@/lib/data/clientes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-navy dark:text-brand-cream">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Placeholders, {/* TODO: plugar Supabase */}
        </p>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Dados do usuário logado (demo)</CardDescription>
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
              <div>
                <Label>Papel</Label>
                <Input className="mt-1.5" defaultValue={demoUser.papel} disabled />
              </div>
              <Button className="w-fit">Salvar (placeholder)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Empresa</CardTitle>
              <CardDescription>Dados institucionais</CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-lg gap-4">
              <div>
                <Label>Razão social</Label>
                <Input className="mt-1.5" defaultValue="Meu Lote Fácil Ltda." />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input className="mt-1.5" defaultValue="00.000.000/0001-00" />
              </div>
              <div>
                <Label>WhatsApp comercial</Label>
                <Input className="mt-1.5" defaultValue="5511999999999" />
              </div>
              <Button className="w-fit">Salvar (placeholder)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Usuários e permissões</CardTitle>
              <CardDescription>
                Papéis: admin, corretor, cliente (tipagem + guard simples)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">Consultor Demo</p>
                  <p className="text-muted-foreground">admin</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">Corretor Exemplo</p>
                  <p className="text-muted-foreground">corretor</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="outline">Convidar usuário (placeholder)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>Supabase, WhatsApp e outros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Supabase</p>
                  <p className="text-sm text-muted-foreground">
                    Auth + Postgres, configure via .env
                  </p>
                </div>
                <Switch disabled />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">WhatsApp Business</p>
                  <p className="text-sm text-muted-foreground">
                    Link do simulador (query string)
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
