"use client";

import { useSvgId } from "@/components/art/ItemArt";
import { ribbonDef } from "@/lib/catalog";
import type { RibbonId } from "@/lib/types";

const TAIL_L = "M490,892 C474,940 456,1000 436,1070 L458,1058 L470,1082 C482,1012 496,950 508,894 Z";
const TAIL_R = "M510,892 C530,936 554,992 578,1056 L555,1050 L548,1074 C534,1006 518,946 492,894 Z";
const BAND = "M444,860 Q500,875 556,860 L559,902 Q500,916 441,902 Z";
const LOOP_L = "M500,884 C450,826 368,812 354,856 C342,898 420,922 500,884 Z";
const LOOP_L_IN = "M500,884 C462,856 402,846 393,868 C388,886 446,899 500,884 Z";
const LOOP_R = "M500,884 C550,826 632,812 646,856 C658,898 580,922 500,884 Z";
const LOOP_R_IN = "M500,884 C538,856 598,846 607,868 C612,886 554,899 500,884 Z";
const KNOT = "M480,866 Q500,858 520,866 Q526,884 520,902 Q500,910 480,902 Q474,884 480,866 Z";

/**
 * A satin bow tied where the stems gather. Re-mounting it (via `key`) replays
 * the tie animation: band wraps, loops pop, tails settle into a gentle sway.
 */
export function Ribbon({ ribbon, animate = true }: { ribbon: RibbonId; animate?: boolean }) {
  const uid = useSvgId();
  const r = ribbonDef(ribbon);
  if (r.id === "none") return null;
  const sheen = `${uid}-sheen`;
  const fill = r.id === "gold" ? `url(#${sheen})` : r.base;
  const a = animate ? "" : " rb-static";
  return (
    <g className={"ribbon" + a}>
      <defs>
        <linearGradient id={sheen} x1="350" y1="0" x2="650" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={r.dark} />
          <stop offset="0.3" stopColor={r.light} />
          <stop offset="0.5" stopColor={r.base} />
          <stop offset="0.72" stopColor={r.light} />
          <stop offset="1" stopColor={r.dark} />
        </linearGradient>
      </defs>
      <g className="rb-tail-l">
        <path d={TAIL_L} fill={fill} stroke={r.deep} strokeOpacity={0.45} strokeWidth={2} strokeLinejoin="round" />
        <path d="M492,900 C480,950 466,1004 452,1056" fill="none" stroke={r.light} strokeWidth={3} opacity={0.7} strokeLinecap="round" />
      </g>
      <g className="rb-tail-r">
        <path d={TAIL_R} fill={fill} stroke={r.deep} strokeOpacity={0.45} strokeWidth={2} strokeLinejoin="round" />
        <path d="M512,902 C528,946 546,996 562,1040" fill="none" stroke={r.dark} strokeWidth={3} opacity={0.4} strokeLinecap="round" />
      </g>
      <g className="rb-band">
        <path d={BAND} fill={fill} stroke={r.deep} strokeOpacity={0.45} strokeWidth={2} />
        <path d="M447,868 Q500,882 553,868" fill="none" stroke={r.light} strokeWidth={3} opacity={0.8} />
      </g>
      <g className="rb-loop-l">
        <path d={LOOP_L} fill={fill} stroke={r.deep} strokeOpacity={0.45} strokeWidth={2} strokeLinejoin="round" />
        <path d={LOOP_L_IN} fill={r.dark} opacity={0.5} />
        <path d="M480,862 C440,834 386,826 368,846" fill="none" stroke={r.light} strokeWidth={4} opacity={0.75} strokeLinecap="round" />
      </g>
      <g className="rb-loop-r">
        <path d={LOOP_R} fill={fill} stroke={r.deep} strokeOpacity={0.45} strokeWidth={2} strokeLinejoin="round" />
        <path d={LOOP_R_IN} fill={r.dark} opacity={0.5} />
        <path d="M520,862 C560,834 614,826 632,846" fill="none" stroke={r.light} strokeWidth={4} opacity={0.6} strokeLinecap="round" />
      </g>
      <g className="rb-knot">
        <path d={KNOT} fill={fill} stroke={r.deep} strokeOpacity={0.5} strokeWidth={2} />
        <path d="M486,872 Q500,866 512,872" fill="none" stroke={r.light} strokeWidth={3} opacity={0.85} strokeLinecap="round" />
      </g>
    </g>
  );
}

export function RibbonSwatch({ ribbon, className }: { ribbon: RibbonId; className?: string }) {
  const r = ribbonDef(ribbon);
  if (r.id === "none") {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden>
        <circle cx={50} cy={50} r={30} fill="none" stroke="#c9b6a8" strokeWidth={5} strokeDasharray="6 7" />
        <path d="M30,70 L70,30" stroke="#c9b6a8" strokeWidth={5} strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="345 815 310 275" className={className} aria-hidden>
      <Ribbon ribbon={ribbon} animate={false} />
    </svg>
  );
}
