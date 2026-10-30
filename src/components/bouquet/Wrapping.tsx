"use client";

import { useSvgId } from "@/components/art/ItemArt";
import { seeded } from "@/components/art/geometry";
import { wrappingDef, type WrappingDef } from "@/lib/catalog";
import type { WrappingId } from "@/lib/types";

/* All coordinates live in the 1000 x 1200 canvas space. Stems gather at (500, 880). */

const BACK_L = "M470,930 L140,560 Q205,370 290,170 Q450,315 600,470 Z";
const BACK_L_FOLD = "M470,930 L140,560 Q205,370 290,170 Z";
const BACK_R = "M530,930 L860,560 Q795,370 710,170 Q550,315 400,470 Z";
const BACK_R_FOLD = "M530,930 L860,560 Q795,370 710,170 Z";
const TISSUE =
  "M395,830 C300,650 288,430 345,292 C395,240 450,262 500,232 C550,262 605,240 655,292 C712,430 700,650 605,830 Z";

const FRONT_L = "M505,905 L172,596 C300,640 440,676 602,708 L552,905 Z";
const FRONT_R = "M495,905 L828,596 C700,640 560,676 398,708 L448,905 Z";
const SKIRT = "M452,868 L548,868 L608,1128 Q500,1150 392,1128 Z";

function Patterns({ uid, wrap, scale = 1 }: { uid: string; wrap: WrappingDef; scale?: number }) {
  if (wrap.pattern === "floral") {
    return (
      <pattern id={`${uid}-pat`} width="84" height="84" patternUnits="userSpaceOnUse" patternTransform={`rotate(-12) scale(${scale})`}>
        <g transform="translate(20,22)">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={Math.round(Math.sin((a * Math.PI) / 180) * 5.5 * 10) / 10} cy={Math.round(-Math.cos((a * Math.PI) / 180) * 5.5 * 10) / 10} r={4.6} fill="#f2b3c6" />
          ))}
          <circle r={2.8} fill="#f4d57a" />
        </g>
        <g transform="translate(60,58) scale(0.8)">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={Math.round(Math.sin((a * Math.PI) / 180) * 5.5 * 10) / 10} cy={Math.round(-Math.cos((a * Math.PI) / 180) * 5.5 * 10) / 10} r={4.6} fill="#c8b5e8" />
          ))}
          <circle r={2.8} fill="#fff4c9" />
        </g>
        <ellipse cx="34" cy="31" rx="6" ry="2.6" transform="rotate(35 34 31)" fill="#a9c49a" />
        <ellipse cx="47" cy="50" rx="6" ry="2.6" transform="rotate(-40 47 50)" fill="#a9c49a" />
        <ellipse cx="72" cy="40" rx="5" ry="2.2" transform="rotate(70 72 40)" fill="#b9cfa9" />
        <circle cx="64" cy="14" r="1.8" fill="#e9a9bd" />
        <circle cx="10" cy="64" r="1.8" fill="#c9d7c0" />
        <circle cx="40" cy="76" r="1.5" fill="#f4d57a" />
      </pattern>
    );
  }
  if (wrap.pattern === "newspaper") {
    return (
      <pattern id={`${uid}-pat`} width="210" height="250" patternUnits="userSpaceOnUse" patternTransform={`rotate(-8) scale(${scale})`}>
        <rect x="10" y="10" width="190" height="16" fill="#5f5546" opacity="0.5" />
        <rect x="10" y="32" width="120" height="7" fill="#5f5546" opacity="0.35" />
        <rect x="80" y="54" width="56" height="48" fill="#a99c83" opacity="0.45" />
        <path d="M86,96 L100,74 L110,86 L118,78 L130,96 Z" fill="#7d7262" opacity="0.45" />
        <line x1="72" y1="48" x2="72" y2="246" stroke="#7d7262" strokeWidth="0.8" opacity="0.3" />
        <line x1="142" y1="48" x2="142" y2="246" stroke="#7d7262" strokeWidth="0.8" opacity="0.3" />
        {NEWS_LINES.map((l, i) => (
          <rect key={i} x={l.x} y={l.y} width={l.w} height="2.6" rx="1" fill="#6f6556" opacity="0.4" />
        ))}
      </pattern>
    );
  }
  return null;
}

const NEWS_LINES = (() => {
  const rnd = seeded(99);
  const out: { x: number; y: number; w: number }[] = [];
  const cols = [10, 80, 150];
  for (const x of cols) {
    for (let y = 50; y < 244; y += 7.5) {
      if (x === 80 && y < 108) continue;
      out.push({ x, y: Math.round(y * 10) / 10, w: Math.round(36 + rnd() * 20) });
    }
  }
  return out;
})();

function Sheet({ d, fold, uid, wrap }: { d: string; fold?: string; uid: string; wrap: WrappingDef }) {
  return (
    <g>
      <path d={d} fill={wrap.base} stroke={wrap.line} strokeWidth={2} strokeLinejoin="round" />
      {wrap.pattern && <path d={d} fill={`url(#${uid}-pat)`} />}
      {fold && <path d={fold} fill={wrap.shade} opacity={0.42} />}
      <path d={d} fill="none" stroke={wrap.edge} strokeWidth={5} strokeLinejoin="round" opacity={0.6} transform="translate(0,3)" />
    </g>
  );
}

/** Paper behind the flowers. */
export function WrapBack({ wrapping }: { wrapping: WrappingId }) {
  const uid = useSvgId();
  const wrap = wrappingDef(wrapping);
  if (wrap.id === "none") return null;
  return (
    <g>
      <defs>
        <Patterns uid={uid} wrap={wrap} />
      </defs>
      <ellipse cx={500} cy={1150} rx={190} ry={22} fill="#59453f" opacity={0.07} />
      <Sheet d={BACK_L} fold={BACK_L_FOLD} uid={uid} wrap={wrap} />
      <Sheet d={BACK_R} fold={BACK_R_FOLD} uid={uid} wrap={wrap} />
      <path d={TISSUE} fill={wrap.edge} stroke={wrap.line} strokeWidth={1.6} opacity={0.92} />
      <path d={TISSUE} fill="none" stroke={wrap.shade} strokeWidth={10} opacity={0.25} transform="translate(0,6)" />
    </g>
  );
}

/** Paper in front of the stems, plus the little skirt under the ribbon. */
export function WrapFront({ wrapping }: { wrapping: WrappingId }) {
  const uid = useSvgId();
  const wrap = wrappingDef(wrapping);
  if (wrap.id === "none") return null;
  const grad = `${uid}-fg`;
  return (
    <g>
      <defs>
        <Patterns uid={uid} wrap={wrap} />
        <linearGradient id={grad} x1="0" y1="600" x2="0" y2="910" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={wrap.base} />
          <stop offset="1" stopColor={wrap.shade} />
        </linearGradient>
      </defs>
      {/* skirt below the tie */}
      <path d={SKIRT} fill={`url(#${grad})`} stroke={wrap.line} strokeWidth={2} strokeLinejoin="round" />
      {wrap.pattern && <path d={SKIRT} fill={`url(#${uid}-pat)`} />}
      <path d="M484,880 L462,1136 M516,880 L540,1137 M500,880 L500,1140" stroke={wrap.line} strokeWidth={1.6} opacity={0.5} />
      <path d="M392,1128 Q500,1150 608,1128" fill="none" stroke={wrap.edge} strokeWidth={4} opacity={0.8} />

      {/* left flap */}
      <path d={FRONT_L} fill={`url(#${grad})`} stroke={wrap.line} strokeWidth={2} strokeLinejoin="round" />
      {wrap.pattern && <path d={FRONT_L} fill={`url(#${uid}-pat)`} />}
      <path d="M505,905 L300,640 M520,905 L430,672" stroke={wrap.line} strokeWidth={1.6} opacity={0.45} />
      <path d="M172,596 C300,640 440,676 602,708" fill="none" stroke={wrap.edge} strokeWidth={5} strokeLinecap="round" opacity={0.85} />

      {/* right flap, folded over the left */}
      <path d={FRONT_R} fill={`url(#${grad})`} stroke={wrap.line} strokeWidth={2} strokeLinejoin="round" />
      {wrap.pattern && <path d={FRONT_R} fill={`url(#${uid}-pat)`} />}
      <path d={FRONT_R} fill="#000" opacity={0.03} />
      <path d="M495,905 L700,640 M480,905 L570,672" stroke={wrap.line} strokeWidth={1.6} opacity={0.45} />
      <path d="M828,596 C700,640 560,676 398,708" fill="none" stroke={wrap.edge} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
      <path d="M398,708 L448,905" fill="none" stroke={wrap.shade} strokeWidth={6} opacity={0.5} />
    </g>
  );
}

/** Small swatch used in pickers. */
export function WrapSwatch({ wrapping, className }: { wrapping: WrappingId; className?: string }) {
  const uid = useSvgId();
  const wrap = wrappingDef(wrapping);
  if (wrap.id === "none") {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden>
        <path d="M30,20 L50,92 M50,14 L50,92 M72,22 L50,92" stroke="#7fa36b" strokeWidth={5} strokeLinecap="round" />
        <path d="M36,64 Q50,70 64,64 L64,74 Q50,80 36,74Z" fill="#e9a9bd" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <Patterns uid={uid} wrap={wrap} scale={0.42} />
      </defs>
      <path d="M50,96 L8,30 Q28,14 50,8 Q72,14 92,30 Z" fill={wrap.base} stroke={wrap.line} strokeWidth={2} strokeLinejoin="round" />
      {wrap.pattern && <path d="M50,96 L8,30 Q28,14 50,8 Q72,14 92,30 Z" fill={`url(#${uid}-pat)`} />}
      <path d="M50,96 L8,30 Q28,14 50,8 Z" fill={wrap.shade} opacity={0.4} />
      <path d="M8,30 Q28,14 50,8 Q72,14 92,30" fill="none" stroke={wrap.edge} strokeWidth={3} opacity={0.8} />
    </svg>
  );
}
