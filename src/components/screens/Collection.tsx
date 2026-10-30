"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBasket, Trash2, Wand2 } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { ItemArt } from "@/components/art/ItemArt";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PetalField } from "@/components/ui/Petals";
import { TopBar } from "@/components/ui/TopBar";
import { ALL_ITEMS, getDef, getVariant, type ItemDef } from "@/lib/catalog";
import { PRESETS, presetBasket } from "@/lib/presets";
import { sound } from "@/lib/sound";
import { toast, useBouquet, type BasketEntry } from "@/lib/store";
import type { ItemKind } from "@/lib/types";

const TINT: Record<ItemKind, string> = {
  rose: "#f9e3ea",
  tulip: "#fbf1cf",
  sunflower: "#fbf1cf",
  daisy: "#e5ecdf",
  peony: "#f9e3ea",
  lily: "#ede6f7",
  carnation: "#f9e3ea",
  hydrangea: "#ede6f7",
  babysbreath: "#f6ede2",
  lavender: "#ede6f7",
  eucalyptus: "#e5ecdf",
  fern: "#e5ecdf",
  olive: "#e5ecdf",
  ruscus: "#e5ecdf",
  pampas: "#f6ede2",
};

const MAX_BASKET = 40;

interface Flyer {
  id: number;
  kind: ItemKind;
  variant: string;
  from: { x: number; y: number; size: number };
  to: { x: number; y: number };
}

export function Collection() {
  const basket = useBouquet((s) => s.basket);
  const hydrated = useBouquet((s) => s.hydrated);
  const addToBasket = useBouquet((s) => s.addToBasket);
  const [filter, setFilter] = useState<ItemKind | "all" | "greenery">("all");
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [drawer, setDrawer] = useState(false);
  const basketRef = useRef<HTMLButtonElement>(null);
  const basketControls = useAnimationControls();
  const flyerId = useRef(0);

  const total = basket.reduce((n, b) => n + b.count, 0);

  const shown = useMemo(() => {
    if (filter === "all") return ALL_ITEMS;
    if (filter === "greenery") return ALL_ITEMS.filter((d) => d.category === "greenery");
    return ALL_ITEMS.filter((d) => d.kind === filter);
  }, [filter]);

  const onAdd = useCallback(
    (kind: ItemKind, variant: string, fromEl: HTMLElement | null) => {
      if (total >= MAX_BASKET) {
        toast("Your arms are full — that's plenty for one bouquet!");
        return;
      }
      sound.play("pick");
      addToBasket(kind, variant);
      const target = basketRef.current?.getBoundingClientRect();
      const src = fromEl?.getBoundingClientRect();
      if (target && src) {
        const id = ++flyerId.current;
        setFlyers((f) => [
          ...f,
          {
            id,
            kind,
            variant,
            from: { x: src.left + src.width / 2, y: src.top + src.height / 2, size: Math.min(src.width, 120) },
            to: { x: target.left + target.width / 2, y: target.top + target.height / 2 },
          },
        ]);
      }
    },
    [addToBasket, total],
  );

  const surprise = () => {
    const prev = useBouquet.getState().basket;
    const p = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    useBouquet.getState().setBasket(presetBasket(p));
    useBouquet.getState().setWrapping(p.wrapping);
    useBouquet.getState().setRibbon(p.ribbon);
    sound.play("sparkle");
    void basketControls.start({ scale: [1, 1.18, 1], rotate: [0, -8, 6, 0], transition: { duration: 0.5 } });
    toast(`We picked the “${p.name}” mix for you`, { label: "Undo", run: () => useBouquet.getState().setBasket(prev) });
  };

  const chips: { id: ItemKind | "all" | "greenery"; label: string }[] = [
    { id: "all", label: "All flowers" },
    ...ALL_ITEMS.filter((d) => d.category === "flower").map((d) => ({ id: d.kind, label: d.name })),
    { id: "greenery", label: "Greenery" },
  ];

  return (
    <main className="relative min-h-dvh pb-32">
      <PetalField count={8} className="fixed" />
      <TopBar step={0} backHref="/" backLabel="Back to the shop front" />

      <section className="relative mx-auto mt-8 max-w-6xl px-4 sm:mt-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-rosewood">Step 1 · Pick</p>
            <h1 className="mt-1 font-serif text-4xl font-medium tracking-tight text-cocoa sm:text-5xl">The flower collection</h1>
            <p className="mt-2 max-w-md text-cocoa-soft">Pick the blooms that remind you of them. Tap a colour, then add as many stems as you like.</p>
          </div>
          <Button variant="soft" onClick={surprise} silent>
            <Wand2 size={16} /> Surprise me
          </Button>
        </div>

        <div className="sticky top-0 z-20 -mx-4 mt-5 bg-gradient-to-b from-cream via-cream/95 to-cream/0 px-4 pb-4 pt-3 sm:-mx-6 sm:px-6">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  sound.play("tap");
                  setFilter(c.id);
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                  filter === c.id ? "bg-cocoa text-cream shadow-[0_2px_0_0_#3c2d29]" : "bg-paper text-cocoa ring-1 ring-cocoa/10 hover:bg-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {shown.map((def, i) => (
              <motion.div
                key={def.kind}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(i * 0.03, 0.3), type: "spring", stiffness: 300, damping: 28 }}
              >
                <FlowerCard def={def} basket={basket} onAdd={onAdd} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* flying stems */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <AnimatePresence>
          {flyers.map((f) => (
            <motion.div
              key={f.id}
              className="absolute left-0 top-0"
              initial={{ x: f.from.x - f.from.size / 2, y: f.from.y - f.from.size / 2, scale: 1, opacity: 1, rotate: 0 }}
              animate={{
                x: [f.from.x - f.from.size / 2, (f.from.x + f.to.x) / 2 - f.from.size / 2, f.to.x - f.from.size / 2],
                y: [f.from.y - f.from.size / 2, Math.min(f.from.y, f.to.y) - 160, f.to.y - f.from.size / 2],
                scale: [1, 0.8, 0.25],
                rotate: [0, -20, 20],
                opacity: [1, 1, 0.6],
              }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              onAnimationComplete={() => {
                setFlyers((all) => all.filter((x) => x.id !== f.id));
                void basketControls.start({ scale: [1, 1.15, 1], transition: { duration: 0.3 } });
              }}
              style={{ width: f.from.size, height: f.from.size }}
            >
              <ItemArt kind={f.kind} variant={f.variant} className="h-full w-full" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* basket bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-[1.75rem] bg-paper/95 p-2 pl-2 shadow-float ring-1 ring-cocoa/10 backdrop-blur">
          <motion.button
            ref={basketRef}
            animate={basketControls}
            type="button"
            onClick={() => {
              sound.play("tap");
              setDrawer(true);
            }}
            className="relative flex h-14 min-w-14 shrink-0 items-center justify-center rounded-2xl bg-blush px-3 text-cocoa transition hover:bg-[#f2cfda]"
            aria-label={`Open your basket, ${total} stems`}
          >
            <ShoppingBasket size={24} />
            <AnimatePresence>
              {total > 0 && (
                <motion.span
                  key={total}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-rosewood px-1.5 text-xs font-extrabold text-white ring-2 ring-paper"
                >
                  {total}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <div className="min-w-0 flex-1">
            {hydrated && total > 0 ? (
              <>
                <p className="text-sm font-extrabold text-cocoa">
                  {total} {total === 1 ? "stem" : "stems"} picked
                </p>
                <div className="no-scrollbar mt-0.5 flex -space-x-2 overflow-hidden">
                  {basket.slice(-9).map((b) => (
                    <div key={`${b.kind}-${b.variant}`} className="h-7 w-7 shrink-0 rounded-full bg-cream p-0.5 ring-2 ring-paper">
                      <ItemArt kind={b.kind} variant={b.variant} className="h-full w-full" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm font-semibold leading-tight text-cocoa-soft">Your basket is empty — tap a flower to add a stem.</p>
            )}
          </div>
          <ButtonLink
            href="/studio"
            variant="rose"
            size="md"
            aria-disabled={total === 0}
            className={total === 0 ? "pointer-events-none opacity-45" : ""}
            onClick={() => sound.play("whoosh")}
          >
            <span className="hidden sm:inline">Arrange them</span>
            <span className="sm:hidden">Arrange</span>
            <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </div>

      <Modal open={drawer} onClose={() => setDrawer(false)} label="Your basket">
        <BasketList onDone={() => setDrawer(false)} />
      </Modal>
    </main>
  );
}

function FlowerCard({
  def,
  basket,
  onAdd,
}: {
  def: ItemDef;
  basket: BasketEntry[];
  onAdd: (kind: ItemKind, variant: string, from: HTMLElement | null) => void;
}) {
  const [variant, setVariant] = useState(def.variants[0].id);
  const [bounce, setBounce] = useState(0);
  const artRef = useRef<HTMLDivElement>(null);
  const removeFromBasket = useBouquet((s) => s.removeFromBasket);
  const v = getVariant(def.kind, variant);
  const countFor = (vid: string) => basket.find((b) => b.kind === def.kind && b.variant === vid)?.count ?? 0;
  const typeTotal = basket.filter((b) => b.kind === def.kind).reduce((n, b) => n + b.count, 0);
  const current = countFor(variant);
  const add = () => {
    setBounce((b) => b + 1);
    onAdd(def.kind, variant, artRef.current);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-paper p-3 shadow-soft ring-1 ring-cocoa/6 transition hover:-translate-y-0.5 hover:shadow-float">
      <button
        type="button"
        onClick={add}
        aria-label={`Add a ${v.name.toLowerCase()} ${def.single.toLowerCase()}`}
        className="relative flex aspect-square items-center justify-center rounded-[1.35rem]"
        style={{ background: `radial-gradient(circle at 50% 45%, #fffdf9 0%, ${TINT[def.kind]} 70%)` }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-60" aria-hidden>
          <path d="M14,72 C24,92 70,96 86,74" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <motion.div
          ref={artRef}
          key={bounce}
          initial={bounce ? { scale: 0.86, rotate: -6 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 12 }}
          className={`relative ${def.category === "greenery" || def.kind === "lavender" ? "h-[82%] w-[62%]" : "h-[78%] w-[78%]"} transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105`}
        >
          <ItemArt kind={def.kind} variant={variant} className="h-full w-full" title={`${v.name} ${def.single}`} />
        </motion.div>
        {typeTotal > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-cocoa px-2 py-0.5 text-[11px] font-extrabold text-cream">×{typeTotal}</span>
        )}
      </button>

      <div className="mt-3 flex flex-1 flex-col px-1">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold leading-tight text-cocoa">{def.name}</h2>
        </div>
        <p className="text-xs italic leading-snug text-cocoa-soft">{def.meaning}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1 sm:gap-1.5" role="radiogroup" aria-label={`${def.name} colours`}>
          {def.variants.map((vv) => {
            const n = countFor(vv.id);
            return (
              <button
                key={vv.id}
                type="button"
                role="radio"
                aria-checked={variant === vv.id}
                aria-label={vv.name}
                title={vv.name}
                onClick={() => {
                  sound.play("tap");
                  setVariant(vv.id);
                }}
                className={`relative h-[22px] w-[22px] rounded-full transition sm:h-7 sm:w-7 ${variant === vv.id ? "ring-2 ring-cocoa ring-offset-2 ring-offset-paper" : "ring-1 ring-cocoa/15 hover:scale-110"}`}
                style={{ background: `radial-gradient(circle at 35% 30%, ${vv.palette.light}, ${vv.palette.base} 55%, ${vv.palette.dark})` }}
              >
                {n > 0 && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-rosewood ring-2 ring-paper" />}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs font-bold text-cocoa-soft">{v.name}</p>

        <div className="mt-auto pt-3">
          {current > 0 ? (
            <div className="flex items-center justify-between rounded-full bg-blush/70 p-1">
              <button
                type="button"
                aria-label={`Remove one ${v.name} ${def.single}`}
                onClick={() => {
                  sound.play("unpick");
                  removeFromBasket(def.kind, variant);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-cocoa transition active:scale-90"
              >
                <Minus size={16} />
              </button>
              <span className="text-sm font-extrabold text-cocoa" aria-live="polite">
                {current}
                <span className="hidden font-bold sm:inline"> in basket</span>
              </span>
              <button
                type="button"
                aria-label={`Add another ${v.name} ${def.single}`}
                onClick={add}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cocoa text-cream transition active:scale-90"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={add}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-cream text-sm font-extrabold text-cocoa ring-1 ring-cocoa/12 transition hover:bg-blush/60 active:scale-[0.98]"
            >
              <Plus size={16} /> Add a stem
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function BasketList({ onDone }: { onDone: () => void }) {
  const basket = useBouquet((s) => s.basket);
  const add = useBouquet((s) => s.addToBasket);
  const remove = useBouquet((s) => s.removeFromBasket);
  const clear = useBouquet((s) => s.clearBasket);
  const total = basket.reduce((n, b) => n + b.count, 0);
  return (
    <div>
      <h2 className="pr-10 font-serif text-3xl font-medium text-cocoa">Your basket</h2>
      <p className="text-cocoa-soft">
        {total} {total === 1 ? "stem" : "stems"} ready for arranging.
      </p>
      {basket.length === 0 ? (
        <p className="mt-6 rounded-3xl bg-paper p-6 text-center text-cocoa-soft">Nothing here yet. Tap any flower to add it.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {basket.map((b) => {
            const def = getDef(b.kind);
            const v = getVariant(b.kind, b.variant);
            return (
              <li key={`${b.kind}-${b.variant}`} className="flex items-center gap-3 rounded-2xl bg-paper p-2 pr-3 ring-1 ring-cocoa/6">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-cream p-1">
                  <ItemArt kind={b.kind} variant={b.variant} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-cocoa">{def.single}</p>
                  <p className="text-xs text-cocoa-soft">{v.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label="Remove one" onClick={() => remove(b.kind, b.variant)} className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-cocoa ring-1 ring-cocoa/10">
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-extrabold">{b.count}</span>
                  <button type="button" aria-label="Add one" onClick={() => add(b.kind, b.variant)} className="flex h-8 w-8 items-center justify-center rounded-full bg-cocoa text-cream">
                    <Plus size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={clear} disabled={basket.length === 0}>
          <Trash2 size={14} /> Empty basket
        </Button>
        <ButtonLink href="/studio" variant="rose" onClick={onDone} className={total === 0 ? "pointer-events-none opacity-45" : ""}>
          Arrange them <ArrowRight size={16} />
        </ButtonLink>
      </div>
    </div>
  );
}
