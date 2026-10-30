import type { ArtProps } from "./flowers";
import { bez, bezPath, bezTan, fmt, leafPath, normalize, r1, seeded, type Pt } from "./geometry";

/* ------------------------------------------------------------------ */
/* Eucalyptus — round silver-dollar leaves                             */
/* ------------------------------------------------------------------ */

const EUC = (() => {
  const P: [Pt, Pt, Pt, Pt] = [
    [0, 96],
    [-12, 40],
    [16, -30],
    [4, -94],
  ];
  const rnd = seeded(5);
  const leaves = Array.from({ length: 13 }, (_, k) => {
    const t = 0.07 + (0.88 * k) / 12;
    const s = bez(...P, t);
    const tan = bezTan(...P, t);
    const side = k % 2 === 0 ? 1 : -1;
    const n: Pt = [-tan[1] * side, tan[0] * side];
    const r = 19 - 9 * t + rnd() * 2;
    const c: Pt = [r1(s[0] + n[0] * r * 0.95), r1(s[1] + n[1] * r * 0.95 - r * 0.15)];
    return { s, c, r: r1(r), rot: Math.round(rnd() * 40 - 20) };
  });
  return { stem: bezPath(...P), leaves };
})();

export function EucalyptusArt({ p, uid }: ArtProps) {
  const g = `${uid}-eg`;
  return (
    <g>
      <defs>
        <radialGradient id={g} cx="0.38" cy="0.35" r="0.75">
          <stop offset="0" stopColor={p.light} />
          <stop offset="0.65" stopColor={p.base} />
          <stop offset="1" stopColor={p.dark} />
        </radialGradient>
      </defs>
      <path d={EUC.stem} fill="none" stroke={p.deep} strokeWidth={2.6} strokeLinecap="round" />
      {EUC.leaves.map((l, i) => (
        <g key={i}>
          <path d={`M${fmt(l.s)} L${fmt(l.c)}`} stroke={p.deep} strokeWidth={1.4} />
          <ellipse
            cx={l.c[0]}
            cy={l.c[1]}
            rx={l.r}
            ry={r1(l.r * 0.9)}
            transform={`rotate(${l.rot} ${l.c[0]} ${l.c[1]})`}
            fill={`url(#${g})`}
            stroke={p.deep}
            strokeOpacity={0.4}
            strokeWidth={1}
          />
          <path
            d={`M${fmt([l.c[0] - l.r * 0.5, l.c[1] + l.r * 0.3])} Q${fmt(l.c)} ${fmt([l.c[0] + l.r * 0.4, l.c[1] - l.r * 0.45])}`}
            fill="none"
            stroke={p.light}
            strokeWidth={1.2}
            opacity={0.7}
          />
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Fern frond                                                          */
/* ------------------------------------------------------------------ */

const FERN = (() => {
  const P: [Pt, Pt, Pt, Pt] = [
    [0, 96],
    [8, 30],
    [-6, -40],
    [-20, -96],
  ];
  const leaflets: { d: string; vein: string; side: number }[] = [];
  const n = 22;
  for (let k = 0; k < n; k++) {
    const t = 0.1 + (0.88 * k) / (n - 1);
    const s = bez(...P, t);
    const tan = bezTan(...P, t);
    const L = 50 * (1 - t * 0.8);
    for (const side of [-1, 1]) {
      const nrm: Pt = [-tan[1] * side, tan[0] * side];
      const dir = normalize([nrm[0] * 0.85 + tan[0] * 0.5, nrm[1] * 0.85 + tan[1] * 0.5]);
      const tip: Pt = [s[0] + dir[0] * L, s[1] + dir[1] * L];
      leaflets.push({ d: leafPath(s, dir, L, L * 0.2, 0.35), vein: `M${fmt(s)} L${fmt(tip)}`, side });
    }
  }
  return { stem: bezPath(...P), leaflets };
})();

export function FernArt({ p }: ArtProps) {
  return (
    <g>
      {FERN.leaflets.map((l, i) => (
        <g key={i}>
          <path d={l.d} fill={l.side > 0 ? p.base : p.dark} stroke={p.deep} strokeOpacity={0.35} strokeWidth={0.8} />
          <path d={l.vein} stroke={p.light} strokeWidth={0.8} opacity={0.6} />
        </g>
      ))}
      <path d={FERN.stem} fill="none" stroke={p.deep} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Olive branch                                                        */
/* ------------------------------------------------------------------ */

const OLIVE = (() => {
  const P: [Pt, Pt, Pt, Pt] = [
    [0, 96],
    [-8, 40],
    [12, -30],
    [-2, -94],
  ];
  const rnd = seeded(41);
  const leaves: { d: string; half: string; vein: string }[] = [];
  const n = 15;
  for (let k = 0; k < n; k++) {
    const t = 0.1 + (0.9 * k) / (n - 1);
    const s = bez(...P, t);
    const tan = bezTan(...P, t);
    const side = k % 2 === 0 ? 1 : -1;
    const nrm: Pt = [-tan[1] * side, tan[0] * side];
    const dir = normalize([nrm[0] * 0.75 + tan[0] * 0.8, nrm[1] * 0.75 + tan[1] * 0.8]);
    const L = 44 - 16 * t + rnd() * 6;
    const w = L * 0.17;
    const tip: Pt = [s[0] + dir[0] * L, s[1] + dir[1] * L];
    const m: Pt = [s[0] + dir[0] * L * 0.45, s[1] + dir[1] * L * 0.45];
    const perp: Pt = [-dir[1], dir[0]];
    leaves.push({
      d: leafPath(s, dir, L, w, 0.45),
      half: `M${fmt(s)} Q${fmt([m[0] + perp[0] * w, m[1] + perp[1] * w])} ${fmt(tip)}Z`,
      vein: `M${fmt(s)} L${fmt(tip)}`,
    });
  }
  const olives: Pt[] = [0.3, 0.52, 0.72].map((t, i) => {
    const s = bez(...P, t);
    return [r1(s[0] + (i % 2 ? -9 : 9)), r1(s[1] + 4)];
  });
  return { stem: bezPath(...P), leaves, olives };
})();

export function OliveArt({ p }: ArtProps) {
  return (
    <g>
      <path d={OLIVE.stem} fill="none" stroke="#7c7a5c" strokeWidth={2.6} strokeLinecap="round" />
      {OLIVE.leaves.map((l, i) => (
        <g key={i}>
          <path d={l.d} fill={p.base} stroke={p.deep} strokeOpacity={0.4} strokeWidth={0.9} />
          <path d={l.half} fill={p.light} opacity={0.75} />
          <path d={l.vein} stroke={p.dark} strokeWidth={0.8} opacity={0.6} />
        </g>
      ))}
      {OLIVE.olives.map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={5.2} ry={6.6} fill={p.accent} />
          <ellipse cx={x - 1.6} cy={y - 2.2} rx={1.6} ry={2.2} fill="#fff" opacity={0.35} />
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Italian ruscus                                                      */
/* ------------------------------------------------------------------ */

const RUSCUS = (() => {
  const P: [Pt, Pt, Pt, Pt] = [
    [0, 96],
    [10, 30],
    [-12, -36],
    [4, -94],
  ];
  const leaves: { d: string; shine: string }[] = [];
  const n = 11;
  for (let k = 0; k < n; k++) {
    const t = 0.12 + (0.86 * k) / (n - 1);
    const s = bez(...P, t);
    const tan = bezTan(...P, t);
    const side = k % 2 === 0 ? 1 : -1;
    const nrm: Pt = [-tan[1] * side, tan[0] * side];
    const dir = normalize([nrm[0] * 0.9 + tan[0] * 0.65, nrm[1] * 0.9 + tan[1] * 0.65]);
    const L = 38 - 14 * t;
    const perp: Pt = [-dir[1], dir[0]];
    const m: Pt = [s[0] + dir[0] * L * 0.4, s[1] + dir[1] * L * 0.4];
    const tip: Pt = [s[0] + dir[0] * L * 0.85, s[1] + dir[1] * L * 0.85];
    leaves.push({
      d: leafPath(s, dir, L, L * 0.42, 0.4),
      shine: `M${fmt([m[0] + perp[0] * L * 0.08, m[1] + perp[1] * L * 0.08])} L${fmt(tip)}`,
    });
  }
  return { stem: bezPath(...P), leaves };
})();

export function RuscusArt({ p }: ArtProps) {
  return (
    <g>
      <path d={RUSCUS.stem} fill="none" stroke={p.deep} strokeWidth={2.2} strokeLinecap="round" />
      {RUSCUS.leaves.map((l, i) => (
        <g key={i}>
          <path d={l.d} fill={i % 3 === 0 ? p.dark : p.base} stroke={p.deep} strokeOpacity={0.45} strokeWidth={1} />
          <path d={l.shine} stroke={p.light} strokeWidth={1.8} strokeLinecap="round" opacity={0.65} />
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Pampas plume                                                        */
/* ------------------------------------------------------------------ */

const PAMPAS = (() => {
  const rnd = seeded(77);
  const fibers: { d: string; tone: 0 | 1 | 2; w: number; o: number }[] = [];
  const n = 110;
  for (let k = 0; k < n; k++) {
    const t = rnd();
    const y = -94 + t * 104;
    const x = Math.sin(t * 2.2) * 3;
    const width = 36 * Math.sin(Math.PI * (0.12 + 0.88 * t)) * (t < 0.15 ? t / 0.15 : 1) + 4;
    const side = k % 2 === 0 ? 1 : -1;
    const ex = x + side * width * (0.55 + rnd() * 0.45);
    const ey = y - 8 - rnd() * 18;
    const cx = x + side * width * 0.35;
    const cy = y - 1;
    const tone = (Math.floor(rnd() * 3) % 3) as 0 | 1 | 2;
    fibers.push({ d: `M${x.toFixed(1)},${y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`, tone, w: r1(1.5 + rnd() * 1.4), o: Math.round((0.55 + rnd() * 0.35) * 100) / 100 });
  }
  return fibers;
})();

export function PampasArt({ p }: ArtProps) {
  const tones = [p.light, p.base, p.dark];
  return (
    <g>
      <path d="M0,96 C2,60 -2,20 1,-40" fill="none" stroke={p.deep} strokeWidth={2.4} strokeLinecap="round" />
      <ellipse cx={0} cy={-40} rx={28} ry={54} fill={p.base} opacity={0.5} />
      <ellipse cx={-4} cy={-50} rx={16} ry={38} fill={p.light} opacity={0.5} />
      <g fill="none" strokeLinecap="round">
        {PAMPAS.map((f, i) => (
          <path key={i} d={f.d} stroke={tones[f.tone]} strokeWidth={f.w} opacity={f.o} />
        ))}
      </g>
    </g>
  );
}
