import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { AuthPanel } from "@/components/auth/AuthPanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <AuthPanel />
      <div className="flex flex-col bg-brand-cream">
        <div className="flex items-center justify-between px-6 py-5 lg:hidden">
          <Link href="/">
            <Logo variant="full" className="scale-90" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="pb-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-brand-orange">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}
