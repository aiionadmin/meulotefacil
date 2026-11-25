"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UNIDADES, whatsappUrl, INSTITUTIONAL } from "@/lib/institutional";
import { MapPin, MessageCircle } from "lucide-react";

const schema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Informe um telefone"),
  mensagem: z.string().min(10, "Escreva uma mensagem"),
});

type FormData = z.infer<typeof schema>;

export default function ContatoPage() {
  const [sent, setSent] = useState(false);
  const wa = whatsappUrl();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    // TODO: plugar envio real
    console.info("contato", data);
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    reset();
  };

  return (
    <div className="bg-paper pt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            Contato
          </p>
          <h1 className="font-display mt-3 text-3xl text-brand-navy sm:text-5xl">
            Fale com a gente
          </h1>
          <p className="mt-4 text-muted-foreground">
            WhatsApp principal:{" "}
            <a href={wa} className="font-semibold text-brand-orange hover:underline" target="_blank" rel="noopener noreferrer">
              {INSTITUTIONAL.whatsappPrimary.display}
            </a>
            . Instagram: {INSTITUTIONAL.instagram}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {UNIDADES.map((u) => {
            const unitWa = whatsappUrl(
              `Olá! Vim do site e gostaria de mais informações (unidade ${u.nome}).`,
              u.digits
            );
            const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.endereco)}`;
            return (
              <article
                key={u.id}
                className="flex flex-col rounded-2xl border border-brand-navy/8 bg-white p-5 shadow-sm"
              >
                <h2 className="font-bold text-brand-navy">{u.nome}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{u.endereco}</p>
                <p className="mt-2 text-sm font-medium">{u.telefone}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <a href={unitWa} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={maps} target="_blank" rel="noopener noreferrer">
                      <MapPin className="h-3.5 w-3.5" />
                      Como chegar
                    </a>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mt-16 max-w-xl space-y-4 rounded-2xl border border-brand-navy/8 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="font-display text-xl text-brand-navy">Envie uma mensagem</h2>
          {sent && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Mensagem registrada (demo). Prefira o WhatsApp para resposta mais rápida.
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
            {isSubmitting ? "Enviando…" : "Enviar"}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href={wa} target="_blank" rel="noopener noreferrer">
              Ou falar no WhatsApp
            </a>
          </Button>
        </form>
      </div>
    </div>
  );
}
