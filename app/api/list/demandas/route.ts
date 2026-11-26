import { NextResponse } from "next/server";
import { seedParte5 } from "@/lib/domain/parte5-seed";
import { parsePagedQuery, pagedJson } from "@/lib/api/paged";

/** B17 — demandas paginadas no servidor. */
export async function GET(request: Request) {
  const started = performance.now();
  const url = new URL(request.url);
  const query = parsePagedQuery(url);
  let list = seedParte5().demandas;
  if (query.q) {
    list = list.filter((d) =>
      [d.numero, d.descricao, d.clienteNome, d.status, d.empreendimentoNome]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.q)
    );
  }
  return NextResponse.json(pagedJson(list, query, started));
}
