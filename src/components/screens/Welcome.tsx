"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { useState } from "react";
import { ItemArt } from "@/components/art/ItemArt";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PetalField } from "@/components/ui/Petals";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { BloomMark } from "@/components/ui/TopBar";
import { sound } from "@/lib/sound";
import { useBouquet } from "@/lib/store";
import type { ItemKind } from "@/lib/types";
import { ShopScene } from "./ShopScene";

const HOW: { title: string; body: string; art: [ItemKind, string][] }[] = [
  {
    title: "Pick your blooms",
    body: "Wander the collection and choose stems in the colours that remind you of them.",
    art: [
      ["rose", "pink"],
      ["tulip", "yellow"],
      ["daisy", "white"],
    ],
  },
  {
    title: "Arrange them",
    body: "Drag, turn, resize and layer each flower on the studio canvas — or let us arrange them for you.",
    art: [
      ["peony", "blush"],
      ["lavender", "classic"],
      ["eucalyptus", "silver"],
    ],
  },
  {
    title: "Wrap & tie",
    body: "Choose wrapping paper, a satin ribbon and a few little decorations.",
    art: [
      ["hydrangea", "lavender"],
      ["babysbreath", "white"],
      ["carnation", "pink"],
    ],
  },
  {
    title: "Write a note & send",
    body: "Add a handwritten note, then share a link. They'll unwrap it like a real gift.",
    art: [
      ["sunflower", "golden"],
      ["lily", "stargazer"],
      ["rose", "red"],
    ],
  },
];

export function Welcome() {
  const [howOpen, setHowOpen] = useState(false);
  const hydrated = useBouquet((s) => s.hydrated);
  const hasDraft = useBouquet((s) => s.design.items.length > 0 || s.basket.length > 0);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <ShopScene className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-cream/10 via-cream/25 to-cream/55" />
      <PetalField count={22} />

      <header className="relative z-10 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <div className="flex items-center gap-2 rounded-full bg-paper/80 py-1.5 pl-2 pr-4 font-serif text-lg font-semibold italic text-cocoa ring-1 ring-cocoa/10 backdrop-blur">
          <BloomMark className="h-6 w-6" />
          Bloom
        </div>
        <SoundToggle />
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <motion.section
          initial={{ opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-xl rounded-[2.25rem] bg-paper/88 px-6 py-9 text-center shadow-float ring-1 ring-white/70 backdrop-blur-md sm:px-12 sm:py-12"
        >
          <div className="pointer-events-none absolute -left-7 -top-9 w-24 rotate-[-18deg] sm:-left-10 sm:w-28">
            <ItemArt kind="peony" variant="blush" className="h-auto w-full drop-shadow-md" />
          </div>
          <div className="pointer-events-none absolute -right-5 -top-6 w-16 rotate-[16deg] sm:-right-7 sm:w-20">
            <ItemArt kind="rose" variant="peach" className="h-auto w-full drop-shadow-md" />
          </div>
          <div className="pointer-events-none absolute -bottom-8 -right-4 w-14 rotate-[24deg] sm:w-16">
            <ItemArt kind="lavender" variant="classic" className="h-auto w-full" />
          </div>

          <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.28em] text-rosewood">A tiny digital florist</p>
          <h1 className="text-balance font-serif text-[2.4rem] font-medium leading-[1.02] tracking-tight text-cocoa sm:text-6xl" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
            Welcome to your <em className="font-semibold text-rosewood">little</em> flower shop.
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-cocoa-soft sm:text-lg">
            A little place to make something beautiful for someone you love.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/shop" size="lg" variant="primary" onClick={() => sound.play("chime")}>
              Start arranging <ArrowRight size={18} />
            </ButtonLink>
            <Button size="lg" variant="secondary" onClick={() => setHowOpen(true)}>
              See how it works
            </Button>
          </div>

          {hydrated && hasDraft && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
              <ButtonLink href="/studio" variant="ghost" size="sm" className="text-rosewood underline decoration-rosewood/40 underline-offset-4">
                Continue the bouquet you started
              </ButtonLink>
            </motion.div>
          )}

          <p className="mt-7 flex items-center justify-center gap-1.5 text-xs font-semibold text-cocoa-soft/80">
            Free · no sign-up · made with <Heart size={12} className="fill-rosewood text-rosewood" />
          </p>
        </motion.section>
      </div>

      <Modal open={howOpen} onClose={() => setHowOpen(false)} label="How Bloom works" wide>
        <h2 className="pr-10 font-serif text-3xl font-medium text-cocoa">How it works</h2>
        <p className="mt-1 text-cocoa-soft">Four cosy little steps. Nothing is bought or shipped — it&apos;s all made of pixels and love.</p>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {HOW.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              className="relative flex gap-3 rounded-3xl bg-paper p-4 ring-1 ring-cocoa/8"
            >
              <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-blush/60">
                {s.art.map(([k, v], j) => (
                  <ItemArt
                    key={j}
                    kind={k}
                    variant={v}
                    className="absolute h-10 w-10"
                    style={{ left: [2, 22, 12][j], top: [4, 2, 20][j], transform: `rotate(${[-14, 12, 0][j]}deg)` }}
                  />
                ))}
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-rosewood">Step {i + 1}</p>
                <h3 className="font-serif text-lg font-semibold text-cocoa">{s.title}</h3>
                <p className="text-sm leading-snug text-cocoa-soft">{s.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
        <div className="mt-6 flex justify-end">
          <ButtonLink href="/shop" onClick={() => setHowOpen(false)}>
            Let&apos;s begin <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </Modal>
    </main>
  );
}
