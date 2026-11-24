"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { setDemoSession } from "@/lib/auth-demo";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "demo@meulotefacil.com.br",
      password: "demo123",
      remember: true,
    },
  });

  const remember = watch("remember");

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      if (supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
      } else {
        setDemoSession();
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Não foi possível entrar. Tente novamente.");
      setLoading(false);
    }
  };

  const demoLogin = () => {
    setDemoSession();
    router.push(next);
    router.refresh();
  };

  const googleLogin = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="rounded-2xl border border-brand-navy/8 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-display text-2xl text-brand-navy">Entrar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Acompanhe seu processo de regularização fundiária.
      </p>

      {!configured && (
        <p className="mt-4 rounded-lg bg-orange-50 px-3 py-2 text-xs text-brand-navy">
          Supabase não configurado, use o <strong>modo demo</strong> para
          explorar o sistema.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" className="mt-1.5" {...register("email")} />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/auth/recuperar-senha"
              className="text-xs text-brand-orange hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            className="mt-1.5"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={!!remember}
            onCheckedChange={(v) => setValue("remember", v === true)}
          />
          <Label htmlFor="remember" className="font-normal">
            Lembrar de mim
          </Label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <div className="mt-4 space-y-3">
        <Button type="button" variant="outline" className="w-full" onClick={demoLogin}>
          Entrar em modo demo
        </Button>
        {configured && (
          <Button type="button" variant="secondary" className="w-full" onClick={googleLogin}>
            Entrar com Google
          </Button>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/auth/cadastro" className="font-semibold text-brand-orange hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
