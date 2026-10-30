"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { GreetingCard } from "@/components/card/GreetingCard";
import { BouquetStage } from "@/components/bouquet/BouquetStage";
import { ButtonLink } from "@/components/ui/Button";
import { PetalField } from "@/components/ui/Petals";
import { TopBar } from "@/components/ui/TopBar";
import { CARD_COLORS, SUGGESTED_MESSAGES } from "@/lib/catalog";
import { sound } from "@/lib/sound";
import { useBouquet } from "@/lib/store";

export function NoteScreen() {
  const design = useBouquet((s) => s.design);
  const note = useBouquet((s) => s.note);
  const hydrated = useBouquet((s) => s.hydrated);
  const setNote = useBouquet((s) => s.setNote);
  const ready = note.to.trim() && note.from.trim() && note.message.trim();
  const missing = [!note.to.trim() && "their name", !note.message.trim() && "a message", !note.from.trim() && "your name"].filter(Boolean);

  return (
    <main className="relative min-h-dvh pb-32 sm:pb-12">
      <PetalField count={8} className="fixed" />
      <TopBar step={3} backHref="/wrap" backLabel="Back to wrapping" />

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:mt-4 sm:px-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-rosewood">Step 4 · Note</p>
        <h1 className="mt-1 max-w-xl font-serif text-4xl font-medium tracking-tight text-cocoa sm:text-5xl">A little note for someone special.</h1>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
          <motion.div
            initial={{ opacity: 0, x: -20, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: -2.5 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="mx-auto hidden w-full max-w-[24rem] lg:block"
          >
            {hydrated && <BouquetStage design={design} className="animate-gentle-sway rounded-[2rem] shadow-float ring-1 ring-cocoa/8" />}
          </motion.div>

          <div>
            {hydrated ? (
              <motion.div initial={{ opacity: 0, y: 18, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0.6 }} transition={{ type: "spring", stiffness: 140, damping: 18 }}>
                <GreetingCard note={note} editable onChange={setNote} />
              </motion.div>
            ) : (
              <div className="h-[420px] animate-pulse rounded-[1.6rem] bg-paper" />
            )}

            <div className="mt-5 flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-cocoa-soft">Card</span>
              {CARD_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`${c.name} card`}
                  aria-pressed={note.card === c.id}
                  onClick={() => {
                    sound.play("tap");
                    setNote({ card: c.id });
                  }}
                  className={`h-8 w-8 rounded-full transition ${note.card === c.id ? "ring-2 ring-cocoa ring-offset-2 ring-offset-cream" : "ring-1 ring-cocoa/15 hover:scale-110"}`}
                  style={{ background: c.paper, boxShadow: `inset 0 0 0 4px ${c.line}` }}
                />
              ))}
            </div>

            <div className="mt-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-cocoa-soft">
                <Sparkles size={13} className="text-rosewood" /> Need a little inspiration?
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_MESSAGES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      sound.play("pick");
                      setNote({ message: m });
                    }}
                    className={`rounded-full px-4 py-2 text-left font-hand text-xl leading-tight transition active:scale-95 ${
                      note.message === m ? "bg-cocoa text-cream" : "bg-paper text-cocoa ring-1 ring-cocoa/10 hover:bg-white hover:ring-rosewood/40"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mt-8 sm:flex sm:items-center sm:justify-end sm:gap-4 sm:px-0">
              {!ready && hydrated && (
                <p className="mb-2 text-center text-xs font-semibold text-cocoa-soft sm:mb-0 sm:text-right">Add {missing.join(", ")} to continue.</p>
              )}
              <ButtonLink
                href="/send"
                variant="rose"
                size="lg"
                aria-disabled={!ready}
                className={`w-full sm:w-auto ${ready ? "" : "pointer-events-none opacity-45"}`}
                onClick={() => sound.play("whoosh")}
              >
                Preview & send <ArrowRight size={18} />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
