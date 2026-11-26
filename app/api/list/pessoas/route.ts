import { NextResponse } from "next/server";
import { unifiedFase1Seed } from "@/lib/domain/unified-seed";
import { parsePagedQuery, pagedJson } from "@/lib/api/paged";

/** B17 — pessoas paginadas no servidor. */
export async function GET(request: Request) {
  const started = performance.now();
  const url = new URL(request.url);
  const query = parsePagedQuery(url);
  const papel = url.searchParams.get("papel") || "";
  let list = unifiedFase1Seed().people.filter((p) => p.status !== "excluido");
  if (papel) list = list.filter((p) => p.papeis.includes(papel as never));
  if (query.q) {
    list = list.filter((p) =>
      [p.nome, p.documento, p.cidade, p.email, p.celular, p.papeis.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.q)
    );
  }
  return NextResponse.json(pagedJson(list, query, started));
}
