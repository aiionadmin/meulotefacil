import { NextResponse } from "next/server";
import { z } from "zod";
import { calcAtraso } from "@/lib/money/atraso";

/** Cálculo de encargos no servidor — nunca no front para produção. */
const schema = z.object({
  valor: z.number().positive(),
  vencimento: z.string().min(8),
  consulta: z.string().min(8).optional(),
  taxaMoraMes: z.number().min(0).default(0.01),
  taxaMulta: z.number().min(0).default(0.02),
  diasTolerancia: z.number().int().min(0).default(0),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "payload inválido" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const result = calcAtraso({
    ...data,
    consulta: data.consulta ?? new Date().toISOString().slice(0, 10),
  });
  return NextResponse.json({ ok: true, ...result });
}
