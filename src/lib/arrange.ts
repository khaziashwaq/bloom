import { BIND_POINT, CANVAS_H, CANVAS_W, DOME, getDef, isGreenery, itemBoxSize } from "./catalog";
import type { CanvasItem, ItemKind } from "./types";

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

/** Flowers whose silhouette has a clear "up" — they should fan out from the tie point. */
const DIRECTIONAL = new Set<ItemKind>(["tulip", "lavender", "babysbreath", "carnation"]);

/** Angle (deg) a stem at (x, y) would lean, fanning out from where the stems are tied. */
export function fanAngle(x: number, y: number) {
  const dx = x - BIND_POINT.x;
  const dy = BIND_POINT.y - y;
  return clamp((Math.atan2(dx, Math.max(dy, 60)) * 180) / Math.PI, -70, 70);
}

export function naturalRotation(kind: ItemKind, x: number, y: number, rand = Math.random) {
  const fan = fanAngle(x, y);
  if (isGreenery(kind)) return fan * 1.15 + (rand() - 0.5) * 10;
  if (DIRECTIONAL.has(kind)) return fan * 0.95 + (rand() - 0.5) * 8;
  return fan * 0.45 + (rand() - 0.5) * 24;
}

function radiusOf(item: Pick<CanvasItem, "kind" | "scale">) {
  const { w, h } = itemBoxSize(item.kind);
  return (Math.min(w, h) / 2) * item.scale * (isGreenery(item.kind) ? 0.5 : 0.82);
}

/**
 * Pick a pleasing spot for a new flower: inside the bouquet dome, as far from the
 * existing blooms as possible, gently preferring the centre.
 */
export function findSpot(items: CanvasItem[], kind: ItemKind): Omit<CanvasItem, "id" | "kind" | "variant"> {
  const green = isGreenery(kind);
  const scale = 0.94 + Math.random() * 0.12;
  const probe = { kind, scale };
  let best = { x: DOME.x, y: DOME.y, score: -Infinity };
  for (let i = 0; i < 64; i++) {
    let x: number;
    let y: number;
    let centreBias: number;
    if (green) {
      const a = (-175 + Math.random() * 170) * (Math.PI / 180);
      const r = 0.78 + Math.random() * 0.3;
      x = DOME.x + Math.cos(a) * DOME.rx * r;
      y = DOME.y + 30 + Math.sin(a) * DOME.ry * r;
      centreBias = 0;
    } else {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.92;
      x = DOME.x + Math.cos(a) * DOME.rx * r;
      y = DOME.y + Math.sin(a) * DOME.ry * r;
      centreBias = r * 0.35;
    }
    let minGap = 3;
    for (const it of items) {
      if (isGreenery(it.kind) !== green) continue;
      const gap = Math.hypot(it.x - x, it.y - y) / (radiusOf(it) + radiusOf(probe));
      minGap = Math.min(minGap, gap);
    }
    const score = minGap - centreBias;
    if (score > best.score) best = { x, y, score };
  }
  return {
    x: Math.round(best.x),
    y: Math.round(best.y),
    rotation: Math.round(naturalRotation(kind, best.x, best.y)),
    scale: Math.round(scale * 100) / 100,
    flip: Math.random() < 0.3,
  };
}

/**
 * Compose every item into a classic dome bouquet: focal blooms in the heart,
 * fillers around the edge, greenery peeking out behind.
 */
export function arrange(items: CanvasItem[]): CanvasItem[] {
  const flowers = items.filter((it) => !isGreenery(it.kind));
  const greens = items.filter((it) => isGreenery(it.kind));
  const n = flowers.length;
  // small bouquets get slightly larger blooms so they still fill the wrap
  const bloom = clamp(1.3 - n * 0.025, 1, 1.22);
  const spread = clamp(Math.sqrt(Math.max(n, 1) / 14) * bloom, 0.5, 1.12);
  const rx = DOME.rx * spread;
  const ry = DOME.ry * spread;

  const slots = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / Math.max(n, 1);
    const r = n === 1 ? 0 : Math.sqrt(t);
    const a = i * GOLDEN + 0.6;
    return { r, x: DOME.x + Math.cos(a) * rx * r, y: DOME.y + 10 + Math.sin(a) * ry * r * 0.92 };
  });
  slots.sort((a, b) => a.r - b.r);

  const byFocal = [...flowers].sort((a, b) => getDef(b.kind).focal - getDef(a.kind).focal + (Math.random() - 0.5) * 0.08);
  const placed = byFocal.map((it, i) => {
    const s = slots[i];
    const filler = getDef(it.kind).focal < 0.3;
    // fillers poke out a little further so their sprays frame the bouquet
    const push = filler ? 1.12 : 1;
    const x = DOME.x + (s.x - DOME.x) * push;
    const y = DOME.y + (s.y - DOME.y) * push - (filler ? 18 : 0);
    return {
      item: {
        ...it,
        x: Math.round(clamp(x, 40, CANVAS_W - 40)),
        y: Math.round(clamp(y, 40, CANVAS_H - 40)),
        rotation: Math.round(naturalRotation(it.kind, x, y)),
        scale: Math.round((filler ? 1 : 1.04 - s.r * 0.14) * bloom * 100) / 100,
      },
      depth: filler ? -1 + s.r * 0.1 : 1 - s.r,
    };
  });
  placed.sort((a, b) => a.depth - b.depth);

  const g = greens.length;
  const arc = g > 5 ? [-195, 15] : [-165, -15];
  const greenPlaced = greens.map((it, j) => {
    const a = ((arc[0] + ((arc[1] - arc[0]) * (j + 0.5)) / Math.max(g, 1) + (Math.random() - 0.5) * 12) * Math.PI) / 180;
    const x = DOME.x + Math.cos(a) * rx * 0.98;
    const y = DOME.y + 40 + Math.sin(a) * ry * 0.92;
    const deg = (a * 180) / Math.PI + 90;
    return {
      ...it,
      x: Math.round(clamp(x, 40, CANVAS_W - 40)),
      y: Math.round(clamp(y, 40, CANVAS_H - 40)),
      rotation: Math.round(clamp(deg, -100, 100)),
      scale: Math.round(bloom * 100) / 100,
    };
  });

  return [...greenPlaced, ...placed.map((p) => p.item)];
}

/** Smoothly tween items from their current positions to the targets. */
export function tweenItems(from: CanvasItem[], to: CanvasItem[], duration: number, onFrame: (items: CanvasItem[]) => void, onDone: () => void) {
  const start = performance.now();
  const fromMap = new Map(from.map((it) => [it.id, it]));
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  let raf = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const k = ease(t);
    onFrame(
      to.map((target) => {
        const src = fromMap.get(target.id);
        if (!src) return target;
        return {
          ...target,
          x: src.x + (target.x - src.x) * k,
          y: src.y + (target.y - src.y) * k,
          rotation: src.rotation + (target.rotation - src.rotation) * k,
          scale: src.scale + (target.scale - src.scale) * k,
        };
      }),
    );
    if (t < 1) raf = requestAnimationFrame(step);
    else onDone();
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
