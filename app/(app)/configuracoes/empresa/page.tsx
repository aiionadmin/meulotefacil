"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";
import { maskCNPJ, maskPhone } from "@/lib/masks/br";
import { useFase1 } from "@/lib/store/fase1-store";

export default function EmpresaPage() {
  const { state, saveOrganization } = useFase1();
  const [form, setForm] = useState(state.organization);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Empresa"
        description="Dados cadastrais, CNPJ e responsável jurídico (multiempresa na sequência)."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Organização ativa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Razão social">
            <Input
              value={form.razaoSocial}
              onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
            />
          </Field>
          <Field label="Nome fantasia">
            <Input
              value={form.nomeFantasia}
              onChange={(e) =>
                setForm({ ...form, nomeFantasia: e.target.value })
              }
            />
          </Field>
          <Field label="CNPJ">
            <Input
              value={form.cnpj}
              onChange={(e) =>
                setForm({ ...form, cnpj: maskCNPJ(e.target.value) })
              }
            />
          </Field>
          <Field label="Telefone">
            <Input
              value={form.telefone}
              onChange={(e) =>
                setForm({ ...form, telefone: maskPhone(e.target.value) })
              }
            />
          </Field>
          <Field label="E-mail">
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Advogado (OAB)">
            <Input
              value={`${form.advogadoNome} · ${form.advogadoOab}`}
              onChange={(e) => {
                const [nome, oab] = e.target.value.split("·").map((s) => s.trim());
                setForm({
                  ...form,
                  advogadoNome: nome || form.advogadoNome,
                  advogadoOab: oab || form.advogadoOab,
                });
              }}
            />
          </Field>
          <Button
            className="w-fit"
            onClick={() => {
              saveOrganization(form);
              notify("Empresa salva");
            }}
          >
            Salvar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
