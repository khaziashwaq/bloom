"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_DECORATIONS, MAX_ITEMS, isGreenery } from "./catalog";
import { newId } from "./ids";
import type {
  BackgroundId,
  BouquetDesign,
  BouquetNote,
  CanvasItem,
  Decorations,
  ItemKind,
  RibbonId,
  WrappingId,
} from "./types";

export interface BasketEntry {
  kind: ItemKind;
  variant: string;
  count: number;
}

export interface ShareResult {
  /** Fingerprint of the design+note that was shared, so edits invalidate the link. */
  key: string;
  id: string;
  url: string;
  mode: "link" | "supabase";
}

export const emptyDesign = (): BouquetDesign => ({
  items: [],
  wrapping: "blush",
  ribbon: "satin-pink",
  background: "cream",
  decorations: { ...DEFAULT_DECORATIONS },
});

export const emptyNote = (): BouquetNote => ({ to: "", message: "", from: "", card: "cream" });

const HISTORY_LIMIT = 80;

interface BouquetState {
  hydrated: boolean;
  design: BouquetDesign;
  note: BouquetNote;
  basket: BasketEntry[];
  selectedId: string | null;
  past: BouquetDesign[];
  future: BouquetDesign[];
  gestureBase: BouquetDesign | null;
  lastShare: ShareResult | null;

  addToBasket: (kind: ItemKind, variant: string, n?: number) => void;
  removeFromBasket: (kind: ItemKind, variant: string, n?: number) => void;
  setBasket: (entries: BasketEntry[]) => void;
  clearBasket: () => void;

  addItems: (items: Omit<CanvasItem, "id">[], opts?: { select?: boolean }) => string[];
  replaceItems: (items: CanvasItem[]) => void;
  updateItem: (id: string, patch: Partial<CanvasItem>) => void;
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => string | null;
  moveLayer: (id: string, dir: "up" | "down" | "top" | "bottom") => void;
  select: (id: string | null) => void;
  setWrapping: (id: WrappingId) => void;
  setRibbon: (id: RibbonId) => void;
  setBackground: (id: BackgroundId) => void;
  setDecorations: (patch: Partial<Decorations>) => void;
  resetCanvas: () => void;

  /** Gestures (drag, pinch, wheel) mutate live and land in history once. */
  beginGesture: () => void;
  liveUpdate: (id: string, patch: Partial<CanvasItem>) => void;
  liveSetItems: (items: CanvasItem[]) => void;
  endGesture: () => void;

  undo: () => void;
  redo: () => void;

  setNote: (patch: Partial<BouquetNote>) => void;
  setLastShare: (r: ShareResult | null) => void;
  startOver: () => void;
}

export const useBouquet = create<BouquetState>()(
  persist(
    (set, get) => {
      /** Apply a change to the design and record the previous design for undo. */
      const commit = (fn: (d: BouquetDesign) => BouquetDesign) =>
        set((s) => {
          const next = fn(s.design);
          if (next === s.design) return s;
          return { design: next, past: [...s.past, s.design].slice(-HISTORY_LIMIT), future: [] };
        });

      const mapItem = (d: BouquetDesign, id: string, patch: Partial<CanvasItem>): BouquetDesign => ({
        ...d,
        items: d.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      });

      return {
        hydrated: false,
        design: emptyDesign(),
        note: emptyNote(),
        basket: [],
        selectedId: null,
        past: [],
        future: [],
        gestureBase: null,
        lastShare: null,

        addToBasket: (kind, variant, n = 1) =>
          set((s) => {
            const existing = s.basket.find((b) => b.kind === kind && b.variant === variant);
            if (existing) {
              return {
                basket: s.basket.map((b) => (b === existing ? { ...b, count: Math.min(b.count + n, 24) } : b)),
              };
            }
            return { basket: [...s.basket, { kind, variant, count: n }] };
          }),
        removeFromBasket: (kind, variant, n = 1) =>
          set((s) => ({
            basket: s.basket
              .map((b) => (b.kind === kind && b.variant === variant ? { ...b, count: b.count - n } : b))
              .filter((b) => b.count > 0),
          })),
        setBasket: (entries) => set({ basket: entries }),
        clearBasket: () => set({ basket: [] }),

        addItems: (items, opts) => {
          const room = MAX_ITEMS - get().design.items.length;
          if (room <= 0) return [];
          const created = items.slice(0, room).map((it) => ({ ...it, id: newId(8) }));
          commit((d) => {
            // Greenery tucks in behind the flowers; flowers land on top.
            const green = created.filter((c) => isGreenery(c.kind));
            const blooms = created.filter((c) => !isGreenery(c.kind));
            return { ...d, items: [...green, ...d.items, ...blooms] };
          });
          if (opts?.select && created.length) set({ selectedId: created[created.length - 1].id });
          return created.map((c) => c.id);
        },
        replaceItems: (items) => commit((d) => ({ ...d, items })),
        updateItem: (id, patch) => commit((d) => mapItem(d, id, patch)),
        removeItem: (id) => {
          commit((d) => ({ ...d, items: d.items.filter((it) => it.id !== id) }));
          if (get().selectedId === id) set({ selectedId: null });
        },
        duplicateItem: (id) => {
          const src = get().design.items.find((it) => it.id === id);
          if (!src || get().design.items.length >= MAX_ITEMS) return null;
          const copy: CanvasItem = {
            ...src,
            id: newId(8),
            x: Math.min(src.x + 46, 960),
            y: Math.max(src.y - 26, 40),
            rotation: src.rotation + 8,
          };
          commit((d) => {
            const idx = d.items.findIndex((it) => it.id === id);
            const items = [...d.items];
            items.splice(idx + 1, 0, copy);
            return { ...d, items };
          });
          set({ selectedId: copy.id });
          return copy.id;
        },
        moveLayer: (id, dir) =>
          commit((d) => {
            const idx = d.items.findIndex((it) => it.id === id);
            if (idx < 0) return d;
            const items = [...d.items];
            const [it] = items.splice(idx, 1);
            const target =
              dir === "top" ? items.length : dir === "bottom" ? 0 : dir === "up" ? Math.min(idx + 1, items.length) : Math.max(idx - 1, 0);
            if (target === idx) return d;
            items.splice(target, 0, it);
            return { ...d, items };
          }),
        select: (id) => set({ selectedId: id }),
        setWrapping: (wrapping) => commit((d) => (d.wrapping === wrapping ? d : { ...d, wrapping })),
        setRibbon: (ribbon) => commit((d) => (d.ribbon === ribbon ? d : { ...d, ribbon })),
        setBackground: (background) => commit((d) => (d.background === background ? d : { ...d, background })),
        setDecorations: (patch) => commit((d) => ({ ...d, decorations: { ...d.decorations, ...patch } })),
        resetCanvas: () => {
          commit((d) => (d.items.length ? { ...d, items: [] } : d));
          set({ selectedId: null });
        },

        beginGesture: () => set((s) => (s.gestureBase ? s : { gestureBase: s.design })),
        liveUpdate: (id, patch) => set((s) => ({ design: mapItem(s.design, id, patch) })),
        liveSetItems: (items) => set((s) => ({ design: { ...s.design, items } })),
        endGesture: () =>
          set((s) => {
            const base = s.gestureBase;
            if (!base) return s;
            if (base === s.design) return { gestureBase: null };
            return { gestureBase: null, past: [...s.past, base].slice(-HISTORY_LIMIT), future: [] };
          }),

        undo: () =>
          set((s) => {
            if (!s.past.length) return s;
            const prev = s.past[s.past.length - 1];
            const stillThere = s.selectedId && prev.items.some((it) => it.id === s.selectedId);
            return {
              design: prev,
              past: s.past.slice(0, -1),
              future: [s.design, ...s.future].slice(0, HISTORY_LIMIT),
              selectedId: stillThere ? s.selectedId : null,
            };
          }),
        redo: () =>
          set((s) => {
            if (!s.future.length) return s;
            const next = s.future[0];
            const stillThere = s.selectedId && next.items.some((it) => it.id === s.selectedId);
            return {
              design: next,
              future: s.future.slice(1),
              past: [...s.past, s.design].slice(-HISTORY_LIMIT),
              selectedId: stillThere ? s.selectedId : null,
            };
          }),

        setNote: (patch) => set((s) => ({ note: { ...s.note, ...patch } })),
        setLastShare: (lastShare) => set({ lastShare }),
        startOver: () =>
          set({
            design: emptyDesign(),
            note: emptyNote(),
            basket: [],
            selectedId: null,
            past: [],
            future: [],
            gestureBase: null,
            lastShare: null,
          }),
      };
    },
    {
      name: "bloom-draft-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ design: s.design, note: s.note, basket: s.basket, lastShare: s.lastShare }),
      onRehydrateStorage: () => () => {
        useBouquet.setState({ hydrated: true });
      },
    },
  ),
);

/** Changes only when flowers are added, removed or recoloured — not while dragging. */
export const selectComposition = (s: BouquetState) => s.design.items.map((it) => `${it.kind}:${it.variant}`).join(",");

export function countPlaced(composition: string, kind: ItemKind, variant: string) {
  if (!composition) return 0;
  const key = `${kind}:${variant}`;
  return composition.split(",").filter((k) => k === key).length;
}

/* ---------------- App settings (sound) ---------------- */

interface SettingsState {
  sfx: boolean;
  music: boolean;
  setSfx: (on: boolean) => void;
  setMusic: (on: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      sfx: true,
      music: false,
      setSfx: (sfx) => set({ sfx }),
      setMusic: (music) => set({ music }),
    }),
    {
      name: "bloom-settings-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

/* ---------------- Toasts ---------------- */

export interface Toast {
  id: string;
  message: string;
  action?: { label: string; run: () => void };
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, action?: Toast["action"]) => void;
  dismiss: (id: string) => void;
}

export const useToasts = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (message, action) => {
    const id = newId(6);
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, action }] }));
    setTimeout(() => get().dismiss(id), action ? 5200 : 2600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = (message: string, action?: Toast["action"]) => useToasts.getState().push(message, action);
