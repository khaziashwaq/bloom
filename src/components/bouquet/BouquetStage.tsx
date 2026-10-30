"use client";

import { memo, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref } from "react";
import { ItemArt } from "@/components/art/ItemArt";
import { CANVAS_H, CANVAS_W, backgroundDef, itemBoxSize } from "@/lib/catalog";
import type { BackgroundId, BouquetDesign, CanvasItem } from "@/lib/types";
import { Decorations } from "./Decorations";
import { Ribbon } from "./Ribbon";
import { Stems } from "./Stems";
import { WrapBack, WrapFront } from "./Wrapping";

/* Items added in the editor get a little bloom-in. We remember them briefly here. */
const freshItems = new Map<string, number>();
export function markFresh(ids: string[], stagger = 0) {
  ids.forEach((id, i) => freshItems.set(id, i * stagger));
  setTimeout(() => ids.forEach((id) => freshItems.delete(id)), 3000 + ids.length * stagger);
}

const pct = (n: number) => `${(n * 100).toFixed(3)}%`;

export function itemTransform(item: CanvasItem) {
  return `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.flip ? -item.scale : item.scale}, ${item.scale})`;
}

interface ItemViewProps {
  item: CanvasItem;
  index: number;
  interactive: boolean;
  onPointerDown?: (e: ReactPointerEvent, id: string) => void;
  enterDelay?: number;
}

const ItemView = memo(function ItemView({ item, index, interactive, onPointerDown, enterDelay }: ItemViewProps) {
  const [delay] = useState(() => enterDelay ?? freshItems.get(item.id));
  const [blooming, setBlooming] = useState(delay !== undefined);
  const { w, h } = itemBoxSize(item.kind);
  return (
    <div
      data-item-id={item.id}
      className="absolute"
      style={{
        left: pct(item.x / CANVAS_W),
        top: pct(item.y / CANVAS_H),
        width: pct(w / CANVAS_W),
        height: pct(h / CANVAS_H),
        transform: itemTransform(item),
        zIndex: 10 + index,
        pointerEvents: interactive ? "none" : undefined,
      }}
      onPointerDown={interactive && onPointerDown ? (e) => onPointerDown(e, item.id) : undefined}
    >
      <div
        className={blooming ? "animate-bloom-in h-full w-full" : "h-full w-full"}
        style={{
          animationDelay: blooming ? `${delay}ms` : undefined,
          filter: "drop-shadow(0 4px 5px rgb(89 69 63 / 0.16))",
        }}
        onAnimationEnd={() => setBlooming(false)}
      >
        <ItemArt kind={item.kind} variant={item.variant} hit={interactive} className="block h-full w-full" />
      </div>
    </div>
  );
});

export function backgroundStyle(id: BackgroundId): CSSProperties {
  const bg = backgroundDef(id);
  const glow = "radial-gradient(ellipse 70% 55% at 50% 40%, rgb(255 255 255 / 0.75), transparent 70%)";
  if (id === "gingham") {
    const c = "rgb(244 207 218 / 0.45)";
    return {
      backgroundColor: bg.color,
      backgroundImage: `${glow}, linear-gradient(90deg, ${c} 50%, transparent 50%), linear-gradient(${c} 50%, transparent 50%)`,
      backgroundSize: `100% 100%, calc(100% / 16) calc(100% / 19.2), calc(100% / 16) calc(100% / 19.2)`,
    };
  }
  return {
    backgroundColor: bg.color,
    backgroundImage: `${glow}, radial-gradient(ellipse 120% 90% at 50% 110%, ${bg.accent}, transparent 60%)`,
  };
}

export interface BouquetStageProps {
  design: BouquetDesign;
  interactive?: boolean;
  onItemPointerDown?: (e: ReactPointerEvent, id: string) => void;
  /** Receive-page reveal: each flower blooms in turn. */
  bloom?: { delay: number; stagger: number };
  background?: boolean;
  animateRibbon?: boolean;
  className?: string;
  style?: CSSProperties;
  stageRef?: Ref<HTMLDivElement>;
  children?: ReactNode;
  /** Replay key for the ribbon tie animation. */
  ribbonKey?: string | number;
  onStagePointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void;
}

/**
 * Renders a bouquet in the 1000 x 1200 canvas space, scaled to its container.
 * Used both by the interactive studio and every read-only preview.
 */
export function BouquetStage({
  design,
  interactive = false,
  onItemPointerDown,
  bloom,
  background = true,
  animateRibbon = true,
  className = "",
  style,
  stageRef,
  children,
  ribbonKey,
  onStagePointerDown,
}: BouquetStageProps) {
  const svgCls = "pointer-events-none absolute inset-0 h-full w-full";
  return (
    <div
      ref={stageRef}
      className={`relative w-full select-none overflow-hidden ${className}`}
      style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}`, ...(background ? backgroundStyle(design.background) : null), ...style }}
      onPointerDown={onStagePointerDown}
    >
      <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className={svgCls} style={{ zIndex: 1 }} aria-hidden>
        <WrapBack wrapping={design.wrapping} />
      </svg>
      <svg
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        className={`${svgCls} ${bloom ? "animate-[fade-in_0.8s_ease_both]" : ""}`}
        style={{ zIndex: 2, animationDelay: bloom ? `${bloom.delay}ms` : undefined }}
        aria-hidden
      >
        <Stems items={design.items} />
      </svg>
      {design.items.map((item, i) => (
        <ItemView
          key={item.id}
          item={item}
          index={i}
          interactive={interactive}
          onPointerDown={onItemPointerDown}
          enterDelay={bloom ? bloom.delay + i * bloom.stagger : undefined}
        />
      ))}
      <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className={svgCls} style={{ zIndex: 900 }} aria-hidden>
        <WrapFront wrapping={design.wrapping} />
        <Ribbon key={ribbonKey ?? design.ribbon} ribbon={design.ribbon} animate={animateRibbon} />
        <Decorations decorations={design.decorations} ribbon={design.ribbon} wrapping={design.wrapping} />
      </svg>
      {children}
    </div>
  );
}
