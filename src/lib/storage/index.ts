import { packBouquet, sanitizeBouquet, unpackBouquet } from "../codec";
import { isValidId } from "../ids";
import type { Bouquet } from "../types";
import { supabaseConfigured, supabaseLoad, supabaseSave } from "./supabase";

/**
 * The storage layer. Two adapters:
 *
 *  - "supabase": the bouquet is saved to a database row and shared as a short
 *    link (/b/<id>). Enabled when NEXT_PUBLIC_SUPABASE_URL and
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
 *  - "link": no backend at all. The whole bouquet is compressed into the URL
 *    fragment (/b/<id>#<data>), so the link itself carries the gift and works
 *    on any device. The fragment is never sent to a server.
 */
export type StorageMode = "link" | "supabase";

export interface SaveResult {
  id: string;
  url: string;
  mode: StorageMode;
  /** Set when we wanted Supabase but fell back to a self-contained link. */
  fellBack?: boolean;
}

export const preferredMode: StorageMode = supabaseConfigured ? "supabase" : "link";

export function shareUrl(origin: string, bouquet: Bouquet, mode: StorageMode) {
  const base = `${origin}/b/${bouquet.id}`;
  return mode === "supabase" ? base : `${base}#${packBouquet(bouquet)}`;
}

export async function saveBouquet(bouquet: Bouquet, origin: string): Promise<SaveResult> {
  if (supabaseConfigured) {
    try {
      await supabaseSave(bouquet);
      return { id: bouquet.id, url: shareUrl(origin, bouquet, "supabase"), mode: "supabase" };
    } catch (err) {
      console.warn("Falling back to a self-contained link:", err);
      return { id: bouquet.id, url: shareUrl(origin, bouquet, "link"), mode: "link", fellBack: true };
    }
  }
  return { id: bouquet.id, url: shareUrl(origin, bouquet, "link"), mode: "link" };
}

export type LoadResult = { ok: true; bouquet: Bouquet } | { ok: false; reason: "invalid" | "not-found" | "network" };

/** Open a shared bouquet from its id and (optional) URL fragment. */
export async function loadBouquet(id: string, fragment: string): Promise<LoadResult> {
  const data = fragment.replace(/^#/, "");
  if (data) {
    const b = unpackBouquet(data);
    return b ? { ok: true, bouquet: b } : { ok: false, reason: "invalid" };
  }
  if (!isValidId(id)) return { ok: false, reason: "invalid" };
  if (!supabaseConfigured) return { ok: false, reason: "not-found" };
  try {
    const raw = await supabaseLoad(id);
    const b = raw ? sanitizeBouquet(raw) : null;
    return b ? { ok: true, bouquet: b } : { ok: false, reason: "not-found" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
