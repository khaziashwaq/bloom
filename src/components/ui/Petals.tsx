"use client";

import { useMemo } from "react";
import { seeded } from "@/components/art/geometry";

const COLORS = ["#f6c6d4", "#f2b3c6", "#e8e0f4", "#d9c8f0", "#f7e8a6", "#fff3f6", "#f9d9c8"];
const SHAPES = [
  "M0,-10 C6,-8 8,0 0,10 C-8,0 -6,-8 0,-10Z",
  "M0,-9 C7,-9 9,-2 4,6 C2,9 -2,9 -4,6 C-9,-2 -7,-9 0,-9Z",
  "M-2,-10 C6,-9 9,1 2,9 C-1,11 -5,8 -6,4 C-8,-3 -6,-9 -2,-10Z",
];

interface Petal {
  left: number;
  size: number;
  dur: number;
  delay: number;
  drift: number;
  spin: number;
  color: string;
  shape: string;
  sway: number;
  opacity: number;
}

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

function makePetals(count: number, seed: number): Petal[] {
  const rnd = seeded(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  return Array.from({ length: count }, () => ({
    left: round(rnd() * 100),
    size: round(12 + rnd() * 16, 1),
    dur: round(11 + rnd() * 12, 1),
    delay: round(-rnd() * 20, 1),
    drift: Math.round((rnd() - 0.3) * 220),
    spin: Math.round((rnd() > 0.5 ? 1 : -1) * (240 + rnd() * 480)),
    color: pick(COLORS),
    shape: pick(SHAPES),
    sway: round(3 + rnd() * 3, 1),
    opacity: round(0.55 + rnd() * 0.4),
  }));
}

/**
 * Soft petals drifting down the screen. Pure CSS animation; the layout is seeded
 * so server and browser render the same petals. Phones get fewer of them.
 */
export function PetalField({ count = 18, className = "" }: { count?: number; className?: string }) {
  const petals = useMemo(() => makePetals(count, 1000 + count), [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {petals.map((p, i) => (
        <div
          key={i}
          className={`absolute top-0 ${i % 5 >= 3 ? "hidden sm:block" : ""}`}
          style={
            {
              left: `${p.left}%`,
              animation: `petal-fall ${p.dur}s linear ${p.delay}s infinite`,
              "--petal-drift": `${p.drift}px`,
              "--petal-spin": `${p.spin}deg`,
              "--petal-opacity": p.opacity,
            } as React.CSSProperties
          }
        >
          <div style={{ animation: `petal-sway ${p.sway}s ease-in-out infinite` }}>
            <svg viewBox="-11 -11 22 22" width={p.size} height={p.size}>
              <path d={p.shape} fill={p.color} />
              <path d="M0,-6 C1,-2 1,2 0,6" stroke="#fff" strokeOpacity={0.5} strokeWidth={0.8} fill="none" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

/** A one-shot burst of petals and sparkles, e.g. when a gift opens. */
export function PetalBurst({ count = 26, originY = 50, seed = 1 }: { count?: number; originY?: number; seed?: number }) {
  const bits = useMemo(() => {
    const rnd = seeded(seed * 7919 + count);
    return Array.from({ length: count }, () => {
      const a = rnd() * Math.PI * 2;
      const dist = 120 + rnd() * 260;
      return {
        x: Math.round(Math.cos(a) * dist),
        y: Math.round(Math.sin(a) * dist * 0.8 - 80),
        r: Math.round((rnd() - 0.5) * 720),
        s: round(10 + rnd() * 14, 1),
        c: COLORS[Math.floor(rnd() * COLORS.length)],
        d: round(rnd() * 0.15),
        shape: SHAPES[Math.floor(rnd() * SHAPES.length)],
      };
    });
  }, [count, seed]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {bits.map((b, i) => (
        <svg
          key={i}
          viewBox="-11 -11 22 22"
          width={b.s}
          height={b.s}
          className="absolute left-1/2"
          style={
            {
              top: `${originY}%`,
              animation: `burst 1.6s cubic-bezier(.15,.7,.3,1) ${b.d}s both`,
              "--bx": `${b.x}px`,
              "--by": `${b.y}px`,
              "--br": `${b.r}deg`,
            } as React.CSSProperties
          }
        >
          <path d={b.shape} fill={b.c} />
        </svg>
      ))}
    </div>
  );
}
