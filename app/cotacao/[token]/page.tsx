"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { findCotacaoByPublicToken } from "@/lib/domain/cotacao-publica";
import { useCompras } from "@/lib/store/compras-store";
import { formatBRL, formatDateBR } from "@/lib/masks/br";

export default function CotacaoPublicaPage() {
  const params = useParams();
  const token = String(params.token ?? "");
  const { state, ready, responderCotacaoPublica } = useCompras();
  const ctx = useMemo(
    () => findCotacaoByPublicToken(state, token),
    [state, token]
  );

  const [linhas, setLinhas] = useState<
    Record<string, { preco: string; qtd: string; prazo: string }>
  >({});
  const [enviado, setEnviado] = useState(false);

  const defaults = useMemo(() => {
    if (!ctx) return {};
    const map: Record<string, { preco: string; qtd: string; prazo: string }> =
      {};
    for (const item of ctx.cotacao.itens) {
      const preco = ctx.cotacao.precos.find(
        (p) => p.itemId === item.id && p.supplierId === ctx.fornecedor.id
      );
      map[item.id] = {
        preco: preco ? String(preco.precoUnitario) : "",
        qtd: String(preco?.quantidadeCotada ?? item.quantidade),
        prazo: preco?.prazoDias != null ? String(preco.prazoDias) : "5",
      };
    }
    return map;
  }, [ctx]);

  const form = Object.keys(linhas).length ? linhas : defaults;

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">
        Carregando cotação…
      </main>
    );
  }

  if (!ctx) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-2xl text-ink">Link inválido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Não encontramos cotação para o token{" "}
          <code className="rounded bg-muted px-1">{token || "—"}</code>.
        </p>
        <p className="mt-4 text-sm">
          Demo: tente{" "}
          <Link className="underline text-brand-orange" href="/cotacao/tok-sul">
            /cotacao/tok-sul
          </Link>
          .
        </p>
      </main>
    );
  }

  const { cotacao, fornecedor } = ctx;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green">
        Meu Lote Fácil · Cotação pública
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">{cotacao.numero}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {cotacao.descricao} · {cotacao.centro.label}
        {cotacao.necessidade
          ? ` · necessidade ${formatDateBR(cotacao.necessidade)}`
          : ""}
      </p>
      <div className="mt-4 rounded-lg border border-brand-green/20 bg-white/80 p-4 text-sm">
        <div className="font-medium text-ink">{fornecedor.fornecedor}</div>
        <div className="text-muted-foreground">
          {fornecedor.contato} · {fornecedor.email} · {fornecedor.telefone}
        </div>
      </div>

      {enviado ? (
        <div className="mt-8 rounded-lg border border-brand-green/30 bg-brand-green/10 p-4 text-sm">
          Cotação enviada. O comprador verá seus preços no mapa comparativo.
        </div>
      ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const payload = cotacao.itens.map((item) => {
              const row = form[item.id] ?? {
                preco: "",
                qtd: String(item.quantidade),
                prazo: "5",
              };
              return {
                itemId: item.id,
                precoUnitario: Number(row.preco) || 0,
                quantidadeCotada: Number(row.qtd) || item.quantidade,
                prazoDias: Number(row.prazo) || undefined,
              };
            });
            if (payload.every((p) => !(p.precoUnitario > 0))) {
              return;
            }
            const ok = responderCotacaoPublica(token, payload);
            if (ok) setEnviado(true);
          }}
        >
          <ul className="space-y-3">
            {cotacao.itens.map((item) => {
              const row = form[item.id] ?? {
                preco: "",
                qtd: String(item.quantidade),
                prazo: "5",
              };
              return (
                <li
                  key={item.id}
                  className="rounded-lg border bg-white/90 p-4 shadow-sm"
                >
                  <div className="font-medium text-ink">{item.descricao}</div>
                  <div className="text-xs text-muted-foreground">
                    Solicitado: {item.quantidade} {item.unidade} · orçamento{" "}
                    {formatBRL(item.valorOrcamento)}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <label className="text-xs">
                      Preço unitário *
                      <Input
                        className="mt-1"
                        type="number"
                        step="0.01"
                        value={row.preco}
                        onChange={(e) =>
                          setLinhas({
                            ...form,
                            [item.id]: { ...row, preco: e.target.value },
                          })
                        }
                        required
                      />
                    </label>
                    <label className="text-xs">
                      Quantidade
                      <Input
                        className="mt-1"
                        type="number"
                        value={row.qtd}
                        onChange={(e) =>
                          setLinhas({
                            ...form,
                            [item.id]: { ...row, qtd: e.target.value },
                          })
                        }
                      />
                    </label>
                    <label className="text-xs">
                      Prazo (dias)
                      <Input
                        className="mt-1"
                        type="number"
                        value={row.prazo}
                        onChange={(e) =>
                          setLinhas({
                            ...form,
                            [item.id]: { ...row, prazo: e.target.value },
                          })
                        }
                      />
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
          <Button type="submit" className="w-full sm:w-auto">
            Enviar cotação
          </Button>
        </form>
      )}

      <p className="mt-10 text-xs text-muted-foreground">
        Stub público do fornecedor (Parte 3). Sem login — o token do link isola a
        resposta.
      </p>
    </main>
  );
}
