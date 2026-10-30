"use client";

import { Maximize2, RotateCw } from "lucide-react";
import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { BouquetStage } from "@/components/bouquet/BouquetStage";
import { CANVAS_H, CANVAS_W, itemBoxSize } from "@/lib/catalog";
import { useGestureCommit } from "@/lib/hooks";
import { sound } from "@/lib/sound";
import { useBouquet } from "@/lib/store";
import type { CanvasItem } from "@/lib/types";

type Gesture =
  | { type: "drag"; id: string; pid: number; sx: number; sy: number; ox: number; oy: number; moved: boolean }
  | { type: "pinch"; id: string; d0: number; a0: number; mx0: number; my0: number; o: CanvasItem }
  | { type: "rotate"; id: string; pid: number; a0: number; r0: number }
  | { type: "scale"; id: string; pid: number; d0: number; s0: number };

export const SCALE_MIN = 0.35;
export const SCALE_MAX = 2.6;

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const deg = (rad: number) => (rad * 180) / Math.PI;
/** Keep angles in (-180, 180]. */
export const normAngle = (a: number) => {
  let r = ((a + 180) % 360 + 360) % 360 - 180;
  if (r === -180) r = 180;
  return r;
};
const snap = (a: number) => {
  const n = normAngle(a);
  for (const t of [0, 90, -90, 180]) if (Math.abs(n - t) < 3.5) return t;
  return Math.round(n * 10) / 10;
};

const getItem = (id: string) => useBouquet.getState().design.items.find((it) => it.id === id);

/**
 * The interactive bouquet canvas. All gestures write straight into the store
 * as "live" changes and are committed to undo history once, when they end.
 */
export function BouquetEditor({ stageRef, dropActive }: { stageRef: RefObject<HTMLDivElement | null>; dropActive?: boolean }) {
  const design = useBouquet((s) => s.design);
  const selectedId = useBouquet((s) => s.selectedId);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const tapToDeselect = useRef(false);
  const frame = useRef(0);
  const touchCommit = useGestureCommit();

  const toCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const r = stageRef.current!.getBoundingClientRect();
      return { x: ((clientX - r.left) / r.width) * CANVAS_W, y: ((clientY - r.top) / r.height) * CANVAS_H };
    },
    [stageRef],
  );

  const apply = useCallback(() => {
    frame.current = 0;
    const g = gesture.current;
    if (!g) return;
    const { liveUpdate } = useBouquet.getState();
    const item = getItem(g.id);
    if (!item) return;
    if (g.type === "drag") {
      const p = pointers.current.get(g.pid);
      if (!p) return;
      const dx = p.x - g.sx;
      const dy = p.y - g.sy;
      if (!g.moved && Math.hypot(dx, dy) < 4) return;
      g.moved = true;
      liveUpdate(g.id, { x: Math.round(clamp(g.ox + dx, 0, CANVAS_W)), y: Math.round(clamp(g.oy + dy, 0, CANVAS_H)) });
    } else if (g.type === "pinch") {
      const pts = [...pointers.current.values()];
      if (pts.length < 2) return;
      const [a, b] = pts;
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const ang = deg(Math.atan2(b.y - a.y, b.x - a.x));
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      liveUpdate(g.id, {
        scale: Math.round(clamp((g.o.scale * d) / Math.max(g.d0, 1), SCALE_MIN, SCALE_MAX) * 100) / 100,
        rotation: snap(g.o.rotation + ang - g.a0),
        x: Math.round(clamp(g.o.x + mx - g.mx0, 0, CANVAS_W)),
        y: Math.round(clamp(g.o.y + my - g.my0, 0, CANVAS_H)),
      });
    } else if (g.type === "rotate") {
      const p = pointers.current.get(g.pid);
      if (!p) return;
      const ang = deg(Math.atan2(p.y - item.y, p.x - item.x));
      liveUpdate(g.id, { rotation: snap(g.r0 + ang - g.a0) });
    } else if (g.type === "scale") {
      const p = pointers.current.get(g.pid);
      if (!p) return;
      const d = Math.hypot(p.x - item.x, p.y - item.y);
      liveUpdate(g.id, { scale: Math.round(clamp((g.s0 * d) / Math.max(g.d0, 1), SCALE_MIN, SCALE_MAX) * 100) / 100 });
    }
  }, []);

  const finish = useCallback(() => {
    const g = gesture.current;
    gesture.current = null;
    if (g) {
      useBouquet.getState().endGesture();
      if (g.type === "drag" && g.moved) sound.play("place");
    }
  }, []);

  const onMove = useCallback(
    (e: PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, toCanvas(e.clientX, e.clientY));
      if (pointers.current.size > 1 || gesture.current) tapToDeselect.current = false;
      if (!frame.current) frame.current = requestAnimationFrame(apply);
    },
    [apply, toCanvas],
  );

  // Window listeners live only while a pointer is down on the canvas.
  const listening = useRef<AbortController | null>(null);
  const unlisten = useCallback(() => {
    listening.current?.abort();
    listening.current = null;
  }, []);

  const onUp = useCallback(
    (e: PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.delete(e.pointerId);
      const g = gesture.current;
      if (g?.type === "pinch") {
        if (pointers.current.size < 2) finish();
      } else if (g && g.pid === e.pointerId) {
        finish();
      }
      if (pointers.current.size === 0) {
        if (tapToDeselect.current) useBouquet.getState().select(null);
        tapToDeselect.current = false;
        finish();
        unlisten();
      }
    },
    [finish, unlisten],
  );

  const listen = useCallback(() => {
    unlisten();
    const ac = new AbortController();
    listening.current = ac;
    window.addEventListener("pointermove", onMove, { signal: ac.signal });
    window.addEventListener("pointerup", onUp, { signal: ac.signal });
    window.addEventListener("pointercancel", onUp, { signal: ac.signal });
  }, [onMove, onUp, unlisten]);

  useEffect(
    () => () => {
      unlisten();
      if (gesture.current) finish();
      pointers.current.clear();
    },
    [unlisten, finish],
  );

  const startPinch = useCallback((id: string) => {
    const it = getItem(id);
    const pts = [...pointers.current.values()];
    if (!it || pts.length < 2) return;
    const [a, b] = pts;
    useBouquet.getState().beginGesture();
    gesture.current = {
      type: "pinch",
      id,
      d0: Math.hypot(b.x - a.x, b.y - a.y),
      a0: deg(Math.atan2(b.y - a.y, b.x - a.x)),
      mx0: (a.x + b.x) / 2,
      my0: (a.y + b.y) / 2,
      o: { ...it },
    };
  }, []);

  const onItemPointerDown = useCallback(
    (e: ReactPointerEvent, id: string) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      const p = toCanvas(e.clientX, e.clientY);
      const first = pointers.current.size === 0;
      pointers.current.set(e.pointerId, p);
      if (first) listen();
      const s = useBouquet.getState();
      if (pointers.current.size >= 2) {
        startPinch(gesture.current?.id ?? s.selectedId ?? id);
        return;
      }
      if (s.selectedId !== id) sound.play("tap");
      s.select(id);
      const it = getItem(id);
      if (!it) return;
      s.beginGesture();
      gesture.current = { type: "drag", id, pid: e.pointerId, sx: p.x, sy: p.y, ox: it.x, oy: it.y, moved: false };
    },
    [listen, startPinch, toCanvas],
  );

  const onStagePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const first = pointers.current.size === 0;
      pointers.current.set(e.pointerId, toCanvas(e.clientX, e.clientY));
      if (first) listen();
      const sel = useBouquet.getState().selectedId;
      if (pointers.current.size >= 2 && (gesture.current?.id ?? sel)) {
        tapToDeselect.current = false;
        startPinch((gesture.current?.id ?? sel)!);
      } else if (first) {
        tapToDeselect.current = true;
      }
    },
    [listen, startPinch, toCanvas],
  );

  const onHandleDown = useCallback(
    (e: ReactPointerEvent, kind: "rotate" | "scale") => {
      e.stopPropagation();
      e.preventDefault();
      const s = useBouquet.getState();
      const it = s.selectedId ? getItem(s.selectedId) : undefined;
      if (!it) return;
      const p = toCanvas(e.clientX, e.clientY);
      const first = pointers.current.size === 0;
      pointers.current.set(e.pointerId, p);
      if (first) listen();
      s.beginGesture();
      gesture.current =
        kind === "rotate"
          ? { type: "rotate", id: it.id, pid: e.pointerId, a0: deg(Math.atan2(p.y - it.y, p.x - it.x)), r0: it.rotation }
          : { type: "scale", id: it.id, pid: e.pointerId, d0: Math.hypot(p.x - it.x, p.y - it.y), s0: it.scale };
    },
    [listen, toCanvas],
  );

  // Mouse wheel / trackpad: resize (or rotate with Shift / Alt) the selected flower.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const s = useBouquet.getState();
      const it = s.selectedId ? getItem(s.selectedId) : undefined;
      if (!it) return;
      e.preventDefault();
      touchCommit();
      if (e.shiftKey || e.altKey) {
        s.liveUpdate(it.id, { rotation: snap(it.rotation + (e.deltaY || e.deltaX) * 0.12) });
      } else {
        const k = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
        s.liveUpdate(it.id, { scale: Math.round(clamp(it.scale * k, SCALE_MIN, SCALE_MAX) * 100) / 100 });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [stageRef, touchCommit]);

  const selected = design.items.find((it) => it.id === selectedId);

  return (
    <BouquetStage
      design={design}
      interactive
      onItemPointerDown={onItemPointerDown}
      onStagePointerDown={onStagePointerDown}
      stageRef={stageRef}
      className={`touch-none rounded-[1.75rem] shadow-float ring-1 transition-shadow ${dropActive ? "ring-4 ring-rosewood/50" : "ring-cocoa/10"}`}
    >
      {design.items.length === 0 && <DomeGuide />}
      {selected && <SelectionBox item={selected} onHandleDown={onHandleDown} />}
    </BouquetStage>
  );
}

function DomeGuide() {
  return (
    <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="pointer-events-none absolute inset-0 z-[950] h-full w-full" aria-hidden>
      <ellipse cx={500} cy={455} rx={300} ry={250} fill="none" stroke="#c9718c" strokeOpacity={0.35} strokeWidth={4} strokeDasharray="14 14">
        <animate attributeName="stroke-dashoffset" from="0" to="-56" dur="3s" repeatCount="indefinite" />
      </ellipse>
    </svg>
  );
}

function SelectionBox({ item, onHandleDown }: { item: CanvasItem; onHandleDown: (e: ReactPointerEvent, kind: "rotate" | "scale") => void }) {
  const { w, h } = itemBoxSize(item.kind);
  const pct = (n: number) => `${(n * 100).toFixed(3)}%`;
  return (
    <div
      className="pointer-events-none absolute z-[1000]"
      style={{
        left: pct(item.x / CANVAS_W),
        top: pct(item.y / CANVAS_H),
        width: pct((w * item.scale) / CANVAS_W),
        height: pct((h * item.scale) / CANVAS_H),
        transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
      }}
    >
      <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-rosewood/80 bg-rosewood/[0.04]" />
      <div className="absolute bottom-full left-1/2 h-6 w-0.5 -translate-x-1/2 bg-rosewood/70" />
      <button
        type="button"
        aria-label="Rotate (drag)"
        onPointerDown={(e) => onHandleDown(e, "rotate")}
        className="pointer-events-auto absolute bottom-full left-1/2 mb-5 flex h-9 w-9 -translate-x-1/2 cursor-grab touch-none items-center justify-center rounded-full bg-paper text-rosewood shadow-soft ring-2 ring-rosewood active:cursor-grabbing"
      >
        <RotateCw size={16} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        aria-label="Resize (drag)"
        onPointerDown={(e) => onHandleDown(e, "scale")}
        className="pointer-events-auto absolute -bottom-4 -right-4 flex h-9 w-9 cursor-nwse-resize touch-none items-center justify-center rounded-full bg-rosewood text-white shadow-soft ring-2 ring-paper"
      >
        <Maximize2 size={15} strokeWidth={2.5} className="rotate-90" />
      </button>
    </div>
  );
}
