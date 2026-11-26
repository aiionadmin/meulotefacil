import { NextResponse } from "next/server";
import { seedFluxo } from "@/lib/domain/fluxo-seed";
import { parsePagedQuery, pagedJson } from "@/lib/api/paged";

/** B17 — leads paginados no servidor. */
export async function GET(request: Request) {
  const started = performance.now();
  const url = new URL(request.url);
  const query = parsePagedQuery(url);
  let list = seedFluxo().leads;
  if (query.q) {
    list = list.filter((l) =>
      [l.nome, l.telefone, l.email, l.etapa, l.origem]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.q)
    );
  }
  return NextResponse.json(pagedJson(list, query, started));
}
