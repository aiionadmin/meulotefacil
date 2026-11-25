import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/app/ModulePage";

export function PhaseStub({
  title,
  description,
}: {
  title: string;
  phase?: string;
  description?: string;
}) {
  return (
    <div className="space-y-6">
      <ModuleHeader
        title={title}
        description={
          description ??
          "Esta tela está prevista na especificação. A estrutura de menu já está pronta."
        }
      />
      <div className="rounded-sm border border-dashed border-linha bg-white p-8 text-sm text-ink/80">
        <p>
          Enquanto a tela completa não estiver disponível, use Cadastros,
          Arquivos e Configurações.
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
