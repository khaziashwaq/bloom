import type { Bouquet } from "../types";

/**
 * Minimal Supabase REST adapter (no SDK needed). Expects the table and
 * `get_bouquet` function from `supabase/schema.sql`.
 */

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(URL_ && KEY);

function headers() {
  return {
    apikey: KEY!,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
  };
}

export async function supabaseSave(bouquet: Bouquet): Promise<void> {
  const res = await fetch(`${URL_}/rest/v1/bouquets`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=minimal" },
    body: JSON.stringify({ id: bouquet.id, data: bouquet }),
  });
  if (!res.ok) throw new Error(`Supabase insert failed (${res.status})`);
}

export async function supabaseLoad(id: string): Promise<unknown | null> {
  const res = await fetch(`${URL_}/rest/v1/rpc/get_bouquet`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ bouquet_id: id }),
  });
  if (!res.ok) throw new Error(`Supabase read failed (${res.status})`);
  return (await res.json()) ?? null;
}
