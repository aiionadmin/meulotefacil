"use client";

import { useState } from "react";
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
import { notify } from "@/components/app/ModuleToolkit";
import { configGrupos } from "@/lib/data/sistema";
import { useDemoStore } from "@/lib/store/demo-store";

export default function ConfiguracoesPage() {
  const { state, setConfigToggle, saveEmpresa, savePerfil, reset } =
    useDemoStore();
  const [perfil, setPerfil] = useState(state.perfil);
  const [empresa, setEmpresa] = useState(state.empresa);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Configurações e parâmetros"
        description="Empresa, encargos, caixa, vendas, boletos, reajuste, financeiro, compras, obras e aparência."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              reset();
              notify("Dados demo restaurados");
            }}
          >
            Restaurar demo
          </Button>
        }
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
                  {g.itens.map((item) => {
                    const key = `${g.grupo}::${item}`;
                    return (
                      <label
                        key={item}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span>{item}</span>
                        <Switch
                          checked={state.configToggles[key] ?? true}
                          onCheckedChange={(v) => {
                            setConfigToggle(key, v);
                            notify(
                              v ? "Parâmetro ativado" : "Parâmetro desativado",
                              item
                            );
                          }}
                        />
                      </label>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Usuário logado (demo persistente)</CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-lg gap-4">
              <div>
                <Label>Nome</Label>
                <Input
                  className="mt-1.5"
                  value={perfil.nome}
                  onChange={(e) =>
                    setPerfil({ ...perfil, nome: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  className="mt-1.5"
                  value={perfil.email}
                  onChange={(e) =>
                    setPerfil({ ...perfil, email: e.target.value })
                  }
                />
              </div>
              <Button
                type="button"
                className="w-fit"
                onClick={() => {
                  savePerfil(perfil);
                  notify("Perfil salvo");
                }}
              >
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
                Dados cadastrais e responsável jurídico
              </CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-lg gap-4">
              <div>
                <Label>Razão social</Label>
                <Input
                  className="mt-1.5"
                  value={empresa.razao}
                  onChange={(e) =>
                    setEmpresa({ ...empresa, razao: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input
                  className="mt-1.5"
                  value={empresa.cnpj}
                  onChange={(e) =>
                    setEmpresa({ ...empresa, cnpj: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Advogado (OAB)</Label>
                <Input
                  className="mt-1.5"
                  value={empresa.oab}
                  onChange={(e) =>
                    setEmpresa({ ...empresa, oab: e.target.value })
                  }
                />
              </div>
              <Button
                type="button"
                className="w-fit"
                onClick={() => {
                  saveEmpresa(empresa);
                  notify("Empresa salva");
                }}
              >
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                nome: "Supabase Auth",
                status: "Opcional",
                detalhe: "Login real quando variáveis estiverem configuradas",
              },
              {
                nome: "Sicredi CNAB",
                status: "Demo",
                detalhe: "Remessa/retorno simulados em Boletos",
              },
              {
                nome: "NFSe municipal",
                status: "Demo",
                detalhe: "Emissão local no módulo Fiscal",
              },
              {
                nome: "Open Finance",
                status: "Planejado",
                detalhe: "Conciliação bancária automática",
              },
            ].map((i) => (
              <Card key={i.nome}>
                <CardHeader>
                  <CardTitle className="text-base">{i.nome}</CardTitle>
                  <CardDescription>{i.status}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {i.detalhe}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
