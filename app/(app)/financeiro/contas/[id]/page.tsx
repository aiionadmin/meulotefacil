"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  KpiGrid,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import { notify } from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { sampleOfx } from "@/lib/domain/ofx";
import { podeConciliar } from "@/lib/domain/alcadas";

export default function ContaExtratoPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const {
    state,
    extratoConta,
    importOfx,
    desconciliarPagamento,
  } = useFinanceiro();
  const { state: f1, currentUser } = useFase1();
  const perfil =
    f1.profiles.find((p) => p.id === currentUser?.profileId)?.nome ??
    "Administrador";

  const conta = state.contas.find((c) => c.id === id);
  const linhas = useMemo(
    () => (conta ? extratoConta(conta.id) : []),
    [conta, extratoConta, state]
  );

  const [ofxText, setOfxText] = useState("");

  if (!conta) {
    return (
      <p className="text-sm text-muted-foreground">
        Conta não encontrada.{" "}
        <Link className="underline" href="/financeiro/contas">
          Voltar
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title={`Extrato · ${conta.nome}`}
        description={`${conta.banco} · ${conta.tipo} · saldo dia a dia`}
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/financeiro/contas">Contas</Link>
          </Button>
        }
      />

      <KpiGrid
        items={[
          { label: "Saldo atual", value: formatBRL(conta.saldo) },
          { label: "Saldo inicial", value: formatBRL(conta.valorInicial) },
          {
            label: "Linhas",
            value: linhas.length,
          },
          {
            label: "OFX importados",
            value: state.ofxImports.filter((o) => o.contaId === conta.id)
              .length,
          },
        ]}
      />

      <ModuleSection title="Movimentos">
        <PaginatedTable
          columns={[
            { key: "data", label: "Data" },
            { key: "desc", label: "Descrição" },
            { key: "valor", label: "Valor" },
            { key: "saldo", label: "Saldo" },
            { key: "conc", label: "Conc." },
          ]}
          rows={linhas.map((l) => ({
            data: formatDateBR(l.data),
            desc: l.descricao,
            valor: (
              <span
                className={
                  l.valor < 0 ? "text-red-700" : l.valor > 0 ? "text-brand-green" : ""
                }
              >
                {formatBRL(l.valor)}
              </span>
            ),
            saldo: formatBRL(l.saldo),
            conc:
              l.origem === "pagamento" ? (
                l.conciliado ? (
                  <div className="flex items-center gap-1">
                    <StatusPill tone="ok">sim</StatusPill>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => {
                        const gate = podeConciliar(
                          f1.approvalRules,
                          perfil,
                          true
                        );
                        if (!gate.ok) {
                          notify(gate.motivo ?? "Sem alçada");
                          return;
                        }
                        if (l.refId) desconciliarPagamento(l.refId);
                        notify("Desconciliado");
                      }}
                    >
                      Desfazer
                    </Button>
                  </div>
                ) : (
                  <StatusPill tone="info">não</StatusPill>
                )
              ) : (
                "—"
              ),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Importar OFX">
        <p className="mb-2 text-sm text-muted-foreground">
          Conciliação por arquivo (demo). Casamento por valor + memo com
          pagamentos da conta.
        </p>
        <textarea
          className="min-h-[140px] w-full rounded-md border bg-background p-2 font-mono text-xs"
          value={ofxText}
          onChange={(e) => setOfxText(e.target.value)}
          placeholder="Cole o conteúdo OFX ou use o exemplo…"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOfxText(sampleOfx())}
          >
            Carregar exemplo
          </Button>
          <Button
            size="sm"
            onClick={() => {
              const gate = podeConciliar(f1.approvalRules, perfil, false);
              if (!gate.ok) {
                notify(gate.motivo ?? "Sem alçada para conciliar");
                return;
              }
              const r = importOfx(conta.id, ofxText || sampleOfx(), "demo.ofx");
              if (!r.ok) {
                notify("OFX sem transações reconhecidas");
                return;
              }
              notify(
                `OFX: ${r.matched}/${r.total} conciliado(s)`
              );
            }}
          >
            Importar e conciliar
          </Button>
        </div>
        {state.ofxImports.filter((o) => o.contaId === conta.id).length ? (
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {state.ofxImports
              .filter((o) => o.contaId === conta.id)
              .map((o) => (
                <li key={o.id}>
                  {formatDateBR(o.importadoEm)} · {o.arquivo} · {o.conciliados}/
                  {o.qtd} matches
                </li>
              ))}
          </ul>
        ) : null}
      </ModuleSection>
    </div>
  );
}
