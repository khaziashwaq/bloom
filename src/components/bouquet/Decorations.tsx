"use client";

import type { Decorations as DecorationsT, RibbonId, WrappingId } from "@/lib/types";

const HEART = "M0,9 C-14,-2 -20,-14 -12,-21 C-6,-26 0,-21 0,-15 C0,-21 6,-26 12,-21 C20,-14 14,-2 0,9Z";
const SPARK = "M0,-16 C2,-5 5,-2 16,0 C5,2 2,5 0,16 C-2,5 -5,2 -16,0 C-5,-2 -2,-5 0,-16Z";

const HEARTS: [number, number, number, string][] = [
  [168, 300, 1.15, "#ee9db5"],
  [836, 262, 0.95, "#e57a98"],
  [120, 640, 0.8, "#f3b6c7"],
  [884, 600, 1.05, "#ee9db5"],
  [300, 120, 0.7, "#f3b6c7"],
  [716, 108, 0.85, "#e57a98"],
  [848, 900, 0.75, "#f3b6c7"],
  [150, 930, 0.9, "#ee9db5"],
];

const SPARKS: [number, number, number, string][] = [
  [232, 210, 1.1, "#f2cf63"],
  [790, 180, 0.9, "#ffffff"],
  [100, 470, 0.8, "#f2cf63"],
  [906, 430, 1.2, "#f7e3a0"],
  [470, 92, 0.85, "#f2cf63"],
  [610, 70, 0.6, "#ffffff"],
  [244, 760, 0.7, "#f7e3a0"],
  [780, 770, 0.9, "#f2cf63"],
  [880, 1010, 0.7, "#ffffff"],
];

function fitSize(text: string, max: number, min: number, perChar: number) {
  return Math.max(min, Math.min(max, max - Math.max(0, text.length - 7) * perChar));
}

/** Hearts, sparkles, a gift tag on the bow and a little handwritten label. */
export function Decorations({ decorations, ribbon, wrapping }: { decorations: DecorationsT; ribbon: RibbonId; wrapping: WrappingId }) {
  const { hearts, sparkles, tag, tagText, label, labelText } = decorations;
  const tagY = ribbon === "none" ? 900 : 884;
  return (
    <g>
      {hearts &&
        HEARTS.map(([x, y, s, c], i) => (
          <g key={`h${i}`} transform={`translate(${x},${y})`}>
            <g className="deco-heart" style={{ animationDelay: `${i * -0.7}s` }}>
              <path d={HEART} transform={`scale(${s * 1.5})`} fill={c} stroke="#c9718c" strokeOpacity={0.4} strokeWidth={1.2} />
              <path d="M-10,-14 C-8,-17 -5,-17 -3,-15" transform={`scale(${s * 1.5})`} fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
            </g>
          </g>
        ))}
      {sparkles &&
        SPARKS.map(([x, y, s, c], i) => (
          <g key={`s${i}`} transform={`translate(${x},${y})`}>
            <g className="deco-spark" style={{ animationDelay: `${(i * 0.37) % 2.4}s` }}>
              <path d={SPARK} transform={`scale(${s * 1.4})`} fill={c} stroke="#d6a53a" strokeOpacity={c === "#ffffff" ? 0.5 : 0.25} strokeWidth={1} />
            </g>
          </g>
        ))}
      {tag && tagText.trim() && (
        <g>
          <path d={`M506,${tagY + 8} C540,${tagY + 60} 600,${tagY + 74} 628,${tagY + 102}`} fill="none" stroke="#b49a7a" strokeWidth={2.4} />
          <g transform={`translate(626,${tagY + 100}) rotate(16)`}>
            <g className="deco-tag">
              <path d="M0,-20 L20,-38 L148,-38 Q156,-38 156,-30 L156,30 Q156,38 148,38 L20,38 L0,20 Z" fill="#f0dcbc" stroke="#b49a7a" strokeWidth={2} />
              <path d="M6,-17 L22,-31 L146,-31 L146,31 L22,31 L6,17 Z" fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={1.4} strokeDasharray="5 5" />
              <circle cx={18} cy={0} r={6} fill="#fff9f2" stroke="#b49a7a" strokeWidth={2} />
              <text
                x={88}
                y={10}
                textAnchor="middle"
                fontSize={fitSize(tagText, 34, 18, 1.6)}
                fill="#59453f"
                style={{ fontFamily: "var(--font-hand)" }}
              >
                {tagText}
              </text>
            </g>
          </g>
        </g>
      )}
      {label && labelText.trim() && (
        <g transform={`translate(${wrapping === "none" ? 300 : 330},${wrapping === "none" ? 980 : 790}) rotate(-9)`}>
          <g className="deco-label">
            <rect x={-104} y={-32} width={208} height={64} rx={8} fill="#fffdf8" stroke="#d8c6b4" strokeWidth={1.6} />
            <rect x={-96} y={-25} width={192} height={50} rx={5} fill="none" stroke="#e9a9bd" strokeOpacity={0.6} strokeWidth={1.4} />
            <rect x={-122} y={-14} width={46} height={18} transform="rotate(-24 -99 -5)" fill="#f6dce4" opacity={0.85} />
            <rect x={78} y={-4} width={46} height={18} transform="rotate(-24 101 5)" fill="#e8e0f4" opacity={0.85} />
            <text
              x={0}
              y={11}
              textAnchor="middle"
              fontSize={fitSize(labelText, 36, 20, 1.5)}
              fill="#59453f"
              style={{ fontFamily: "var(--font-hand)" }}
            >
              {labelText}
            </text>
          </g>
        </g>
      )}
    </g>
  );
}
