"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { setDemoSession } from "@/lib/auth-demo";
import { cn } from "@/lib/utils";

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function maskCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  }
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}

function isValidCPF(cpf: string) {
  const d = onlyDigits(cpf);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== Number(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === Number(d[10]);
}

const schema = z
  .object({
    nome: z.string().min(2, "Informe seu nome"),
    email: z.string().email("E-mail inválido"),
    cpf: z.string().refine(isValidCPF, "CPF inválido"),
    telefone: z.string().min(14, "Telefone inválido"),
    password: z.string().min(8, "Mínimo de 8 caracteres"),
    termos: z.boolean().refine((v) => v === true, {
      message: "Aceite os termos para continuar",
    }),
  });

type FormData = z.infer<typeof schema>;

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export default function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch("password") || "";
  const strength = useMemo(() => passwordStrength(password), [password]);
  const strengthLabel = ["", "Fraca", "Razoável", "Boa", "Forte"][strength];

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      if (supabase) {
        const { error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              nome: data.nome,
              cpf: data.cpf,
              telefone: data.telefone,
            },
          },
        });
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
      } else {
        setDemoSession();
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Não foi possível criar a conta.");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-linha bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-display text-2xl text-ink">Criar conta</h1>
      <p className="mt-1 text-sm text-ink/75">
        Cadastre-se para acompanhar lotes e propostas.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" className="mt-1.5" {...register("nome")} />
          {errors.nome && <p className="mt-1 text-xs text-destructive">{errors.nome.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" className="mt-1.5" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            className="mt-1.5"
            {...register("cpf")}
            onChange={(e) => setValue("cpf", maskCPF(e.target.value), { shouldValidate: true })}
          />
          {errors.cpf && <p className="mt-1 text-xs text-destructive">{errors.cpf.message}</p>}
        </div>
        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            className="mt-1.5"
            {...register("telefone")}
            onChange={(e) =>
              setValue("telefone", maskPhone(e.target.value), { shouldValidate: true })
            }
          />
          {errors.telefone && (
            <p className="mt-1 text-xs text-destructive">{errors.telefone.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" className="mt-1.5" {...register("password")} />
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  strength >= i ? "bg-brand-orange" : "bg-navy-100"
                )}
              />
            ))}
          </div>
          {password && (
            <p className="mt-1 text-xs text-ink/75">Força: {strengthLabel}</p>
          )}
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="termos"
            className="mt-0.5"
            onCheckedChange={(v) =>
              setValue("termos", v === true, { shouldValidate: true })
            }
          />
          <Label htmlFor="termos" className="font-normal leading-snug">
            Li e aceito os termos de uso e a política de privacidade.
          </Label>
        </div>
        {errors.termos && (
          <p className="text-xs text-destructive">{errors.termos.message}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Criando…" : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/75">
        Já tem conta?{" "}
        <Link href="/auth/login" className="font-semibold text-brand-accent-strong hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
