import { NextResponse } from "next/server";
import { seedFinanceiro } from "@/lib/domain/financeiro-seed";
import { parsePagedQuery, pagedJson } from "@/lib/api/paged";

/** B17 — pagamentos paginados no servidor. */
export async function GET(request: Request) {
  const started = performance.now();
  const url = new URL(request.url);
  const query = parsePagedQuery(url);
  let list = seedFinanceiro().pagamentos;
  if (query.q) {
    list = list.filter((p) =>
      [p.favorecido, p.descricao, p.status, p.centroLabel]
        .join(" ")
        .toLowerCase()
        .includes(query.q)
    );
  }
  return NextResponse.json(pagedJson(list, query, started));
}
