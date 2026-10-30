import type { Palette } from "@/lib/types";
import { fmt, frilledFan, mix, r1, ring, seeded, type Pt } from "./geometry";

export interface ArtProps {
  p: Palette;
  uid: string;
}

const LEAF = { light: "#b9d5a3", base: "#88af6e", dark: "#678f53", deep: "#4b703c" };

function Leaf({ x, y, angle, len }: { x: number; y: number; angle: number; len: number }) {
  const w = len * 0.32;
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <path
        d={`M0,0 C${-w},${-len * 0.2} ${-w * 1.05},${-len * 0.7} 0,${-len} C${w * 1.05},${-len * 0.7} ${w},${-len * 0.2} 0,0Z`}
        fill={LEAF.base}
        stroke={LEAF.deep}
        strokeOpacity={0.35}
        strokeWidth={1.2}
      />
      <path
        d={`M0,0 C${w * 0.95},${-len * 0.2} ${w},${-len * 0.7} 0,${-len}Z`}
        fill={LEAF.dark}
        opacity={0.55}
      />
      <path d={`M0,-2 L0,${-len * 0.92}`} stroke={LEAF.light} strokeWidth={1.4} strokeLinecap="round" opacity={0.75} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Rose                                                                */
/* ------------------------------------------------------------------ */

const ROSE_PETAL =
  "M0,10 C-34,8 -60,-22 -54,-56 C-49,-80 -26,-92 -7,-86 C-3,-90 3,-90 7,-86 C26,-92 49,-80 54,-56 C60,-22 34,8 0,10Z";
const ROSE_LIP = "M-49,-66 C-42,-83 -24,-90 -8,-85 M8,-85 C24,-90 42,-83 49,-66";

export function RoseArt({ p, uid }: ArtProps) {
  const g = `${uid}-rg`;
  const petal = (a: number, s: number, key: string) => (
    <g key={key} transform={`rotate(${a}) scale(${s})`}>
      <path d={ROSE_PETAL} fill={`url(#${g})`} stroke={p.deep} strokeOpacity={0.3} strokeWidth={1.3 / s} />
      <path d={ROSE_LIP} fill="none" stroke={p.light} strokeWidth={2.6 / s} strokeLinecap="round" opacity={0.9} />
    </g>
  );
  return (
    <g>
      <defs>
        <radialGradient id={g} cx="0" cy="0" r="92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.deep} />
          <stop offset="0.38" stopColor={p.dark} />
          <stop offset="0.78" stopColor={p.base} />
          <stop offset="1" stopColor={p.light} />
        </radialGradient>
      </defs>
      <Leaf x={-34} y={56} angle={-128} len={60} />
      <Leaf x={38} y={52} angle={126} len={54} />
      {ring(5, -14).map((a) => petal(a, 1, `o${a}`))}
      {ring(5, 22).map((a) => petal(a, 0.74, `m${a}`))}
      {ring(5, 52).map((a) => petal(a, 0.5, `i${a}`))}
      {/* cupped centre */}
      <path
        d="M-27,-4 C-23,-25 -2,-35 15,-29 C26,-25 31,-14 29,-5 C21,-17 7,-22 -6,-20 C-16,-18 -23,-12 -27,-4Z"
        fill={p.light}
        stroke={p.deep}
        strokeOpacity={0.3}
        strokeWidth={1.1}
      />
      <path
        d="M-22,6 C-24,-12 -10,-24 6,-22 C20,-20 27,-6 23,7 C19,19 4,24 -9,21 C-17,19 -22,13 -22,6Z"
        fill={p.dark}
      />
      <path d="M-17,8 C-20,-6 -9,-17 4,-16 C15,-15 20,-6 18,3" fill="none" stroke={p.base} strokeWidth={3} strokeLinecap="round" />
      <path d="M-9,6 C-11,-2 -5,-9 2,-9 C8,-9 11,-4 10,2 C9,8 3,11 -2,10Z" fill={p.deep} opacity={0.55} />
      <path d="M-4,2 C-4,-3 1,-5 4,-3" fill="none" stroke={p.light} strokeWidth={1.8} strokeLinecap="round" opacity={0.85} />
      <path
        d="M-31,4 C-26,24 -6,33 12,29 C26,26 34,13 32,0 C26,14 12,20 -2,20 C-14,20 -25,14 -31,4Z"
        fill={p.base}
        stroke={p.deep}
        strokeOpacity={0.3}
        strokeWidth={1.1}
      />
      <path d="M-24,12 C-14,22 4,24 18,18" fill="none" stroke={p.light} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Tulip                                                               */
/* ------------------------------------------------------------------ */

export function TulipArt({ p, uid }: ArtProps) {
  const g = `${uid}-tg`;
  const gb = `${uid}-tb`;
  const side =
    "M4,52 C-30,52 -54,24 -52,-16 C-50,-44 -42,-64 -34,-76 C-20,-56 -6,-32 -1,-2 C2,22 4,40 4,52Z";
  return (
    <g>
      <defs>
        <linearGradient id={g} x1="0" y1="-80" x2="0" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.light} />
          <stop offset="0.5" stopColor={p.base} />
          <stop offset="1" stopColor={p.dark} />
        </linearGradient>
        <linearGradient id={gb} x1="0" y1="-70" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.base} />
          <stop offset="1" stopColor={p.deep} />
        </linearGradient>
      </defs>
      <path
        d="M-34,30 C-50,0 -46,-46 -26,-70 C-16,-60 -8,-56 0,-58 C8,-56 16,-60 26,-70 C46,-46 50,0 34,30 C18,46 -18,46 -34,30Z"
        fill={`url(#${gb})`}
      />
      <path d={side} fill={`url(#${g})`} stroke={p.deep} strokeOpacity={0.3} strokeWidth={1.2} />
      <path d={side} transform="scale(-1,1)" fill={`url(#${g})`} stroke={p.deep} strokeOpacity={0.3} strokeWidth={1.2} />
      <path d="M-42,-46 C-47,-16 -42,14 -24,38" fill="none" stroke={p.light} strokeWidth={2.4} strokeLinecap="round" opacity={0.6} />
      <path
        d="M0,54 C-28,52 -36,22 -31,-14 C-27,-42 -14,-64 0,-78 C14,-64 27,-42 31,-14 C36,22 28,52 0,54Z"
        fill={`url(#${g})`}
        stroke={p.deep}
        strokeOpacity={0.32}
        strokeWidth={1.2}
      />
      <path d="M0,46 C-3,12 -3,-30 0,-66" fill="none" stroke={p.light} strokeWidth={3.2} strokeLinecap="round" opacity={0.75} />
      <path d="M14,40 C24,18 25,-14 16,-40" fill="none" stroke={p.dark} strokeWidth={2} strokeLinecap="round" opacity={0.35} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Sunflower                                                           */
/* ------------------------------------------------------------------ */

const SUN_PETAL = "M0,-30 C-11,-46 -13,-74 -2,-96 C0,-99 2,-99 4,-95 C13,-74 11,-46 0,-30Z";
const SUN_SEEDS = (() => {
  const out: { x: number; y: number; r: number; k: number }[] = [];
  const n = 150;
  for (let i = 1; i < n; i++) {
    const rad = 2.5 * Math.sqrt(i);
    const a = i * 2.39996;
    out.push({ x: r1(Math.cos(a) * rad), y: r1(Math.sin(a) * rad), r: r1(0.9 + (i / n) * 0.9), k: i % 3 });
  }
  return out;
})();

export function SunflowerArt({ p, uid }: ArtProps) {
  const g = `${uid}-sg`;
  const c = `${uid}-sc`;
  return (
    <g>
      <defs>
        <radialGradient id={g} cx="0" cy="0" r="98" gradientUnits="userSpaceOnUse">
          <stop offset="0.3" stopColor={p.deep} />
          <stop offset="0.45" stopColor={p.dark} />
          <stop offset="0.72" stopColor={p.base} />
          <stop offset="1" stopColor={p.light} />
        </radialGradient>
        <radialGradient id={c} cx="-8" cy="-10" r="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.center} />
          <stop offset="1" stopColor={p.centerDark} />
        </radialGradient>
      </defs>
      {ring(18, 10).map((a) => (
        <path key={`b${a}`} d={SUN_PETAL} transform={`rotate(${a}) scale(0.94)`} fill={p.dark} stroke={p.deep} strokeOpacity={0.3} strokeWidth={1} />
      ))}
      {ring(18, 0).map((a) => (
        <g key={`f${a}`} transform={`rotate(${a})`}>
          <path d={SUN_PETAL} fill={`url(#${g})`} stroke={p.deep} strokeOpacity={0.32} strokeWidth={1.1} />
          <path d="M1,-38 C2,-56 2,-72 1,-86" fill="none" stroke={p.light} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
        </g>
      ))}
      <circle r={39} fill={p.centerDark} />
      <circle r={35} fill={`url(#${c})`} />
      <circle r={36.5} fill="none" stroke={p.dark} strokeWidth={3} strokeDasharray="2 3" opacity={0.75} />
      {SUN_SEEDS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={s.k === 0 ? p.centerDark : s.k === 1 ? p.center : p.dark}
          opacity={s.k === 2 ? 0.55 : 0.9}
        />
      ))}
      <ellipse cx={-10} cy={-12} rx={14} ry={9} fill="#fff" opacity={0.08} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Daisy                                                               */
/* ------------------------------------------------------------------ */

const DAISY_PETAL = "M0,-13 C-6.5,-24 -8.5,-56 -2.4,-70 C-1,-73 1,-73 2.4,-70 C8.5,-56 6.5,-24 0,-13Z";
const DAISY_JITTER = (() => {
  const rnd = seeded(7);
  return ring(20, 0).map((a) => ({ a: r1(a + (rnd() - 0.5) * 6), s: Math.round((0.93 + rnd() * 0.1) * 100) / 100 }));
})();
const DAISY_DOTS = (() => {
  const out: Pt[] = [];
  for (let i = 1; i < 46; i++) {
    const rad = 2.1 * Math.sqrt(i);
    const a = i * 2.39996;
    out.push([r1(Math.cos(a) * rad), r1(Math.sin(a) * rad)]);
  }
  return out;
})();

export function DaisyArt({ p, uid }: ArtProps) {
  const g = `${uid}-dg`;
  const c = `${uid}-dc`;
  return (
    <g>
      <defs>
        <radialGradient id={g} cx="0" cy="0" r="72" gradientUnits="userSpaceOnUse">
          <stop offset="0.15" stopColor={p.dark} />
          <stop offset="0.45" stopColor={p.base} />
          <stop offset="1" stopColor={p.light} />
        </radialGradient>
        <radialGradient id={c} cx="-4" cy="-5" r="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.center} />
          <stop offset="1" stopColor={p.centerDark} />
        </radialGradient>
      </defs>
      {ring(20, 9).map((a) => (
        <path key={`b${a}`} d={DAISY_PETAL} transform={`rotate(${a}) scale(0.92)`} fill={p.dark} opacity={0.9} />
      ))}
      {DAISY_JITTER.map(({ a, s }) => (
        <g key={`f${a}`} transform={`rotate(${a}) scale(${s})`}>
          <path d={DAISY_PETAL} fill={`url(#${g})`} stroke={p.deep} strokeOpacity={0.3} strokeWidth={1} />
          <path d="M0,-20 L0,-60" stroke={p.dark} strokeWidth={0.9} opacity={0.4} />
        </g>
      ))}
      <circle r={18} fill={p.centerDark} />
      <circle r={16} fill={`url(#${c})`} />
      {DAISY_DOTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.15} fill={i % 2 ? p.centerDark : "#fff6cf"} opacity={i % 2 ? 0.7 : 0.55} />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Peony                                                               */
/* ------------------------------------------------------------------ */

const PEONY_PETAL =
  "M0,8 C-30,6 -60,-18 -62,-46 C-64,-66 -52,-80 -38,-82 C-32,-91 -19,-95 -8,-89 C-2,-95 9,-95 15,-89 C26,-93 40,-87 46,-77 C60,-72 66,-56 60,-40 C54,-18 30,6 0,8Z";
const PEONY_LIP = "M-36,-80 C-30,-90 -18,-93 -8,-88 M15,-88 C26,-92 39,-86 45,-76";

export function PeonyArt({ p, uid }: ArtProps) {
  const g = `${uid}-pg`;
  const layer = (n: number, offset: number, s: number, lip: boolean) =>
    ring(n, offset).map((a) => (
      <g key={`${s}-${a}`} transform={`rotate(${a}) scale(${s})`}>
        <path d={PEONY_PETAL} fill={`url(#${g})`} stroke={p.deep} strokeOpacity={0.26} strokeWidth={1.2 / s} />
        {lip && <path d={PEONY_LIP} fill="none" stroke={p.light} strokeWidth={2.4 / s} strokeLinecap="round" opacity={0.85} />}
      </g>
    ));
  return (
    <g>
      <defs>
        <radialGradient id={g} cx="0" cy="0" r="94" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.deep} />
          <stop offset="0.32" stopColor={p.dark} />
          <stop offset="0.72" stopColor={p.base} />
          <stop offset="1" stopColor={p.light} />
        </radialGradient>
      </defs>
      <Leaf x={-46} y={54} angle={-122} len={58} />
      <Leaf x={52} y={46} angle={118} len={50} />
      {layer(7, -6, 1, true)}
      {layer(7, 22, 0.8, true)}
      {layer(6, 8, 0.62, true)}
      {layer(6, 36, 0.45, false)}
      {layer(5, 14, 0.3, false)}
      {[-6, 4, 12, -12, 0].map((x, i) => (
        <circle key={i} cx={x} cy={[-4, -9, 2, 4, 8][i]} r={2.2} fill={p.accent} opacity={0.85} />
      ))}
      <path d="M-14,-8 C-8,-16 6,-16 12,-6" fill="none" stroke={p.light} strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />
      <path d="M-10,8 C-2,14 8,12 14,4" fill="none" stroke={p.deep} strokeWidth={1.6} strokeLinecap="round" opacity={0.35} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Lily                                                                */
/* ------------------------------------------------------------------ */

const LILY_PETAL =
  "M0,0 C-20,-14 -28,-50 -15,-82 C-10,-93 -4,-99 0,-102 C4,-99 10,-93 15,-82 C28,-50 20,-14 0,0Z";
const LILY_SPECKS: [number, number, number][] = [
  [-5, -22, 1.8],
  [5, -28, 2.1],
  [-7, -36, 1.6],
  [6, -42, 1.9],
  [-2, -48, 1.5],
  [9, -20, 1.4],
  [-10, -29, 1.3],
  [2, -56, 1.2],
  [-4, -62, 1.1],
];

export function LilyArt({ p, uid }: ArtProps) {
  const g = `${uid}-lg`;
  const petal = (a: number, back: boolean) => (
    <g key={`${back ? "b" : "f"}${a}`} transform={`rotate(${a}) ${back ? "scale(1.08,0.94)" : ""}`}>
      <path d={LILY_PETAL} fill={`url(#${g})`} stroke={p.deep} strokeOpacity={0.32} strokeWidth={1.2} opacity={back ? 0.94 : 1} />
      <path d="M0,-8 C-2,-40 -1,-70 0,-95" fill="none" stroke={p.dark} strokeWidth={1.5} opacity={0.5} />
      <path d="M4,-14 C5,-42 5,-68 3,-90" fill="none" stroke={p.light} strokeWidth={2} opacity={0.75} strokeLinecap="round" />
      <path d="M-15,-80 C-19,-66 -22,-52 -21,-40" fill="none" stroke={p.light} strokeWidth={1.6} opacity={0.7} strokeLinecap="round" />
      {!back &&
        LILY_SPECKS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={p.spots ?? p.deep} opacity={p.spots ? 0.85 : 0.35} />
        ))}
    </g>
  );
  return (
    <g>
      <defs>
        <radialGradient id={g} cx="0" cy="0" r="104" gradientUnits="userSpaceOnUse">
          <stop offset="0.04" stopColor={p.center} />
          <stop offset="0.26" stopColor={p.dark} />
          <stop offset="0.62" stopColor={p.base} />
          <stop offset="1" stopColor={p.light} />
        </radialGradient>
      </defs>
      {ring(3, 60).map((a) => petal(a, true))}
      {ring(3, 0).map((a) => petal(a, false))}
      <circle r={11} fill={p.center} opacity={0.9} />
      {ring(6, 30).map((a, i) => {
        const len = 50 + (i % 2) * 6;
        return (
          <g key={a} transform={`rotate(${a})`}>
            <path d={`M0,0 C4,${-len * 0.4} -3,${-len * 0.75} 0,${-len}`} fill="none" stroke="#e7ebc4" strokeWidth={1.8} strokeLinecap="round" />
            <ellipse cx={0} cy={-len - 2} rx={6.5} ry={2.7} fill={p.accent} />
            <ellipse cx={-1.5} cy={-len - 3} rx={2.6} ry={1} fill="#fff" opacity={0.3} />
          </g>
        );
      })}
      <path d="M0,0 C-2,-24 6,-44 4,-62" fill="none" stroke="#cfdc9a" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={4} cy={-63} r={4} fill="#b6c978" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Carnation                                                           */
/* ------------------------------------------------------------------ */

const CARN = (() => {
  const rnd = seeded(31);
  const c: Pt = [0, -10];
  // a ruffled pom-pom: rings of frilled fans, darker outside, lighter toward the heart
  const layers: { d: string; tone: 0 | 1 | 2 | 3 }[] = [];
  const ringOf = (n: number, offset: number, spread: number, radius: number, tone: 0 | 1 | 2 | 3) => {
    for (let i = 0; i < n; i++) {
      const a = offset + (360 / n) * i + (rnd() - 0.5) * 10;
      const b: Pt = [c[0] + (rnd() - 0.5) * 6, c[1] + (rnd() - 0.5) * 6];
      layers.push({ d: frilledFan(b, a, spread, radius * (0.9 + rnd() * 0.16), 11, 0.08, rnd), tone });
    }
  };
  ringOf(12, 0, 20, 58, 3);
  ringOf(10, 16, 21, 48, 2);
  ringOf(8, 6, 23, 37, 1);
  ringOf(6, 30, 26, 26, 0);
  ringOf(4, 12, 30, 15, 0);
  const lines = Array.from({ length: 18 }, () => {
    const a = rnd() * Math.PI * 2;
    const r0 = 10 + rnd() * 10;
    const r1v = 30 + rnd() * 22;
    return `M${fmt([c[0] + Math.cos(a) * r0, c[1] + Math.sin(a) * r0])} L${fmt([c[0] + Math.cos(a) * r1v, c[1] + Math.sin(a) * r1v])}`;
  });
  return { layers, lines };
})();

export function CarnationArt({ p }: ArtProps) {
  const tones = [p.light, mix(p.light, p.base, 0.55), p.base, p.dark];
  return (
    <g>
      <path d="M-15,30 C-16,44 -11,58 -6,66 L6,66 C11,58 16,44 15,30Z" fill="#8aab8e" stroke="#5f8566" strokeOpacity={0.4} />
      <path d="M-7,40 L-4,62 M7,40 L4,62" stroke="#6f9473" strokeWidth={1.2} opacity={0.6} />
      <path d="M-20,36 L-14,52 L-8,40 L0,56 L8,40 L14,52 L20,36Z" fill="#7fa283" />
      {CARN.layers.slice(0, 22).map((l, i) => (
        <path key={`a${i}`} d={l.d} fill={tones[l.tone]} stroke={p.deep} strokeOpacity={0.32} strokeWidth={0.9} />
      ))}
      <g opacity={0.35}>
        {CARN.lines.map((d, i) => (
          <path key={i} d={d} stroke={p.deep} strokeWidth={0.9} />
        ))}
      </g>
      {CARN.layers.slice(22).map((l, i) => (
        <path key={`b${i}`} d={l.d} fill={tones[l.tone]} stroke={p.deep} strokeOpacity={0.3} strokeWidth={0.9} />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Hydrangea                                                           */
/* ------------------------------------------------------------------ */

const FLORET =
  "M0,0 C-6,-2 -9,-9 -4,-13 C-2,-14.5 2,-14.5 4,-13 C9,-9 6,-2 0,0 C2,-6 9,-9 13,-4 C14.5,-2 14.5,2 13,4 C9,9 2,6 0,0 C6,2 9,9 4,13 C2,14.5 -2,14.5 -4,13 C-9,9 -6,2 0,0 C-2,6 -9,9 -13,4 C-14.5,2 -14.5,-2 -13,-4 C-9,-9 -2,-6 0,0Z";
const HYD = (() => {
  const rnd = seeded(11);
  const n = 64;
  const out: { x: number; y: number; s: number; r: number; light: number }[] = [];
  for (let i = 0; i < n; i++) {
    const rad = 82 * Math.sqrt((i + 0.5) / n);
    const a = i * 2.39996 + rnd() * 0.3;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad * 0.94;
    // soft light from the upper left, plus a little randomness so it feels hand-painted
    const light = Math.min(1, Math.max(0, 0.55 + (-x * 0.3 - y * 0.55) / 110 + (rnd() - 0.5) * 0.45 - (rad / 82) * 0.25));
    out.push({ x: r1(x), y: r1(y), s: Math.round((0.92 + rnd() * 0.3) * 100) / 100, r: Math.round(rnd() * 90), light: Math.round(light * 100) / 100 });
  }
  return out.sort((a, b) => Math.hypot(b.x, b.y) - Math.hypot(a.x, a.y));
})();

export function HydrangeaArt({ p, uid }: ArtProps) {
  const g = `${uid}-hg`;
  const tone = (t: number) => (t < 0.5 ? mix(p.dark, p.base, t * 2) : mix(p.base, p.light, (t - 0.5) * 2));
  return (
    <g>
      <defs>
        <radialGradient id={g} cx="-20" cy="-24" r="110" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.base} />
          <stop offset="0.7" stopColor={p.dark} />
          <stop offset="1" stopColor={p.deep} />
        </radialGradient>
      </defs>
      <Leaf x={-50} y={58} angle={-124} len={56} />
      <Leaf x={54} y={54} angle={122} len={52} />
      <circle r={86} fill={`url(#${g})`} />
      {HYD.map((f, i) => (
        <g key={i} transform={`translate(${f.x},${f.y}) rotate(${f.r}) scale(${f.s})`}>
          <path d={FLORET} fill={tone(f.light)} stroke={p.deep} strokeOpacity={0.22} strokeWidth={0.7} />
          <circle r={1.6} fill={p.deep} opacity={0.6} />
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Baby's breath                                                       */
/* ------------------------------------------------------------------ */

const BB = (() => {
  const rnd = seeded(23);
  const j: Pt = [0, 14];
  const branches: string[] = [];
  const twigs: string[] = [];
  const clusters: Pt[] = [];
  const tips = 7;
  for (let k = 0; k < tips; k++) {
    const a = (-165 + (150 * k) / (tips - 1) + (rnd() - 0.5) * 10) * (Math.PI / 180);
    const R = 64 + rnd() * 22;
    const tip: Pt = [j[0] + Math.cos(a) * R * 1.12, j[1] - 22 + Math.sin(a) * R];
    const ctrl: Pt = [j[0] + (tip[0] - j[0]) * 0.18, j[1] + (tip[1] - j[1]) * 0.72];
    branches.push(`M${fmt(j)} Q${fmt(ctrl)} ${fmt(tip)}`);
    clusters.push(tip);
    // two twigs off each branch
    for (let t = 0; t < 2; t++) {
      const f = 0.45 + t * 0.22;
      const u = 1 - f;
      const mid: Pt = [
        u * u * j[0] + 2 * u * f * ctrl[0] + f * f * tip[0],
        u * u * j[1] + 2 * u * f * ctrl[1] + f * f * tip[1],
      ];
      const side = t === 0 ? -1 : 1;
      const ta = a + side * (0.5 + rnd() * 0.35);
      const len = 18 + rnd() * 16;
      const end: Pt = [mid[0] + Math.cos(ta) * len, mid[1] + Math.sin(ta) * len];
      twigs.push(`M${fmt(mid)} L${fmt(end)}`);
      clusters.push(end);
    }
  }
  const florets: { x: number; y: number; r: number }[] = [];
  for (const c of clusters) {
    const count = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const d = i === 0 ? 0 : 4 + rnd() * 4;
      florets.push({ x: r1(c[0] + Math.cos(a) * d), y: r1(c[1] + Math.sin(a) * d), r: r1(3.4 + rnd() * 1.6) });
    }
  }
  return { branches, twigs, florets, main: `M0,92 C1,66 -2,40 ${fmt(j)}` };
})();

export function BabysBreathArt({ p }: ArtProps) {
  return (
    <g>
      <g fill="none" stroke="#9db58a" strokeLinecap="round">
        <path d={BB.main} strokeWidth={2.6} />
        {BB.branches.map((d, i) => (
          <path key={i} d={d} strokeWidth={1.7} />
        ))}
        {BB.twigs.map((d, i) => (
          <path key={i} d={d} strokeWidth={1.2} />
        ))}
      </g>
      {BB.florets.map((f, i) => (
        <g key={i}>
          <circle cx={f.x} cy={f.y} r={f.r} fill={p.base} stroke={p.dark} strokeWidth={0.8} />
          <circle cx={f.x - f.r * 0.25} cy={f.y - f.r * 0.25} r={f.r * 0.5} fill={p.light} />
          <circle cx={f.x} cy={f.y} r={0.7} fill={p.dark} />
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Lavender                                                            */
/* ------------------------------------------------------------------ */

const LAV = (() => {
  const spikes: { base: Pt; tip: Pt }[] = [
    { base: [-2, 96], tip: [-32, -82] },
    { base: [2, 96], tip: [30, -86] },
    { base: [0, 96], tip: [0, -97] },
  ];
  return spikes.map(({ base, tip }) => {
    const dx = tip[0] - base[0];
    const dy = tip[1] - base[1];
    const len = Math.hypot(dx, dy);
    const dir: Pt = [dx / len, dy / len];
    const perp: Pt = [Math.round(-dir[1] * 1000) / 1000, Math.round(dir[0] * 1000) / 1000];
    const angle = r1((Math.atan2(dir[1], dir[0]) * 180) / Math.PI + 90);
    const n = 15;
    const whorls = Array.from({ length: n }, (_, j) => {
      const q = j / (n - 1);
      const t = 0.4 + 0.6 * (1 - Math.pow(1 - q, 1.25));
      const f = 1 - 0.55 * q;
      return { c: [r1(base[0] + dx * t), r1(base[1] + dy * t)] as Pt, f: Math.round(f * 100) / 100, j };
    });
    return { base, tip, perp, angle, whorls };
  });
})();

export function LavenderArt({ p }: ArtProps) {
  return (
    <g>
      {LAV.map((s, si) => (
        <g key={si}>
          <path d={`M${fmt(s.base)} L${fmt(s.tip)}`} stroke="#8da08a" strokeWidth={2.4} strokeLinecap="round" />
          {s.whorls.map(({ c, f, j }) => {
            const odd = j % 2 === 1;
            const off = 5.2 * f;
            return (
              <g key={j}>
                <ellipse
                  cx={c[0] - s.perp[0] * off}
                  cy={c[1] - s.perp[1] * off}
                  rx={4.4 * f}
                  ry={6.6 * f}
                  transform={`rotate(${s.angle - 32} ${c[0] - s.perp[0] * off} ${c[1] - s.perp[1] * off})`}
                  fill={odd ? p.base : p.dark}
                />
                <ellipse
                  cx={c[0] + s.perp[0] * off}
                  cy={c[1] + s.perp[1] * off}
                  rx={4.4 * f}
                  ry={6.6 * f}
                  transform={`rotate(${s.angle + 32} ${c[0] + s.perp[0] * off} ${c[1] + s.perp[1] * off})`}
                  fill={odd ? p.dark : p.base}
                />
                <ellipse
                  cx={c[0]}
                  cy={c[1]}
                  rx={3.8 * f}
                  ry={6 * f}
                  transform={`rotate(${s.angle} ${c[0]} ${c[1]})`}
                  fill={odd ? p.light : p.base}
                  stroke={p.deep}
                  strokeOpacity={0.3}
                  strokeWidth={0.6}
                />
              </g>
            );
          })}
          <ellipse cx={s.tip[0]} cy={s.tip[1]} rx={2.6} ry={4.4} transform={`rotate(${s.angle} ${s.tip[0]} ${s.tip[1]})`} fill={p.dark} />
        </g>
      ))}
    </g>
  );
}
