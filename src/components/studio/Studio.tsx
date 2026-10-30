"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, Redo2, RotateCcw, Undo2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ItemArt } from "@/components/art/ItemArt";
import { BouquetStage, markFresh } from "@/components/bouquet/BouquetStage";
import { Button, ButtonLink, IconButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TopBar } from "@/components/ui/TopBar";
import { arrange, findSpot, naturalRotation, tweenItems } from "@/lib/arrange";
import { CANVAS_H, CANVAS_W, MAX_ITEMS } from "@/lib/catalog";
import { useMediaQuery } from "@/lib/hooks";
import { newId } from "@/lib/ids";
import { sound } from "@/lib/sound";
import { countPlaced, selectComposition, toast, useBouquet } from "@/lib/store";
import type { CanvasItem, ItemKind } from "@/lib/types";
import { BouquetEditor } from "./BouquetEditor";
import { ItemControls } from "./ItemControls";
import { StudioTray, TABS, TabBar, type DragApi, type TrayTab } from "./StudioTray";

function isTyping(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && (el as HTMLInputElement).type !== "range") || el.tagName === "SELECT";
}

export function Studio() {
  const hydrated = useBouquet((s) => s.hydrated);
  const composition = useBouquet(selectComposition);
  const itemCount = composition ? composition.split(",").length : 0;
  const basket = useBouquet((s) => s.basket);
  const canUndo = useBouquet((s) => s.past.length > 0);
  const canRedo = useBouquet((s) => s.future.length > 0);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const stageRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<TrayTab>("flowers");
  const [preview, setPreview] = useState(false);
  const [arranging, setArranging] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [ghost, setGhost] = useState<{ kind: ItemKind; variant: string } | null>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  const remaining = useMemo(() => {
    const out: { kind: ItemKind; variant: string }[] = [];
    for (const b of basket) {
      const used = countPlaced(composition, b.kind, b.variant);
      for (let i = used; i < b.count; i++) out.push({ kind: b.kind, variant: b.variant });
    }
    return out;
  }, [basket, composition]);

  /* ---------- adding flowers ---------- */

  const insideStage = (x: number, y: number) => {
    const r = stageRef.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  const addAt = useCallback((kind: ItemKind, variant: string, pos: Omit<CanvasItem, "id" | "kind" | "variant">) => {
    const ids = useBouquet.getState().addItems([{ kind, variant, ...pos }]);
    if (!ids.length) {
      toast(`A bouquet can hold up to ${MAX_ITEMS} stems — try removing a few.`);
      return;
    }
    markFresh(ids);
  }, []);

  const onTapAdd = useCallback(
    (kind: ItemKind, variant: string) => {
      sound.play("pop");
      addAt(kind, variant, findSpot(useBouquet.getState().design.items, kind));
    },
    [addAt],
  );

  const placeGhost = (x: number, y: number) => {
    if (ghostRef.current) ghostRef.current.style.transform = `translate(${x - 48}px, ${y - 64}px) rotate(-8deg)`;
  };

  const drag: DragApi = {
    start: (kind, variant, x, y) => {
      sound.play("pick");
      useBouquet.getState().select(null);
      setGhost({ kind, variant });
      placeGhost(x, y);
    },
    move: (x, y) => {
      placeGhost(x, y);
      setDropActive(insideStage(x, y));
    },
    end: (kind, variant, x, y, cancelled) => {
      setGhost(null);
      setDropActive(false);
      if (cancelled || !insideStage(x, y)) return;
      const r = stageRef.current!.getBoundingClientRect();
      const cx = Math.round(((x - r.left) / r.width) * CANVAS_W);
      const cy = Math.round(((y - r.top) / r.height) * CANVAS_H);
      sound.play("place");
      addAt(kind, variant, { x: cx, y: cy, rotation: Math.round(naturalRotation(kind, cx, cy)), scale: 1, flip: Math.random() < 0.3 });
    },
  };

  /* ---------- auto arrange ---------- */

  const arrangeAll = useCallback(() => {
    if (arranging) return;
    const s = useBouquet.getState();
    const room = MAX_ITEMS - s.design.items.length;
    const fresh: CanvasItem[] = remaining.slice(0, Math.max(0, room)).map((r) => ({
      id: newId(8),
      kind: r.kind,
      variant: r.variant,
      x: 500,
      y: 460,
      rotation: 0,
      scale: 1,
      flip: Math.random() < 0.3,
    }));
    const current = [...s.design.items, ...fresh];
    if (!current.length) {
      toast("Add a few flowers first, then I'll arrange them for you.");
      return;
    }
    const target = arrange(current);
    setArranging(true);
    sound.play("sparkle");
    s.select(null);
    s.beginGesture();
    const freshIds = new Set(fresh.map((f) => f.id));
    markFresh(
      target.filter((t) => freshIds.has(t.id)).map((t) => t.id),
      70,
    );
    // fresh flowers bloom straight into place, existing ones glide there
    const start = target.map((t) => (freshIds.has(t.id) ? t : current.find((c) => c.id === t.id)!));
    s.liveSetItems(start);
    tweenItems(start, target, 750, (frame) => useBouquet.getState().liveSetItems(frame), () => {
      useBouquet.getState().liveSetItems(target);
      useBouquet.getState().endGesture();
      setArranging(false);
    });
  }, [arranging, remaining]);

  const reset = () => {
    if (!itemCount) return;
    sound.play("whoosh");
    useBouquet.getState().resetCanvas();
    toast("Canvas cleared", { label: "Undo", run: () => useBouquet.getState().undo() });
  };

  const undo = () => {
    if (!useBouquet.getState().past.length) return;
    sound.play("undo");
    useBouquet.getState().undo();
  };
  const redo = () => {
    if (!useBouquet.getState().future.length) return;
    sound.play("undo");
    useBouquet.getState().redo();
  };

  /* ---------- keyboard ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const s = useBouquet.getState();
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (mod && key === "z") {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }
      if (mod && key === "y") {
        e.preventDefault();
        s.redo();
        return;
      }
      const sel = s.selectedId ? s.design.items.find((it) => it.id === s.selectedId) : undefined;
      if (!sel) return;
      if (e.target instanceof HTMLInputElement && e.target.type === "range") return;
      if (key === "delete" || key === "backspace") {
        e.preventDefault();
        sound.play("unpick");
        s.removeItem(sel.id);
      } else if (mod && key === "d") {
        e.preventDefault();
        s.duplicateItem(sel.id);
      } else if (key === "escape") {
        s.select(null);
      } else if (key === "]") {
        s.moveLayer(sel.id, "up");
      } else if (key === "[") {
        s.moveLayer(sel.id, "down");
      } else if (key.startsWith("arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 20 : 4;
        const dx = key === "arrowleft" ? -step : key === "arrowright" ? step : 0;
        const dy = key === "arrowup" ? -step : key === "arrowdown" ? step : 0;
        s.updateItem(sel.id, { x: sel.x + dx, y: sel.y + dy });
      } else if (key === "r") {
        s.updateItem(sel.id, { rotation: sel.rotation + (e.shiftKey ? -15 : 15) });
      } else if (key === "f") {
        s.updateItem(sel.id, { flip: !sel.flip });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Don't keep a stale selection when the studio is hidden and shown again.
  useEffect(() => () => useBouquet.getState().select(null), []);

  const hasSelection = useBouquet((s) => !!s.selectedId && s.design.items.some((it) => it.id === s.selectedId));
  const tabInfo = TABS.find((t) => t.id === tab)!;

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-cream">
      <TopBar
        step={1}
        backHref="/shop"
        backLabel="Back to the collection"
        right={
          <>
            <IconButton label="Preview bouquet" size="sm" onClick={() => setPreview(true)} disabled={!itemCount}>
              <Eye size={17} />
            </IconButton>
            <ButtonLink
              href="/wrap"
              variant="rose"
              size="sm"
              aria-disabled={!itemCount}
              className={!itemCount ? "pointer-events-none opacity-45" : ""}
              onClick={() => sound.play("whoosh")}
            >
              Wrap it <ArrowRight size={15} />
            </ButtonLink>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col pt-6 sm:pt-0 lg:flex-row">
        {/* desktop side panel */}
        {isDesktop && (
          <aside className="flex w-[360px] shrink-0 flex-col gap-3 py-2 pl-5">
            <AnimatePresence initial={false}>
              {hasSelection && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-3xl bg-paper p-4 shadow-soft ring-1 ring-cocoa/8">
                    <ItemControls />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-paper shadow-soft ring-1 ring-cocoa/8">
              <div className="p-2">
                <TabBar tab={tab} onTab={setTab} />
              </div>
              <p className="px-5 pb-2 text-xs text-cocoa-soft">{tabInfo.hint}</p>
              <div className="min-h-0 flex-1">
                <StudioTray tab={tab} axis="y" drag={drag} onAdd={onTapAdd} />
              </div>
            </div>
          </aside>
        )}

        {/* canvas */}
        <section className="relative flex min-h-0 flex-1 items-center justify-center p-3 sm:p-4 lg:p-5" style={{ containerType: "size" }}>
          <div className="relative" style={{ width: "min(100cqw, calc(100cqh * 0.8333))" }}>
            {hydrated ? (
              <BouquetEditor stageRef={stageRef} dropActive={dropActive} />
            ) : (
              <div className="aspect-[5/6] w-full animate-pulse rounded-[1.75rem] bg-paper" />
            )}

            {/* corner tools */}
            <div className="absolute left-2.5 top-2.5 z-[1100] flex gap-1.5">
              <IconButton label="Undo" size="sm" onClick={undo} disabled={!canUndo}>
                <Undo2 size={16} />
              </IconButton>
              <IconButton label="Redo" size="sm" onClick={redo} disabled={!canRedo}>
                <Redo2 size={16} />
              </IconButton>
            </div>
            <div className="absolute right-2.5 top-2.5 z-[1100]">
              <IconButton label="Reset canvas" size="sm" onClick={reset} disabled={!itemCount}>
                <RotateCcw size={16} />
              </IconButton>
            </div>
            <div className="absolute bottom-2.5 left-2.5 z-[1100] rounded-full bg-paper/90 px-3 py-1.5 text-xs font-bold text-cocoa ring-1 ring-cocoa/10 backdrop-blur">
              {itemCount} {itemCount === 1 ? "stem" : "stems"}
            </div>
            {(itemCount > 1 || remaining.length > 0) && (
              <div className="absolute bottom-2.5 right-2.5 z-[1100]">
                <Button variant="secondary" size="sm" onClick={arrangeAll} disabled={arranging} silent>
                  <Wand2 size={15} className="text-rosewood" />
                  {remaining.length > 0 ? `Arrange ${remaining.length} for me` : "Arrange for me"}
                </Button>
              </div>
            )}

            {/* empty state */}
            {hydrated && itemCount === 0 && (
              <div className="pointer-events-none absolute inset-0 z-[1050] flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pointer-events-auto max-w-[19rem] rounded-3xl bg-paper/92 p-5 text-center shadow-float ring-1 ring-cocoa/8 backdrop-blur"
                >
                  {remaining.length > 0 ? (
                    <>
                      <div className="mx-auto mb-2 flex justify-center -space-x-3">
                        {basket.slice(0, 5).map((b) => (
                          <ItemArt key={`${b.kind}-${b.variant}`} kind={b.kind} variant={b.variant} className="h-11 w-11" />
                        ))}
                      </div>
                      <p className="font-serif text-xl font-semibold text-cocoa">Your {remaining.length} stems are ready</p>
                      <p className="mt-1 text-sm text-cocoa-soft">
                        Drag them in one by one from the {isDesktop ? "panel" : "tray below"}, or let us arrange them for you.
                      </p>
                      <Button variant="rose" size="md" className="mt-4" onClick={arrangeAll} silent>
                        <Wand2 size={16} /> Arrange for me
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="font-serif text-xl font-semibold text-cocoa">Your canvas is waiting</p>
                      <p className="mt-1 text-sm text-cocoa-soft">
                        Drag a flower from the {isDesktop ? "panel" : "tray below"} onto the canvas, or tap one to tuck it in.
                      </p>
                      <Link href="/shop" className="mt-3 inline-block text-sm font-bold text-rosewood underline underline-offset-4">
                        Visit the collection
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </section>

        {/* mobile tray / item controls */}
        {!isDesktop && (
          <div className="relative z-20 shrink-0 rounded-t-[1.75rem] bg-paper shadow-[0_-10px_30px_-18px_rgb(89_69_63/0.35)] ring-1 ring-cocoa/8">
            <AnimatePresence mode="wait" initial={false}>
              {hasSelection ? (
                <motion.div
                  key="controls"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.16 }}
                  className="px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
                >
                  <ItemControls compact />
                </motion.div>
              ) : (
                <motion.div
                  key="tray"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.16 }}
                  className="pb-[max(0.5rem,env(safe-area-inset-bottom))]"
                >
                  <div className="h-[148px]">
                    <StudioTray tab={tab} axis="x" drag={drag} onAdd={onTapAdd} />
                  </div>
                  <div className="px-2">
                    <TabBar tab={tab} onTab={setTab} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* drag ghost */}
      <div ref={ghostRef} className="pointer-events-none fixed left-0 top-0 z-[90] h-24 w-24" style={{ display: ghost ? "block" : "none" }} aria-hidden>
        {ghost && (
          <div className="h-full w-full animate-[pop-in_0.2s_ease-out] drop-shadow-[0_12px_14px_rgb(89_69_63/0.35)]">
            <ItemArt kind={ghost.kind} variant={ghost.variant} className="h-full w-full" />
          </div>
        )}
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} label="Bouquet preview">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-rosewood">Preview</p>
        <h2 className="font-serif text-3xl font-medium text-cocoa">Looking lovely</h2>
        <div className="mx-auto mt-4 w-full max-w-[22rem] animate-gentle-sway">
          <PreviewStage />
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="secondary" onClick={() => setPreview(false)}>
            Keep arranging
          </Button>
          <ButtonLink href="/wrap" variant="rose" onClick={() => setPreview(false)}>
            Wrap it up <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </Modal>
    </main>
  );
}

function PreviewStage() {
  const design = useBouquet((s) => s.design);
  return <BouquetStage design={design} className="rounded-3xl shadow-soft" />;
}
