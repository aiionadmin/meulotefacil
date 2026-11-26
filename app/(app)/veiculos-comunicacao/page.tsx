"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  StatusPill,
  KpiGrid,
} from "@/components/app/ModulePage";
import { Field, FormDialog, notify } from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { downloadCsv } from "@/lib/export/list-export";

type Veiculo = {
  id: string;
  nome: string;
  ativo: boolean;
  vendas: number;
};

const SEED: Veiculo[] = [
  { id: "vc-1", nome: "Indicação", ativo: true, vendas: 12 },
  { id: "vc-2", nome: "WhatsApp", ativo: true, vendas: 28 },
  { id: "vc-3", nome: "Anúncio Facebook", ativo: true, vendas: 9 },
  { id: "vc-4", nome: "Placa na obra", ativo: true, vendas: 4 },
  { id: "vc-5", nome: "Corretor parceiro", ativo: false, vendas: 2 },
];

export default function VeiculosComunicacaoPage() {
  const [itens, setItens] = useState(SEED);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Veículos de comunicação"
        description="H13 — origem da venda; lista filtrável (C14/C15)."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadCsv(
                  "veiculos-comunicacao.csv",
                  ["nome", "ativo", "vendas"],
                  itens.map((v) => [
                    v.nome,
                    v.ativo ? "sim" : "nao",
                    v.vendas,
                  ])
                );
                notify("Relatório exportado");
              }}
            >
              Excel
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Novo veículo
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Ativos", value: itens.filter((v) => v.ativo).length },
          {
            label: "Vendas atribuídas",
            value: itens.reduce((a, v) => a + v.vendas, 0),
          },
        ]}
      />
      <ProcessList
        storageKey="veiculos-comms"
        exportName="veiculos-comunicacao"
        rows={itens}
        empty="Nenhum veículo."
        bulkActions={[
          {
            label: "Ativar seleção",
            onClick: (ids) => {
              setItens((list) =>
                list.map((v) =>
                  ids.includes(v.id) ? { ...v, ativo: true } : v
                )
              );
              notify(`${ids.length} ativado(s)`);
            },
          },
          {
            label: "Desativar seleção",
            onClick: (ids) => {
              setItens((list) =>
                list.map((v) =>
                  ids.includes(v.id) ? { ...v, ativo: false } : v
                )
              );
              notify(`${ids.length} desativado(s)`);
            },
          },
        ]}
        columns={[
          {
            key: "nome",
            label: "Nome",
            filter: { type: "text" },
            getValue: (v) => v.nome,
          },
          {
            key: "vendas",
            label: "Vendas",
            filter: { type: "range" },
            getValue: (v) => v.vendas,
          },
          {
            key: "ativo",
            label: "Ativo",
            filter: {
              type: "status",
              options: [
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ],
            },
            getValue: (v) => (v.ativo ? "sim" : "nao"),
            render: (v) => (
              <StatusPill tone={v.ativo ? "ok" : "neutral"}>
                {v.ativo ? "Sim" : "Não"}
              </StatusPill>
            ),
          },
        ]}
      />
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo veículo"
        onSubmit={() => {
          if (!nome.trim()) {
            notify("Nome obrigatório");
            return;
          }
          setItens((list) => [
            ...list,
            {
              id: `vc-${Date.now()}`,
              nome: nome.trim(),
              ativo: true,
              vendas: 0,
            },
          ]);
          notify("Veículo criado", nome.trim());
          setNome("");
          setOpen(false);
        }}
      >
        <Field label="Nome *">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </Field>
      </FormDialog>
    </div>
  );
}
