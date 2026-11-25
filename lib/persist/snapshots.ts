import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEMO_ORG_ID, type StoreKey } from "./store-keys";
import { memoryGet, memorySet } from "./memory-cache";

export async function loadSnapshot<T>(
  storeKey: StoreKey,
  orgId: string = DEMO_ORG_ID
): Promise<T | null> {
  if (!isSupabaseConfigured()) {
    return memoryGet<T>(orgId, storeKey);
  }

  const supabase = createClient();
  if (!supabase) return memoryGet<T>(orgId, storeKey);

  const { data, error } = await supabase
    .from("store_snapshots")
    .select("payload")
    .eq("organization_id", orgId)
    .eq("store_key", storeKey)
    .maybeSingle();

  if (error || !data?.payload) {
    return memoryGet<T>(orgId, storeKey);
  }

  return data.payload as T;
}

export async function saveSnapshot(
  storeKey: StoreKey,
  payload: unknown,
  orgId: string = DEMO_ORG_ID
): Promise<{ ok: boolean; mode: "supabase" | "memory" }> {
  memorySet(orgId, storeKey, payload);

  if (!isSupabaseConfigured()) {
    return { ok: true, mode: "memory" };
  }

  const supabase = createClient();
  if (!supabase) return { ok: true, mode: "memory" };

  const { error } = await supabase.from("store_snapshots").upsert(
    {
      organization_id: orgId,
      store_key: storeKey,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id,store_key" }
  );

  if (error) {
    // Mantém memória; UI segue funcionando offline/dev
    console.warn("[persist] supabase upsert falhou", storeKey, error.message);
    return { ok: false, mode: "memory" };
  }

  return { ok: true, mode: "supabase" };
}
