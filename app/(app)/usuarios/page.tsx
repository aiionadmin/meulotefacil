"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { usuariosMock, auditoriaMock } from "@/lib/data/sistema";

export default function UsuariosPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Usuários, perfis e auditoria"
        description="Login, perfis por rotina (visualizar, inserir/alterar, remover), visibilidade por empresa/obra/conta, alçadas e histórico de alterações."
        actions={
          <Button asChild size="sm">
            <Link href="/usuarios">Novo usuário</Link>
          </Button>
        }
      />
      <KpiGrid
        items={[
          { label: "Usuários", value: usuariosMock.length },
          { label: "Perfis ativos", value: 4 },
          { label: "Alçadas", value: "Compras · Conciliação · Relatórios" },
          { label: "Empresas (CNPJ)", value: 2 },
        ]}
      />
      <ModuleSection title="Usuários">
        <DataTable
          columns={[
            { key: "nome", label: "Nome" },
            { key: "email", label: "E-mail" },
            { key: "perfil", label: "Perfil" },
            { key: "chave", label: "Usuário-chave" },
            { key: "status", label: "Status" },
          ]}
          rows={usuariosMock.map((u) => ({
            nome: <span className="font-medium">{u.nome}</span>,
            email: u.email,
            perfil: u.perfil,
            chave: u.chave ? "Sim" : "Não",
            status: <StatusPill tone="ok">{u.status}</StatusPill>,
          }))}
        />
      </ModuleSection>
      <ModuleSection title="Auditoria recente">
        <DataTable
          columns={[
            { key: "quando", label: "Quando" },
            { key: "usuario", label: "Usuário" },
            { key: "rotina", label: "Rotina" },
            { key: "acao", label: "Ação" },
          ]}
          rows={auditoriaMock.map((a) => ({
            quando: a.quando,
            usuario: a.usuario,
            rotina: a.rotina,
            acao: a.acao,
          }))}
        />
      </ModuleSection>
    </div>
  );
}
