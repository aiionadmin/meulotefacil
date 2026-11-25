"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
});

type FormData = z.infer<typeof schema>;

export default function RecuperarSenhaPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/redefinir-senha`,
      });
    }
    // Sempre mostra sucesso (demo ou real) para não vazar e-mails
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="rounded-sm border border-linha bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-display text-2xl text-ink">Recuperar senha</h1>
      <p className="mt-1 text-sm text-ink/75">
        Enviaremos um link para redefinir sua senha.
      </p>

      {sent ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
            Se o e-mail existir em nossa base, você receberá as instruções em
            instantes. (Em modo demo, nenhum e-mail é enviado.)
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Voltar ao login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" className="mt-1.5" {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando…" : "Enviar link"}
          </Button>
          <p className="text-center text-sm">
            <Link href="/auth/login" className="text-brand-accent-strong hover:underline">
              Voltar ao login
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
