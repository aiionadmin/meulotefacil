import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-brand-navy/8 bg-white p-8 text-sm text-muted-foreground">
          Carregando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
