import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-sm border border-linha bg-white p-8 text-sm text-ink/75">
          Carregando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
