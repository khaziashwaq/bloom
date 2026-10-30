"use client";

import { motion, useAnimationControls } from "framer-motion";
import { ArrowRight, Gift, Heart, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { BouquetStage } from "@/components/bouquet/BouquetStage";
import { RibbonSwatch } from "@/components/bouquet/Ribbon";
import { WrapSwatch } from "@/components/bouquet/Wrapping";
import { ButtonLink } from "@/components/ui/Button";
import { PetalField } from "@/components/ui/Petals";
import { TopBar } from "@/components/ui/TopBar";
import { LABEL_SUGGESTIONS, LIMITS, RIBBONS, WRAPPINGS } from "@/lib/catalog";
import { useGestureCommit } from "@/lib/hooks";
import { sound } from "@/lib/sound";
import { useBouquet } from "@/lib/store";
import type { Decorations } from "@/lib/types";

function Panel({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.75rem] bg-paper p-4 shadow-soft ring-1 ring-cocoa/6 sm:p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-rosewood">{kicker}</p>
      <h2 className="mb-3 font-serif text-xl font-semibold text-cocoa">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({
  on,
  onToggle,
  icon,
  title,
  body,
  children,
}: {
  on: boolean;
  onToggle: () => void;
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className={`rounded-2xl p-3 transition ${on ? "bg-blush/60 ring-2 ring-rosewood/50" : "bg-cream ring-1 ring-cocoa/8"}`}>
      <button type="button" role="switch" aria-checked={on} onClick={onToggle} className="flex w-full items-center gap-3 text-left">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${on ? "bg-rosewood text-white" : "bg-paper text-cocoa"}`}>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-cocoa">{title}</span>
          <span className="block text-xs text-cocoa-soft">{body}</span>
        </span>
        <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-rosewood" : "bg-cocoa/15"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
        </span>
      </button>
      {on && children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function Customize() {
  const design = useBouquet((s) => s.design);
  const hydrated = useBouquet((s) => s.hydrated);
  const setWrapping = useBouquet((s) => s.setWrapping);
  const setRibbon = useBouquet((s) => s.setRibbon);
  const setDecorations = useBouquet((s) => s.setDecorations);
  const controls = useAnimationControls();
  const first = useRef(true);
  const commitText = useGestureCommit(600);

  // a little rustle of the whole bouquet whenever the paper changes
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    void controls.start({ scale: [1, 0.965, 1.015, 1], rotate: [0, -1.2, 0.6, 0], transition: { duration: 0.55 } });
  }, [design.wrapping, controls]);

  const deco = design.decorations;
  const toggle = (key: keyof Pick<Decorations, "hearts" | "sparkles" | "tag" | "label">) => {
    sound.play(deco[key] ? "unpick" : "sparkle");
    setDecorations({ [key]: !deco[key] });
  };
  const liveText = (patch: Partial<Decorations>) => {
    commitText();
    useBouquet.setState((s) => ({ design: { ...s.design, decorations: { ...s.design.decorations, ...patch } } }));
  };

  return (
    <main className="relative min-h-dvh pb-28 lg:pb-10">
      <PetalField count={8} className="fixed" />
      <TopBar
        step={2}
        backHref="/studio"
        backLabel="Back to the studio"
        right={
          <ButtonLink href="/note" variant="rose" size="sm" onClick={() => sound.play("whoosh")} className="hidden sm:inline-flex">
            Write a note <ArrowRight size={15} />
          </ButtonLink>
        }
      />

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:mt-4 sm:px-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-rosewood">Step 3 · Wrap</p>
        <h1 className="mt-1 font-serif text-4xl font-medium tracking-tight text-cocoa sm:text-5xl">Customise your bouquet</h1>
        <p className="mt-2 max-w-md text-cocoa-soft">Wrap it in pretty paper, tie a ribbon and add a few finishing touches.</p>
      </div>

      <div className="mx-auto mt-4 grid max-w-6xl gap-5 px-4 sm:px-6 lg:mt-6 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-8">
        {/* the preview stays pinned while you pick paper and ribbons */}
        <div className="sticky top-0 z-10 -mx-4 bg-cream/85 px-4 pb-3 pt-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-4 lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <div className="mx-auto w-full" style={{ maxWidth: "min(30rem, calc(40dvh * 0.8333))" }}>
            <motion.div animate={controls} style={{ transformOrigin: "50% 80%" }}>
              {hydrated ? (
                <BouquetStage design={design} className="rounded-[2rem] shadow-float ring-1 ring-cocoa/8" />
              ) : (
                <div className="aspect-[5/6] w-full animate-pulse rounded-[2rem] bg-paper" />
              )}
            </motion.div>
            {hydrated && design.items.length === 0 && (
              <p className="mt-3 text-center text-sm text-cocoa-soft">
                Your bouquet has no flowers yet —{" "}
                <Link href="/studio" className="font-bold text-rosewood underline">
                  add some in the studio
                </Link>
                .
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel kicker="Paper" title="Wrapping paper">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-4">
              {WRAPPINGS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  aria-pressed={design.wrapping === w.id}
                  onClick={() => {
                    sound.play("rustle");
                    setWrapping(w.id);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-1.5 text-[11px] font-bold leading-tight text-cocoa transition ${
                    design.wrapping === w.id ? "bg-blush ring-2 ring-rosewood" : "bg-cream ring-1 ring-cocoa/8 hover:bg-white"
                  }`}
                >
                  <WrapSwatch wrapping={w.id} className="aspect-square w-full" />
                  <span className="line-clamp-2 text-center">{w.name}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel kicker="Ribbon" title="Tie a bow">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
              {RIBBONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={design.ribbon === r.id}
                  onClick={() => {
                    sound.play("ribbon");
                    setRibbon(r.id);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-1.5 text-[11px] font-bold text-cocoa transition ${
                    design.ribbon === r.id ? "bg-blush ring-2 ring-rosewood" : "bg-cream ring-1 ring-cocoa/8 hover:bg-white"
                  }`}
                >
                  <RibbonSwatch ribbon={r.id} className="aspect-[4/3] w-full" />
                  {r.name}
                </button>
              ))}
            </div>
          </Panel>

          <Panel kicker="Finishing touches" title="Decorations">
            <div className="flex flex-col gap-2">
              <Toggle on={deco.hearts} onToggle={() => toggle("hearts")} icon={<Heart size={18} />} title="Tiny hearts" body="Little hearts floating around your bouquet." />
              <Toggle on={deco.sparkles} onToggle={() => toggle("sparkles")} icon={<Sparkles size={18} />} title="Sparkles" body="A soft twinkle of golden stars." />
              <Toggle on={deco.tag} onToggle={() => toggle("tag")} icon={<Gift size={18} />} title="Gift tag" body="A kraft-paper tag hanging from the bow.">
                <input
                  value={deco.tagText}
                  maxLength={LIMITS.tag}
                  onChange={(e) => liveText({ tagText: e.target.value })}
                  aria-label="Gift tag text"
                  placeholder="for you"
                  className="h-11 w-full rounded-xl bg-paper px-3 font-hand text-2xl text-cocoa ring-1 ring-cocoa/12 focus:outline-none focus:ring-2 focus:ring-rosewood"
                />
              </Toggle>
              <Toggle on={deco.label} onToggle={() => toggle("label")} icon={<PenLine size={18} />} title="Handwritten label" body="A small note stuck on with washi tape.">
                <input
                  value={deco.labelText}
                  maxLength={LIMITS.label}
                  onChange={(e) => liveText({ labelText: e.target.value })}
                  aria-label="Label text"
                  placeholder="with love"
                  className="h-11 w-full rounded-xl bg-paper px-3 font-hand text-2xl text-cocoa ring-1 ring-cocoa/12 focus:outline-none focus:ring-2 focus:ring-rosewood"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {LABEL_SUGGESTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        sound.play("tap");
                        setDecorations({ labelText: t });
                      }}
                      className={`rounded-full px-3 py-1 font-hand text-lg transition ${deco.labelText === t ? "bg-cocoa text-cream" : "bg-paper text-cocoa ring-1 ring-cocoa/10 hover:bg-white"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Toggle>
            </div>
          </Panel>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
        <ButtonLink href="/note" variant="rose" size="lg" className="w-full" onClick={() => sound.play("whoosh")}>
          Next: write a note <ArrowRight size={18} />
        </ButtonLink>
      </div>
      <div className="mx-auto mt-6 hidden max-w-6xl justify-end px-6 sm:flex">
        <ButtonLink href="/note" variant="rose" size="lg" onClick={() => sound.play("whoosh")}>
          Next: write a note <ArrowRight size={18} />
        </ButtonLink>
      </div>
    </main>
  );
}
