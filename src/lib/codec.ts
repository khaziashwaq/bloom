import LZString from "lz-string";
import {
  BACKGROUNDS,
  CARD_COLORS,
  DEFAULT_DECORATIONS,
  LIMITS,
  MAX_ITEMS,
  RIBBONS,
  WRAPPINGS,
  getDef,
  isItemKind,
} from "./catalog";
import { isValidId, newId } from "./ids";
import type { Bouquet, BouquetDesign, BouquetNote, CanvasItem } from "./types";

/* ------------------------------------------------------------------ */
/* Validation — everything that comes from a link or the database is   */
/* untrusted, so it is checked and clamped before it is rendered.      */
/* ------------------------------------------------------------------ */

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, max) : "");
const num = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const oneOf = <T extends string>(v: unknown, options: readonly { id: T }[], fallback: T): T =>
  options.some((o) => o.id === v) ? (v as T) : fallback;

function sanitizeItem(raw: unknown): CanvasItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!isItemKind(r.kind)) return null;
  const def = getDef(r.kind);
  const variant = def.variants.some((v) => v.id === r.variant) ? (r.variant as string) : def.variants[0].id;
  return {
    id: typeof r.id === "string" && /^[a-zA-Z0-9]{1,16}$/.test(r.id) ? r.id : newId(8),
    kind: r.kind,
    variant,
    x: Math.round(num(r.x, -200, 1200, 500)),
    y: Math.round(num(r.y, -200, 1400, 450)),
    rotation: Math.round(num(r.rotation, -720, 720, 0) * 10) / 10,
    scale: Math.round(num(r.scale, 0.2, 3, 1) * 100) / 100,
    flip: r.flip === true,
  };
}

export function sanitizeBouquet(raw: unknown): Bouquet | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const d = (r.design ?? {}) as Record<string, unknown>;
  const n = (r.note ?? {}) as Record<string, unknown>;
  const deco = (d.decorations ?? {}) as Record<string, unknown>;
  if (typeof r.id !== "string" || !isValidId(r.id)) return null;
  const items = Array.isArray(d.items) ? d.items.slice(0, MAX_ITEMS).map(sanitizeItem).filter((x): x is CanvasItem => !!x) : [];
  // ids must be unique for React keys
  const seen = new Set<string>();
  for (const it of items) {
    while (seen.has(it.id)) it.id = newId(8);
    seen.add(it.id);
  }
  const design: BouquetDesign = {
    items,
    wrapping: oneOf(d.wrapping, WRAPPINGS, "blush"),
    ribbon: oneOf(d.ribbon, RIBBONS, "satin-pink"),
    background: oneOf(d.background, BACKGROUNDS, "cream"),
    decorations: {
      hearts: deco.hearts === true,
      sparkles: deco.sparkles === true,
      tag: deco.tag === true,
      tagText: str(deco.tagText, LIMITS.tag) || DEFAULT_DECORATIONS.tagText,
      label: deco.label === true,
      labelText: str(deco.labelText, LIMITS.label) || DEFAULT_DECORATIONS.labelText,
    },
  };
  const note: BouquetNote = {
    to: str(n.to, LIMITS.to),
    message: str(n.message, LIMITS.message),
    from: str(n.from, LIMITS.from),
    card: oneOf(n.card, CARD_COLORS, "cream"),
  };
  const created = typeof r.createdAt === "string" && !Number.isNaN(Date.parse(r.createdAt)) ? r.createdAt : new Date().toISOString();
  return { id: r.id, version: 1, createdAt: created, design, note };
}

/* ------------------------------------------------------------------ */
/* Compact link encoding                                               */
/* ------------------------------------------------------------------ */

type PackedItem = [string, string, number, number, number, number, 0 | 1];
interface Packed {
  v: 1;
  i: string;
  t: number;
  it: PackedItem[];
  w: string;
  r: string;
  b: string;
  d: [0 | 1, 0 | 1, 0 | 1, string, 0 | 1, string];
  n: [string, string, string, string];
}

const bit = (b: boolean): 0 | 1 => (b ? 1 : 0);

/** Bouquet → short, URL-safe string (lz-string, with '+' and '$' swapped for link-friendly characters). */
export function packBouquet(b: Bouquet): string {
  const { design: d, note } = b;
  const p: Packed = {
    v: 1,
    i: b.id,
    t: Math.round(Date.parse(b.createdAt) / 1000),
    it: d.items.map((it) => [it.kind, it.variant, Math.round(it.x), Math.round(it.y), Math.round(it.rotation), Math.round(it.scale * 100) / 100, bit(it.flip)]),
    w: d.wrapping,
    r: d.ribbon,
    b: d.background,
    d: [bit(d.decorations.hearts), bit(d.decorations.sparkles), bit(d.decorations.tag), d.decorations.tagText, bit(d.decorations.label), d.decorations.labelText],
    n: [note.to, note.message, note.from, note.card],
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(p)).replace(/\+/g, "~").replace(/\$/g, "_");
}

export function unpackBouquet(encoded: string): Bouquet | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded.trim().replace(/~/g, "+").replace(/_/g, "$"));
    if (!json) return null;
    const p = JSON.parse(json) as Partial<Packed>;
    if (!p || p.v !== 1 || !Array.isArray(p.it)) return null;
    const deco = Array.isArray(p.d) ? p.d : [];
    const note = Array.isArray(p.n) ? p.n : [];
    return sanitizeBouquet({
      id: p.i,
      createdAt: typeof p.t === "number" ? new Date(p.t * 1000).toISOString() : undefined,
      design: {
        items: p.it.map((t, i) =>
          Array.isArray(t)
            ? { id: `i${i}`, kind: t[0], variant: t[1], x: t[2], y: t[3], rotation: t[4], scale: t[5], flip: t[6] === 1 }
            : null,
        ),
        wrapping: p.w,
        ribbon: p.r,
        background: p.b,
        decorations: { hearts: deco[0] === 1, sparkles: deco[1] === 1, tag: deco[2] === 1, tagText: deco[3], label: deco[4] === 1, labelText: deco[5] },
      },
      note: { to: note[0], message: note[1], from: note[2], card: note[3] },
    });
  } catch {
    return null;
  }
}
