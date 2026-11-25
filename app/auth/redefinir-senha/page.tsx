"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    password: z.string().min(8, "Mínimo de 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    if (supabase) {
      const { error: authError } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
    }
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/auth/login"), 1500);
  };

  return (
    <div className="rounded-sm border border-linha bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-display text-2xl text-ink">Redefinir senha</h1>
      <p className="mt-1 text-sm text-ink/75">
        Escolha uma nova senha para sua conta.
      </p>

      {done ? (
        <p className="mt-6 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          Senha atualizada! Redirecionando para o login…
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="password">Nova senha</Label>
            <Input id="password" type="password" className="mt-1.5" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirm">Confirmar senha</Label>
            <Input id="confirm" type="password" className="mt-1.5" {...register("confirm")} />
            {errors.confirm && (
              <p className="mt-1 text-xs text-destructive">{errors.confirm.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando…" : "Salvar nova senha"}
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
