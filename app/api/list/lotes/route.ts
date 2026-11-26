import { NextResponse } from "next/server";
import { seedCarteira } from "@/lib/domain/carteira-seed";
import { parsePagedQuery, pagedJson } from "@/lib/api/paged";

/** B17 — lotes paginados no servidor. */
export async function GET(request: Request) {
  const started = performance.now();
  const url = new URL(request.url);
  const query = parsePagedQuery(url);
  const emp = url.searchParams.get("developmentId") || "";
  let list = seedCarteira().lots;
  if (emp) list = list.filter((l) => l.developmentId === emp);
  if (query.q) {
    list = list.filter((l) =>
      [l.empNome, l.quadra, l.lote, l.status, l.compradorNome]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.q)
    );
  }
  return NextResponse.json(pagedJson(list, query, started));
}
