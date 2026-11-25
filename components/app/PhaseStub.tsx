import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";

export function PhaseStub({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description?: string;
}) {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title={title}
        description={
          description ??
          `Esta tela entra na ${phase} da especificação unificada. A estrutura de menu já está pronta.`
        }
      />
      <div className="rounded-sm border border-dashed border-border bg-card p-8 text-sm text-foreground/80">
        <p>
          Consulte <code className="text-xs">docs/especificacao.md</code> e a
          ordem em §13.1. Enquanto isso, use Cadastros, Arquivos e
          Configurações da Fase 1.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/cadastros/pessoas">Abrir Pessoas</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard">Voltar ao painel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
