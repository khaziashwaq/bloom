"use client";

import { Check, Flower2, Leaf, Palette, Ribbon as RibbonIcon, Scroll } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { ItemArt } from "@/components/art/ItemArt";
import { backgroundStyle } from "@/components/bouquet/BouquetStage";
import { RibbonSwatch } from "@/components/bouquet/Ribbon";
import { WrapSwatch } from "@/components/bouquet/Wrapping";
import { BACKGROUNDS, FLOWERS, GREENERY, RIBBONS, WRAPPINGS, getDef, type ItemDef } from "@/lib/catalog";
import { sound } from "@/lib/sound";
import { countPlaced, selectComposition, useBouquet } from "@/lib/store";
import type { ItemKind } from "@/lib/types";

export type TrayTab = "flowers" | "greenery" | "wrapping" | "ribbons" | "background";

export const TABS: { id: TrayTab; label: string; icon: ReactNode; hint: string }[] = [
  { id: "flowers", label: "Flowers", icon: <Flower2 size={18} />, hint: "Drag a bloom onto the canvas, or tap to tuck it in." },
  { id: "greenery", label: "Greenery", icon: <Leaf size={18} />, hint: "Leaves and fillers slip in behind your flowers." },
  { id: "wrapping", label: "Wrapping", icon: <Scroll size={18} />, hint: "Pick the paper your bouquet is wrapped in." },
  { id: "ribbons", label: "Ribbons", icon: <RibbonIcon size={18} />, hint: "Tie it all together with a satin bow." },
  { id: "background", label: "Background", icon: <Palette size={18} />, hint: "Set the scene behind your bouquet." },
];

export interface DragApi {
  start: (kind: ItemKind, variant: string, x: number, y: number) => void;
  move: (x: number, y: number) => void;
  end: (kind: ItemKind, variant: string, x: number, y: number, cancelled: boolean) => void;
}

interface TrayProps {
  tab: TrayTab;
  axis: "x" | "y";
  drag: DragApi;
  onAdd: (kind: ItemKind, variant: string) => void;
}

export function TabBar({ tab, onTab, vertical }: { tab: TrayTab; onTab: (t: TrayTab) => void; vertical?: boolean }) {
  return (
    <div role="tablist" aria-label="Studio tools" className={`flex ${vertical ? "gap-1" : "justify-between gap-1"}`}>
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={tab === t.id}
          onClick={() => {
            sound.play("tap");
            onTab(t.id);
          }}
          className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[11px] font-extrabold transition ${
            tab === t.id ? "bg-cocoa text-cream shadow-[0_2px_0_0_#3c2d29]" : "text-cocoa-soft hover:bg-cocoa/6 hover:text-cocoa"
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

const rail = "flex gap-2 lg:grid lg:grid-cols-3 lg:gap-2.5";

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col gap-1 lg:block">
      <p className="px-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-cocoa-soft lg:mb-2 lg:mt-1">{label}</p>
      {children}
    </div>
  );
}

export function StudioTray({ tab, axis, drag, onAdd }: TrayProps) {
  const basket = useBouquet((s) => s.basket);
  const composition = useBouquet(selectComposition);
  const wrapping = useBouquet((s) => s.design.wrapping);
  const ribbon = useBouquet((s) => s.design.ribbon);
  const background = useBouquet((s) => s.design.background);
  const setWrapping = useBouquet((s) => s.setWrapping);
  const setRibbon = useBouquet((s) => s.setRibbon);
  const setBackground = useBouquet((s) => s.setBackground);

  const placed = (kind: ItemKind, variant: string) => countPlaced(composition, kind, variant);

  const container =
    "no-scrollbar flex h-full items-start gap-4 overflow-x-auto px-3 py-2 soft-scroll lg:block lg:space-y-4 lg:overflow-y-auto lg:overflow-x-hidden lg:px-4 lg:pb-6";

  if (tab === "flowers") {
    const picks = basket;
    return (
      <div className={container}>
        {picks.length > 0 && (
          <Section label="Your picks">
            <div className={rail}>
              {picks.map((b) => {
                const left = Math.max(0, b.count - placed(b.kind, b.variant));
                return (
                  <TrayTile
                    key={`${b.kind}-${b.variant}`}
                    kind={b.kind}
                    variant={b.variant}
                    label={getDef(b.kind).single}
                    axis={axis}
                    drag={drag}
                    onAdd={onAdd}
                    badge={
                      left > 0 ? (
                        <span className="rounded-full bg-rosewood px-1.5 text-[10px] font-extrabold text-white">{left} left</span>
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sage-deep text-white">
                          <Check size={10} strokeWidth={3.5} />
                        </span>
                      )
                    }
                  />
                );
              })}
            </div>
          </Section>
        )}
        <Section label="All flowers">
          <div className={rail}>
            {FLOWERS.map((def) => (
              <TypeTile key={def.kind} def={def} axis={axis} drag={drag} onAdd={onAdd} />
            ))}
          </div>
        </Section>
      </div>
    );
  }

  if (tab === "greenery") {
    return (
      <div className={container}>
        <Section label="Greenery & fillers">
          <div className={rail}>
            {GREENERY.map((def) => (
              <TypeTile key={def.kind} def={def} axis={axis} drag={drag} onAdd={onAdd} />
            ))}
          </div>
        </Section>
      </div>
    );
  }

  const choice = (selected: boolean, onClick: () => void, label: string, swatch: ReactNode) => (
    <button
      key={label}
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex w-[84px] shrink-0 flex-col items-center gap-1 rounded-2xl p-1.5 text-[11px] font-bold leading-tight text-cocoa transition lg:w-auto ${
        selected ? "bg-blush ring-2 ring-rosewood" : "bg-cream ring-1 ring-cocoa/10 hover:bg-white"
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-paper">{swatch}</div>
      <span className="line-clamp-2 text-center">{label}</span>
    </button>
  );

  if (tab === "wrapping") {
    return (
      <div className={container}>
        <Section label="Wrapping paper">
          <div className={rail}>
            {WRAPPINGS.map((w) =>
              choice(
                wrapping === w.id,
                () => {
                  sound.play("rustle");
                  setWrapping(w.id);
                },
                w.name,
                <WrapSwatch wrapping={w.id} className="h-full w-full p-1.5" />,
              ),
            )}
          </div>
        </Section>
      </div>
    );
  }

  if (tab === "ribbons") {
    return (
      <div className={container}>
        <Section label="Ribbon">
          <div className={rail}>
            {RIBBONS.map((r) =>
              choice(
                ribbon === r.id,
                () => {
                  sound.play("ribbon");
                  setRibbon(r.id);
                },
                r.name,
                <RibbonSwatch ribbon={r.id} className="h-full w-full p-1.5" />,
              ),
            )}
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className={container}>
      <Section label="Background">
        <div className={rail}>
          {BACKGROUNDS.map((b) =>
            choice(
              background === b.id,
              () => {
                sound.play("tap");
                setBackground(b.id);
              },
              b.name,
              <div className="h-full w-full" style={backgroundStyle(b.id)} />,
            ),
          )}
        </div>
      </Section>
    </div>
  );
}

function TypeTile({ def, axis, drag, onAdd }: { def: ItemDef; axis: "x" | "y"; drag: DragApi; onAdd: (k: ItemKind, v: string) => void }) {
  const [variant, setVariant] = useState(def.variants[0].id);
  return (
    <TrayTile
      kind={def.kind}
      variant={variant}
      label={def.single}
      axis={axis}
      drag={drag}
      onAdd={onAdd}
      footer={
        def.variants.length > 1 ? (
          <div className="flex justify-center gap-[3px]">
            {def.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-label={`${v.name} ${def.single}`}
                onClick={() => {
                  sound.play("tap");
                  setVariant(v.id);
                }}
                className={`h-3.5 w-3.5 rounded-full transition lg:h-4 lg:w-4 ${variant === v.id ? "ring-2 ring-cocoa ring-offset-1 ring-offset-paper" : "ring-1 ring-cocoa/15"}`}
                style={{ background: v.palette.base }}
              />
            ))}
          </div>
        ) : null
      }
    />
  );
}

function TrayTile({
  kind,
  variant,
  label,
  badge,
  footer,
  axis,
  drag,
  onAdd,
}: {
  kind: ItemKind;
  variant: string;
  label: string;
  badge?: ReactNode;
  footer?: ReactNode;
  axis: "x" | "y";
  drag: DragApi;
  onAdd: (k: ItemKind, v: string) => void;
}) {
  const st = useRef<{ id: number; x: number; y: number; dragging: boolean; mouse: boolean } | null>(null);
  const suppressClick = useRef(false);
  const tall = getDef(kind).box[3] > getDef(kind).box[2] * 1.2;

  return (
    <div className="flex w-[84px] shrink-0 flex-col gap-1 lg:w-auto">
      <button
        type="button"
        aria-label={`Add ${label}`}
        title="Drag onto the canvas, or tap to add"
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          st.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dragging: false, mouse: e.pointerType === "mouse" };
        }}
        onPointerMove={(e) => {
          const s = st.current;
          if (!s || s.id !== e.pointerId) return;
          const dx = e.clientX - s.x;
          const dy = e.clientY - s.y;
          if (!s.dragging) {
            if (Math.hypot(dx, dy) < 8) return;
            if (!s.mouse) {
              // On touch, movement along the tray's scroll axis is a scroll, not a drag.
              const along = axis === "x" ? Math.abs(dx) : Math.abs(dy);
              const across = axis === "x" ? Math.abs(dy) : Math.abs(dx);
              if (along > across) {
                st.current = null;
                return;
              }
            }
            s.dragging = true;
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* pointer already released */
            }
            drag.start(kind, variant, e.clientX, e.clientY);
          }
          drag.move(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          const s = st.current;
          st.current = null;
          if (s?.dragging) {
            suppressClick.current = true;
            drag.end(kind, variant, e.clientX, e.clientY, false);
          }
        }}
        onPointerCancel={(e) => {
          const s = st.current;
          st.current = null;
          if (s?.dragging) drag.end(kind, variant, e.clientX, e.clientY, true);
        }}
        onClick={() => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          onAdd(kind, variant);
        }}
        className={`group relative flex aspect-square w-full cursor-grab touch-pan-x select-none items-center justify-center rounded-2xl bg-cream ring-1 ring-cocoa/10 transition hover:bg-white hover:ring-rosewood/40 active:scale-95 active:cursor-grabbing lg:touch-pan-y`}
      >
        <ItemArt kind={kind} variant={variant} className={`pointer-events-none transition-transform group-hover:scale-110 ${tall ? "h-[86%] w-[60%]" : "h-[80%] w-[80%]"}`} />
        {badge && <span className="absolute right-1 top-1">{badge}</span>}
      </button>
      {footer}
      <p className="truncate px-0.5 text-center text-[10px] font-bold text-cocoa-soft">{label}</p>
    </div>
  );
}
