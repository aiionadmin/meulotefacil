"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, notify } from "@/components/app/ModuleToolkit";

const STORAGE_KEY = "mlf-portal-auth-v1";

type PortalKind = "cliente" | "corretor";

type AuthState = {
  cliente?: boolean;
  corretor?: boolean;
};

function loadAuth(): AuthState {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : {};
  } catch {
    return {};
  }
}

function saveAuth(next: AuthState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function PortalLoginGate({
  kind,
  title,
  hint,
  demoHint,
  onLogin,
  onLogoutSession,
  children,
}: {
  kind: PortalKind;
  title: string;
  hint: string;
  demoHint: string;
  onLogin: (fields: {
    documento: string;
    codigo: string;
  }) => { ok: boolean; message?: string };
  onLogoutSession?: () => void;
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [documento, setDocumento] = useState("");
  const [codigo, setCodigo] = useState("");

  useEffect(() => {
    const auth = loadAuth();
    setAuthed(Boolean(auth[kind]));
    setReady(true);
  }, [kind]);

  if (!ready) {
    return (
      <p className="text-sm text-muted-foreground">Carregando portal…</p>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md space-y-6 rounded-xl border bg-[linear-gradient(180deg,rgba(15,81,50,0.06),transparent)] p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">
            Portal externo
          </p>
          <h1 className="mt-1 font-display text-2xl text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const result = onLogin({
              documento: documento.trim(),
              codigo: codigo.trim(),
            });
            if (!result.ok) {
              notify(result.message ?? "Credenciais inválidas");
              return;
            }
            const next = { ...loadAuth(), [kind]: true };
            saveAuth(next);
            setAuthed(true);
            notify("Acesso liberado");
          }}
        >
          <Field
            label={kind === "cliente" ? "CPF *" : "E-mail / documento *"}
          >
            <Input
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder={
                kind === "cliente" ? "123.456.789-00" : "ana@corretor.demo"
              }
              required
            />
          </Field>
          <Field label="Código de acesso *">
            <Input
              type="password"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="demo"
              required
            />
          </Field>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">{demoHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const next = { ...loadAuth(), [kind]: false };
            saveAuth(next);
            setAuthed(false);
            onLogoutSession?.();
            notify("Sessão do portal encerrada");
          }}
        >
          Sair do portal
        </Button>
      </div>
      {children}
    </div>
  );
}
