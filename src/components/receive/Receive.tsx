"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flower2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState, type ReactNode } from "react";
import { BouquetStage } from "@/components/bouquet/BouquetStage";
import { GreetingCard } from "@/components/card/GreetingCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PetalBurst, PetalField } from "@/components/ui/Petals";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { BloomMark } from "@/components/ui/TopBar";
import { sound } from "@/lib/sound";
import { loadBouquet, type LoadResult } from "@/lib/storage";
import type { Bouquet } from "@/lib/types";
import { GiftBox } from "./GiftBox";

type Phase = "closed" | "opening" | "open";

export function ReceiveLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [state, setState] = useState<LoadResult | null>(null);

  useEffect(() => {
    let alive = true;
    void loadBouquet(id, window.location.hash).then((r) => alive && setState(r));
    return () => {
      alive = false;
    };
  }, [id]);

  if (!state) return <Waiting />;
  if (!state.ok) return <Wilted reason={state.reason} />;
  return <Reveal bouquet={state.bouquet} />;
}

export function Waiting() {
  return (
    <Frame>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <GiftBox open={false} />
        <p className="font-serif text-xl italic text-cocoa-soft">Your delivery is on its way…</p>
      </div>
    </Frame>
  );
}

function Wilted({ reason }: { reason: "invalid" | "not-found" | "network" }) {
  const copy = {
    invalid: "This link seems to have been snipped short — the bouquet inside it can't be read. Ask the sender to copy the whole link again.",
    "not-found": "We couldn't find this bouquet. It may have been sent from a version of the shop that keeps bouquets somewhere else.",
    network: "We couldn't reach the flower cloud just now. Check your connection and try again.",
  }[reason];
  return (
    <Frame>
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="relative h-28 w-28 rotate-[24deg] opacity-80 grayscale-[0.4]">
          <svg viewBox="-60 -60 120 120" className="h-full w-full">
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={0} cy={-22} rx={14} ry={22} transform={`rotate(${a}) translate(0 ${a === 144 ? 10 : 0})`} fill="#e9c4cf" />
            ))}
            <circle r={12} fill="#e6c85f" />
          </svg>
        </div>
        <h1 className="mt-4 font-serif text-3xl font-medium text-cocoa">This bouquet wilted on the way</h1>
        <p className="mt-2 text-cocoa-soft">{copy}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {reason === "network" && (
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Try again
            </Button>
          )}
          <ButtonLink href="/" variant="rose">
            Make a bouquet of your own
          </ButtonLink>
        </div>
      </div>
    </Frame>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#fff_0%,#fbeaf0_45%,#efe7f7_100%)]">
      <PetalField count={16} />
      <header className="relative z-10 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-full bg-paper/80 py-1.5 pl-2 pr-4 font-serif text-lg font-semibold italic text-cocoa ring-1 ring-cocoa/10 backdrop-blur">
          <BloomMark className="h-6 w-6" /> Bloom
        </Link>
        <SoundToggle />
      </header>
      {children}
    </main>
  );
}

function Reveal({ bouquet }: { bouquet: Bouquet }) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [showNote, setShowNote] = useState(false);
  const [run, setRun] = useState(0);
  const { note, design } = bouquet;
  const stagger = Math.max(45, Math.min(110, 1400 / Math.max(design.items.length, 1)));
  const bloomDelay = 450;
  const bloomDone = bloomDelay + design.items.length * stagger + 700;

  const open = () => {
    if (phase !== "closed") return;
    sound.unlock();
    sound.play("open");
    setPhase("opening");
    setTimeout(() => setPhase("open"), 1250);
  };

  useEffect(() => {
    if (phase !== "open") return;
    const t1 = setTimeout(() => sound.play("sparkle"), bloomDelay + 300);
    const t2 = setTimeout(() => {
      setShowNote(true);
      sound.play("chime");
    }, bloomDone);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, bloomDone, run]);

  const replay = () => {
    setShowNote(false);
    setPhase("closed");
    setRun((r) => r + 1);
  };

  return (
    <Frame>
      <div className="relative z-10 flex flex-1 flex-col items-center px-4 pb-10 pt-6">
        <motion.div layout className="text-center">
          <AnimatePresence mode="wait">
            {!showNote ? (
              <motion.div key="h1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {note.to && <p className="font-hand text-3xl text-rosewood">Dear {note.to},</p>}
                <h1 className="mx-auto mt-1 max-w-lg text-balance font-serif text-[2rem] font-medium leading-tight tracking-tight text-cocoa sm:text-5xl">
                  Someone made something special for you.
                </h1>
              </motion.div>
            ) : (
              <motion.div key="h2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-rosewood">A little bouquet</p>
                <h1 className="mx-auto mt-1 max-w-lg text-balance font-serif text-[2rem] font-medium leading-tight tracking-tight text-cocoa sm:text-5xl">
                  From <span className="font-hand text-[1.25em] text-rosewood">{note.from || "someone who loves you"}</span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="relative mt-6 flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6 lg:flex-row lg:items-center">
          {phase !== "open" && (
            <div className="relative flex flex-col items-center gap-6 py-6">
              <GiftBox open={phase === "opening"} onOpen={open} toName={note.to} />
              {phase === "opening" && <PetalBurst count={34} originY={30} />}
              <AnimatePresence>
                {phase === "closed" && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.4 }}>
                    <Button variant="rose" size="lg" onClick={open} silent>
                      Open your gift
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {phase === "open" && (
            <>
              <motion.div
                key={`b${run}`}
                initial={{ y: 180, scale: 0.7, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 70, damping: 14 }}
                className="w-full max-w-[min(26rem,86vw)] shrink-0"
              >
                <div className="animate-gentle-sway">
                  <BouquetStage design={design} bloom={{ delay: bloomDelay, stagger }} className="rounded-[2rem] shadow-float ring-1 ring-white/60" />
                </div>
              </motion.div>
              <AnimatePresence>
                {showNote && (
                  <motion.div
                    initial={{ opacity: 0, y: 40, rotate: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, rotate: 2, scale: 1 }}
                    transition={{ type: "spring", stiffness: 110, damping: 15 }}
                    className="w-full max-w-[28rem] lg:-ml-8"
                  >
                    <GreetingCard note={note} revealDelay={350} />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        <AnimatePresence>
          {showNote && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + note.message.split(/\s+/).length * 0.06 }}
              className="mt-8 flex flex-col items-center gap-3"
            >
              <ButtonLink href="/" variant="primary" size="lg" onClick={() => sound.play("chime")}>
                <Flower2 size={18} /> Create a bouquet for someone else
              </ButtonLink>
              <Button variant="ghost" size="sm" onClick={replay}>
                <RotateCcw size={14} /> Unwrap it again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Frame>
  );
}
