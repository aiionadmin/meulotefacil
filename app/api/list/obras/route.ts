import { NextResponse } from "next/server";
import { seedObras } from "@/lib/domain/obras-seed";
import { parsePagedQuery, pagedJson } from "@/lib/api/paged";

/** B17 — obras paginadas no servidor. */
export async function GET(request: Request) {
  const started = performance.now();
  const url = new URL(request.url);
  const query = parsePagedQuery(url);
  let list = seedObras().obras;
  if (query.q) {
    list = list.filter((o) =>
      [o.nome, o.codigo, o.status, o.clienteNome, o.tipo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.q)
    );
  }
  return NextResponse.json(pagedJson(list, query, started));
}
