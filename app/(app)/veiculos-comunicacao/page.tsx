"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
  KpiGrid,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  notify,
} from "@/components/app/ModuleToolkit";
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
        description="Origem da venda (H13) com relatório de quantidade."
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
              Exportar
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Novo veículo
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Veículos", value: itens.length },
          { label: "Ativos", value: itens.filter((v) => v.ativo).length },
          {
            label: "Vendas atribuídas",
            value: itens.reduce((a, v) => a + v.vendas, 0),
          },
        ]}
      />
      <DataTable
        columns={[
          { key: "nome", label: "Nome" },
          { key: "vendas", label: "Vendas" },
          { key: "status", label: "Status" },
          { key: "acao", label: "" },
        ]}
        rows={itens.map((v) => ({
          nome: v.nome,
          vendas: String(v.vendas),
          status: (
            <StatusPill tone={v.ativo ? "ok" : "neutral"}>
              {v.ativo ? "Ativo" : "Inativo"}
            </StatusPill>
          ),
          acao: (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setItens((list) =>
                  list.map((x) =>
                    x.id === v.id ? { ...x, ativo: !x.ativo } : x
                  )
                )
              }
            >
              Alternar
            </Button>
          ),
        }))}
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
            {
              id: `vc-${Date.now()}`,
              nome: nome.trim(),
              ativo: true,
              vendas: 0,
            },
            ...list,
          ]);
          notify("Veículo criado", nome);
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
