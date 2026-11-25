import { NextResponse } from "next/server";

/** Healthcheck — sem regras financeiras no front. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    fase: 1,
    spec: "docs/especificacao.md",
  });
}
