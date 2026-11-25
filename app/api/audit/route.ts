import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { DEMO_ORG_ID } from "@/lib/persist/store-keys";
import type { AuditWriteInput } from "@/lib/audit/types";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AuditWriteInput>;
  if (!body.rotina || !body.acao || !body.usuarioNome) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }

  const organizationId = body.organizationId || DEMO_ORG_ID;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      mode: "memory",
      id: `aud-mem-${Date.now()}`,
    });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, mode: "memory" });
  }

  const { data, error } = await supabase
    .from("audit_log")
    .insert({
      organization_id: organizationId,
      user_id: body.userId ?? null,
      usuario_nome: body.usuarioNome,
      rotina: body.rotina,
      acao: body.acao,
      registro_tipo: body.registroTipo ?? null,
      registro_id: body.registroId ?? null,
      antes: body.antes ?? null,
      depois: body.depois ?? null,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, mode: "supabase", id: data?.id });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId") || DEMO_ORG_ID;
  const limit = Math.min(Number(searchParams.get("limit") || 100), 500);

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ items: [], mode: "memory" });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ items: [], mode: "memory" });
  }

  const { data, error } = await supabase
    .from("audit_log")
    .select(
      "id, quando, usuario_nome, rotina, acao, registro_tipo, registro_id, antes, depois"
    )
    .eq("organization_id", organizationId)
    .order("quando", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [], mode: "supabase" });
}
