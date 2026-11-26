import { NextResponse } from "next/server";
import { seedCarteira } from "@/lib/domain/carteira-seed";
import { parsePagedQuery, pagedJson } from "@/lib/api/paged";

/** B17 — boletos paginados no servidor. */
export async function GET(request: Request) {
  const started = performance.now();
  const url = new URL(request.url);
  const query = parsePagedQuery(url);
  let list = seedCarteira().bankSlips;
  if (query.q) {
    list = list.filter((b) =>
      [b.nossoNumero, b.contratoNumero, b.status, b.banco]
        .join(" ")
        .toLowerCase()
        .includes(query.q)
    );
  }
  return NextResponse.json(pagedJson(list, query, started));
}
