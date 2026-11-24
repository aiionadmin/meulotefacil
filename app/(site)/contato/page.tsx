"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Informe um telefone"),
  mensagem: z.string().min(10, "Escreva uma mensagem"),
});

type FormData = z.infer<typeof schema>;

export default function ContatoPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    // TODO: plugar envio real (Supabase / e-mail)
    console.info("contato mock", data);
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    reset();
  };

  return (
    <div className="bg-brand-cream pt-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            Contato
          </p>
          <h1 className="font-display mt-3 text-3xl text-brand-navy sm:text-5xl">
            Fale com a gente
          </h1>
          <p className="mt-4 text-muted-foreground">
            Tire dúvidas sobre empreendimentos, parcelas ou documentação. Um
            consultor retorna em breve.
          </p>
          <div className="mt-8 space-y-2 text-sm text-brand-ink">
            <p>WhatsApp: (11) 99999-9999</p>
            <p>E-mail: contato@meulotefacil.com.br</p>
            <p>Horário: seg–sex, 9h–18h</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-brand-navy/8 bg-white p-6 shadow-sm sm:p-8"
        >
          {sent && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Mensagem enviada (demo). Em breve um consultor entra em contato.
            </p>
          )}
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" className="mt-1.5" {...register("nome")} />
            {errors.nome && (
              <p className="mt-1 text-xs text-destructive">{errors.nome.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" className="mt-1.5" {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" className="mt-1.5" {...register("telefone")} />
            {errors.telefone && (
              <p className="mt-1 text-xs text-destructive">{errors.telefone.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="mensagem">Mensagem</Label>
            <textarea
              id="mensagem"
              rows={4}
              className="mt-1.5 flex w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
              {...register("mensagem")}
            />
            {errors.mensagem && (
              <p className="mt-1 text-xs text-destructive">{errors.mensagem.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando…" : "Enviar mensagem"}
          </Button>
        </form>
      </div>
    </div>
  );
}
