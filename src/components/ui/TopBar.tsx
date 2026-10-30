"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { sound } from "@/lib/sound";
import { SoundToggle } from "./SoundToggle";

export const STEPS = [
  { href: "/shop", label: "Pick" },
  { href: "/studio", label: "Arrange" },
  { href: "/wrap", label: "Wrap" },
  { href: "/note", label: "Note" },
  { href: "/send", label: "Send" },
] as const;

function StepNav({ current }: { current: number }) {
  return (
    <nav aria-label="Bouquet steps" className="flex items-center gap-1">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.href} className="flex items-center gap-1">
            {i > 0 && <span className={`h-px w-3 sm:w-5 ${i <= current ? "bg-rosewood/60" : "bg-cocoa/15"}`} />}
            <Link
              href={s.href}
              onClick={() => sound.play("tap")}
              aria-current={active ? "step" : undefined}
              className={`group flex items-center gap-1.5 rounded-full px-1.5 py-1 text-xs font-bold transition sm:px-2 ${
                active ? "bg-blush text-cocoa" : done ? "text-cocoa hover:bg-cocoa/5" : "text-cocoa-soft/70 hover:text-cocoa"
              }`}
            >
              <svg viewBox="-10 -10 20 20" className="h-3.5 w-3.5 shrink-0">
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse
                    key={a}
                    cx={0}
                    cy={-4.4}
                    rx={2.9}
                    ry={4.2}
                    transform={`rotate(${a})`}
                    fill={active ? "#c9718c" : done ? "#e9a9bd" : "#e3d6cc"}
                  />
                ))}
                <circle r={2.4} fill={active || done ? "#f7e8a6" : "#fff9f2"} />
              </svg>
              <span className={active ? "inline" : "hidden md:inline"}>{s.label}</span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

export function TopBar({
  step,
  backHref,
  backLabel = "Back",
  right,
  title,
}: {
  step?: number;
  backHref?: string;
  backLabel?: string;
  right?: ReactNode;
  title?: ReactNode;
}) {
  return (
    <header className="relative z-30 flex items-center gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            aria-label={backLabel}
            onClick={() => sound.play("tap")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper text-cocoa ring-1 ring-cocoa/12 transition hover:bg-white active:scale-95"
          >
            <ArrowLeft size={18} />
          </Link>
        )}
        <Link href="/" className="hidden items-center gap-1.5 font-serif text-xl font-semibold italic text-cocoa lg:flex" onClick={() => sound.play("tap")}>
          <BloomMark className="h-6 w-6" />
          Bloom
        </Link>
        {title}
      </div>
      {step !== undefined && (
        <div className="absolute left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] hidden -translate-x-1/2 sm:block">
          <div className="rounded-full bg-paper/80 px-2 py-1 ring-1 ring-cocoa/8 backdrop-blur">
            <StepNav current={step} />
          </div>
        </div>
      )}
      <div className="flex shrink-0 items-center gap-2">
        {right}
        <SoundToggle />
      </div>
      {step !== undefined && (
        <div className="absolute inset-x-0 -bottom-7 flex justify-center sm:hidden">
          <div className="rounded-full bg-paper/80 px-1 py-0.5 ring-1 ring-cocoa/8 backdrop-blur">
            <StepNav current={step} />
          </div>
        </div>
      )}
    </header>
  );
}

export function BloomMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" className={className} aria-hidden>
      {[0, 72, 144, 216, 288].map((a, i) => (
        <ellipse key={a} cx={0} cy={-5.6} rx={4} ry={5.8} transform={`rotate(${a})`} fill={["#f6b8ca", "#e9a9bd", "#f6b8ca", "#c9b6e8", "#f6b8ca"][i]} />
      ))}
      <circle r={3.4} fill="#f7e8a6" stroke="#e6c85f" strokeWidth={0.8} />
    </svg>
  );
}
