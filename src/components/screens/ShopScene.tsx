"use client";

import { memo } from "react";
import { ItemGlyph } from "@/components/art/ItemArt";
import { getDef } from "@/lib/catalog";
import type { ItemKind } from "@/lib/types";

/** Places a flower illustration inside the scene SVG. */
function F({ kind, variant, x, y, w, r = 0 }: { kind: ItemKind; variant: string; x: number; y: number; w: number; r?: number }) {
  const [bx, by, bw, bh] = getDef(kind).box;
  const h = (w * bh) / bw;
  return (
    <g transform={`translate(${x},${y}) rotate(${r})`}>
      <svg x={-w / 2} y={-h / 2} width={w} height={h} viewBox={`${bx} ${by} ${bw} ${bh}`} overflow="visible">
        <ItemGlyph kind={kind} variant={variant} />
      </svg>
    </g>
  );
}

function Stalks({ x, y, spread, n = 3, color = "#7fa36b" }: { x: number; y: number; spread: number; n?: number; color?: string }) {
  return (
    <g stroke={color} strokeWidth={3} strokeLinecap="round" fill="none">
      {Array.from({ length: n }, (_, i) => {
        const dx = (i - (n - 1) / 2) * spread;
        return <path key={i} d={`M${x + dx * 0.2},${y} Q${x + dx * 0.6},${y - 30} ${x + dx},${y - 60}`} />;
      })}
    </g>
  );
}

/** A pastel zinc bucket, base centred on (x, y). */
function Bucket({ x, y, w = 70, color = "#e8e0f4", band = "#d2c5ea" }: { x: number; y: number; w?: number; color?: string; band?: string }) {
  const h = w * 0.82;
  return (
    <g>
      <path d={`M${x - w / 2},${y - h} L${x + w / 2},${y - h} L${x + w * 0.38},${y} L${x - w * 0.38},${y} Z`} fill={color} stroke="#59453f" strokeOpacity={0.18} strokeWidth={2} />
      <rect x={x - w / 2 - 3} y={y - h - 4} width={w + 6} height={9} rx={4.5} fill={band} />
      <path d={`M${x - w * 0.44},${y - h * 0.45} L${x + w * 0.44},${y - h * 0.45}`} stroke={band} strokeWidth={4} />
      <path d={`M${x - w * 0.3},${y - h + 10} L${x - w * 0.24},${y - 6}`} stroke="#fff" strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

function Shelf({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={16} rx={4} fill="#d9b48f" />
      <rect x={x} y={y + 12} width={w} height={6} rx={3} fill="#b98f6a" />
      <path d={`M${x + 24},${y + 18} l10,26 M${x + w - 24},${y + 18} l-10,26`} stroke="#b98f6a" strokeWidth={6} strokeLinecap="round" />
    </g>
  );
}

const BULBS = Array.from({ length: 15 }, (_, i) => {
  const t = (i + 0.5) / 15;
  const x = t * 1440;
  const local = (t * 2) % 1;
  const y = 116 + Math.sin(local * Math.PI) * 56;
  return { x: Math.round(x), y: Math.round(y), d: (i % 5) * 0.4 };
});

/** The illustrated shop behind the welcome screen. */
export const ShopScene = memo(function ShopScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6ec" />
          <stop offset="1" stopColor="#fbe9dc" />
        </linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dcd2f2" />
          <stop offset="0.6" stopColor="#f6dce4" />
          <stop offset="1" stopColor="#fbeedd" />
        </linearGradient>
        <radialGradient id="bulb">
          <stop offset="0" stopColor="#fff8d8" />
          <stop offset="0.4" stopColor="#f7e8a6" stopOpacity={0.9} />
          <stop offset="1" stopColor="#f7e8a6" stopOpacity={0} />
        </radialGradient>
        <pattern id="paper" width="46" height="46" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="2.2" fill="#f2cfd9" opacity="0.55" />
          <circle cx="35" cy="35" r="1.8" fill="#dcd0ef" opacity="0.55" />
        </pattern>
        <pattern id="planks" width="180" height="80" patternUnits="userSpaceOnUse">
          <rect width="180" height="80" fill="#e8cfae" />
          <path d="M0,0 H180 M0,40 H180 M60,0 V40 M140,40 V80" stroke="#d2b48f" strokeWidth="3" />
        </pattern>
      </defs>

      {/* wall */}
      <rect width="1440" height="900" fill="url(#wall)" />
      <rect width="1440" height="640" fill="url(#paper)" />

      {/* arched window */}
      <g>
        <path d="M470,640 L470,360 A250,250 0 0 1 970,360 L970,640 Z" fill="#f3e3d3" />
        <path d="M494,630 L494,364 A226,226 0 0 1 946,364 L946,630 Z" fill="url(#sky)" />
        <g fill="#fff" opacity="0.9">
          <ellipse cx="600" cy="300" rx="56" ry="18" />
          <ellipse cx="636" cy="288" rx="34" ry="18" />
          <ellipse cx="820" cy="420" rx="64" ry="20" />
          <ellipse cx="860" cy="408" rx="36" ry="18" />
          <ellipse cx="560" cy="500" rx="40" ry="12" />
        </g>
        <path d="M720,140 L720,630 M494,420 L946,420" stroke="#f3e3d3" strokeWidth="14" />
        <rect x="452" y="626" width="536" height="22" rx="6" fill="#ead5bf" />
      </g>

      {/* awning */}
      <g>
        {Array.from({ length: 25 }, (_, i) => (
          <path key={i} d={`M${i * 60},0 h60 v74 a30,24 0 0 1 -60,0 z`} fill={i % 2 ? "#fff9f2" : "#f6dce4"} />
        ))}
        <path d="M0,0 H1440 V10 H0Z" fill="#e9a9bd" opacity="0.7" />
        <rect y="0" width="1440" height="96" fill="#59453f" opacity="0.04" />
      </g>

      {/* string lights */}
      <path d="M0,116 Q360,232 720,116 Q1080,232 1440,116" fill="none" stroke="#8a746c" strokeWidth="2" opacity="0.5" />
      {BULBS.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y + 12} r="22" fill="url(#bulb)" style={{ animation: `glow-pulse 3.2s ease-in-out ${b.d}s infinite` }} />
          <rect x={b.x - 3} y={b.y} width="6" height="6" rx="1.5" fill="#8a746c" />
          <ellipse cx={b.x} cy={b.y + 12} rx="6" ry="8" fill="#fff4c4" />
        </g>
      ))}

      {/* hanging sign */}
      <g>
        <path d="M640,86 L660,150 M800,86 L780,150" stroke="#b98f6a" strokeWidth="3" />
        <rect x="620" y="146" width="200" height="62" rx="14" fill="#fffdf8" stroke="#d9b48f" strokeWidth="4" />
        <text x="720" y="186" textAnchor="middle" fontSize="30" fill="#59453f" style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic", fontWeight: 600 }}>
          Bloom
        </text>
        <circle cx="646" cy="177" r="5" fill="#e9a9bd" />
        <circle cx="794" cy="177" r="5" fill="#c9b6e8" />
      </g>

      {/* left shelves */}
      <g>
        <Shelf x={30} y={380} w={360} />
        <Shelf x={30} y={560} w={360} />
        <Stalks x={110} y={340} spread={24} />
        <F kind="tulip" variant="pink" x={92} y={286} w={48} r={-14} />
        <F kind="tulip" variant="yellow" x={118} y={272} w={48} r={4} />
        <F kind="tulip" variant="pink" x={140} y={290} w={48} r={18} />
        <Bucket x={115} y={380} color="#f6dce4" band="#e9a9bd" />
        <F kind="hydrangea" variant="blue" x={212} y={302} w={92} />
        <Bucket x={212} y={380} color="#e8e0f4" band="#cbbce7" />
        <Stalks x={310} y={340} spread={18} n={4} color="#8da08a" />
        <F kind="lavender" variant="classic" x={300} y={268} w={44} r={-8} />
        <F kind="lavender" variant="violet" x={322} y={262} w={44} r={10} />
        <Bucket x={312} y={380} color="#c9d7c0" band="#adc1a2" />

        <F kind="rose" variant="red" x={92} y={490} w={56} r={-10} />
        <F kind="rose" variant="pink" x={130} y={482} w={56} r={8} />
        <F kind="rose" variant="white" x={110} y={460} w={50} />
        <Bucket x={112} y={560} color="#f7e8a6" band="#e6c85f" />
        <F kind="peony" variant="coral" x={212} y={480} w={78} />
        <Bucket x={212} y={560} color="#f6dce4" band="#e9a9bd" />
        <F kind="daisy" variant="white" x={296} y={490} w={46} r={-12} />
        <F kind="daisy" variant="butter" x={330} y={482} w={46} r={10} />
        <F kind="daisy" variant="white" x={312} y={460} w={42} />
        <Bucket x={312} y={560} color="#e8e0f4" band="#cbbce7" />
      </g>

      {/* right shelves */}
      <g>
        <Shelf x={1050} y={380} w={360} />
        <Shelf x={1050} y={560} w={360} />
        <F kind="sunflower" variant="golden" x={1118} y={300} w={74} r={-8} />
        <Bucket x={1118} y={380} color="#c9d7c0" band="#adc1a2" />
        <F kind="lily" variant="stargazer" x={1226} y={300} w={86} r={8} />
        <Bucket x={1226} y={380} color="#f6dce4" band="#e9a9bd" />
        <F kind="carnation" variant="pink" x={1312} y={312} w={50} r={-10} />
        <F kind="carnation" variant="white" x={1346} y={300} w={50} r={12} />
        <Bucket x={1330} y={380} color="#f7e8a6" band="#e6c85f" />

        <F kind="eucalyptus" variant="silver" x={1108} y={470} w={60} r={-12} />
        <F kind="fern" variant="green" x={1134} y={466} w={66} r={14} />
        <Bucket x={1120} y={560} color="#e8e0f4" band="#cbbce7" />
        <F kind="hydrangea" variant="pink" x={1226} y={482} w={88} />
        <Bucket x={1226} y={560} color="#c9d7c0" band="#adc1a2" />
        <F kind="rose" variant="peach" x={1316} y={492} w={54} r={-10} />
        <F kind="rose" variant="yellow" x={1350} y={484} w={54} r={10} />
        <F kind="rose" variant="peach" x={1332} y={462} w={48} />
        <Bucket x={1332} y={560} color="#f6dce4" band="#e9a9bd" />
      </g>

      {/* wainscot + floor */}
      <rect y="648" width="1440" height="180" fill="#d7e1cf" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={i * 120 + 14} y="672" width="92" height="132" rx="8" fill="none" stroke="#bfcdb6" strokeWidth="3" />
      ))}
      <rect y="640" width="1440" height="12" fill="#c9d7c0" />
      <rect y="820" width="1440" height="80" fill="url(#planks)" />

      {/* floor display, centre */}
      <g>
        <F kind="sunflower" variant="golden" x={560} y={700} w={86} r={-14} />
        <F kind="sunflower" variant="lemon" x={606} y={688} w={80} r={8} />
        <Bucket x={584} y={842} w={96} color="#f7e8a6" band="#e6c85f" />
        <F kind="peony" variant="blush" x={720} y={716} w={100} />
        <F kind="rose" variant="pink" x={684} y={746} w={60} r={-12} />
        <F kind="rose" variant="pink" x={758} y={748} w={60} r={12} />
        <Bucket x={720} y={850} w={110} color="#f6dce4" band="#e9a9bd" />
        <F kind="lavender" variant="classic" x={842} y={690} w={50} r={-10} />
        <F kind="tulip" variant="purple" x={872} y={722} w={50} r={14} />
        <F kind="tulip" variant="white" x={838} y={736} w={46} r={-6} />
        <Bucket x={856} y={842} w={92} color="#e8e0f4" band="#cbbce7" />
      </g>

      {/* far floor buckets */}
      <g>
        <F kind="pampas" variant="natural" x={60} y={690} w={86} r={-10} />
        <F kind="pampas" variant="blush" x={100} y={680} w={86} r={8} />
        <Bucket x={84} y={860} w={110} color="#f3e3d3" band="#ead5bf" />
        <F kind="hydrangea" variant="lavender" x={1366} y={746} w={104} />
        <Bucket x={1366} y={860} w={110} color="#c9d7c0" band="#adc1a2" />
      </g>
    </svg>
  );
});
