/** Small deterministic helpers for generating organic-looking SVG geometry. */

export type Pt = [number, number];

/** Seeded PRNG so procedurally drawn flowers render identically on server and client. */
export function seeded(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const r1 = (n: number) => Math.round(n * 10) / 10;

export const fmt = (p: Pt) => `${r1(p[0])},${r1(p[1])}`;

export function ring(count: number, offset = 0): number[] {
  return Array.from({ length: count }, (_, i) => offset + (360 / count) * i);
}

export function bez(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

/** Unit tangent of a cubic bezier at t. */
export function bezTan(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const x = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const y = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  const len = Math.hypot(x, y) || 1;
  return [x / len, y / len];
}

export const bezPath = (p0: Pt, p1: Pt, p2: Pt, p3: Pt) => `M${fmt(p0)} C${fmt(p1)} ${fmt(p2)} ${fmt(p3)}`;

/**
 * A frilly, serrated outline around (part of) an ellipse — used for carnations.
 * When the arc is partial the shape is closed with a straight line.
 */
export function fringePath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  a0: number,
  a1: number,
  teeth: number,
  depth: number,
  rand: () => number,
): string {
  const pts: Pt[] = [];
  const steps = teeth * 2;
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    const isPeak = i % 2 === 1;
    const k = isPeak ? 1 + rand() * depth * 0.35 : 1 - depth * (0.55 + rand() * 0.6);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  let d = `M${fmt(pts[0])}`;
  for (let i = 1; i < pts.length; i++) d += ` L${fmt(pts[i])}`;
  return d + "Z";
}

/** A pointed leaf / leaflet from `base` along unit direction `dir`. */
export function leafPath(base: Pt, dir: Pt, length: number, width: number, bulge = 0.42): string {
  const perp: Pt = [-dir[1], dir[0]];
  const tip: Pt = [base[0] + dir[0] * length, base[1] + dir[1] * length];
  const m: Pt = [base[0] + dir[0] * length * bulge, base[1] + dir[1] * length * bulge];
  const c1: Pt = [m[0] + perp[0] * width, m[1] + perp[1] * width];
  const c2: Pt = [m[0] - perp[0] * width, m[1] - perp[1] * width];
  return `M${fmt(base)} Q${fmt(c1)} ${fmt(tip)} Q${fmt(c2)} ${fmt(base)}Z`;
}

export function normalize(p: Pt): Pt {
  const l = Math.hypot(p[0], p[1]) || 1;
  return [p[0] / l, p[1] / l];
}

/** Blend two #rrggbb colours. */
export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => {
    const x = (pa >> shift) & 255;
    const y = (pb >> shift) & 255;
    return Math.round(x + (y - x) * t);
  };
  return "#" + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
}

/**
 * A fan-shaped petal with a finely frilled outer edge (carnations).
 * `a` is the centre angle in degrees, `spread` the half-width in degrees.
 */
export function frilledFan(base: Pt, a: number, spread: number, radius: number, teeth: number, depth: number, rand: () => number, squash = 1): string {
  const toRad = Math.PI / 180;
  const pts: Pt[] = [];
  const steps = teeth * 2;
  for (let i = 0; i <= steps; i++) {
    const ang = (a - spread + (2 * spread * i) / steps) * toRad;
    const edge = Math.sin((Math.PI * i) / steps);
    const k = i % 2 === 1 ? 1 : 1 - depth * (0.6 + rand() * 0.8);
    const r = radius * (0.82 + 0.18 * edge) * k;
    pts.push([base[0] + Math.cos(ang) * r, base[1] + Math.sin(ang) * r * squash]);
  }
  const l = (a - spread * 0.8) * toRad;
  const rr = (a + spread * 0.8) * toRad;
  const c1: Pt = [base[0] + Math.cos(l) * radius * 0.35, base[1] + Math.sin(l) * radius * 0.35 * squash];
  const c2: Pt = [base[0] + Math.cos(rr) * radius * 0.35, base[1] + Math.sin(rr) * radius * 0.35 * squash];
  let d = `M${fmt(base)} Q${fmt(c1)} ${fmt(pts[0])}`;
  for (let i = 1; i < pts.length; i++) d += ` L${fmt(pts[i])}`;
  return d + ` Q${fmt(c2)} ${fmt(base)}Z`;
}
