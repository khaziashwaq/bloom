"use client";

import { ArrowDown, ArrowUp, Check, Copy, FlipHorizontal2, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { getDef } from "@/lib/catalog";
import { useGestureCommit } from "@/lib/hooks";
import { sound } from "@/lib/sound";
import { toast, useBouquet } from "@/lib/store";
import { SCALE_MAX, SCALE_MIN, normAngle } from "./BouquetEditor";

function Action({ label, onClick, children, danger, disabled }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-bold transition active:scale-95 disabled:opacity-35 ${
        danger ? "text-[#b4475f] hover:bg-[#fdeef2]" : "text-cocoa hover:bg-cocoa/6"
      }`}
    >
      {children}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 text-xs font-bold text-cocoa">
      <span className="w-9 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bloom-range h-8 min-w-0 flex-1"
        style={{ "--fill": `${pct}%` } as React.CSSProperties}
      />
      <span className="w-10 shrink-0 text-right tabular-nums text-cocoa-soft">{display}</span>
    </label>
  );
}

/** Edit panel for the selected flower: layer, duplicate, flip, delete, colour, size, tilt. */
export function ItemControls({ compact = false }: { compact?: boolean }) {
  const selectedId = useBouquet((s) => s.selectedId);
  const item = useBouquet((s) => s.design.items.find((it) => it.id === s.selectedId));
  const index = useBouquet((s) => s.design.items.findIndex((it) => it.id === s.selectedId));
  const count = useBouquet((s) => s.design.items.length);
  const commit = useGestureCommit();
  if (!item || !selectedId) return null;
  const def = getDef(item.kind);
  const s = useBouquet.getState;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-serif text-base font-semibold leading-tight text-cocoa">{def.single}</p>
          <p className="text-[11px] font-semibold text-cocoa-soft">
            Layer {index + 1} of {count}
          </p>
        </div>
        {def.variants.length > 1 && (
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Colour">
            {def.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={item.variant === v.id}
                aria-label={v.name}
                title={v.name}
                onClick={() => {
                  sound.play("pick");
                  s().updateItem(item.id, { variant: v.id });
                }}
                className={`h-6 w-6 rounded-full transition ${item.variant === v.id ? "ring-2 ring-cocoa ring-offset-2 ring-offset-paper" : "ring-1 ring-cocoa/15 hover:scale-110"}`}
                style={{ background: `radial-gradient(circle at 35% 30%, ${v.palette.light}, ${v.palette.base} 55%, ${v.palette.dark})` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className={`flex ${compact ? "flex-col gap-0" : "flex-col gap-0.5"}`}>
        <Slider
          label="Size"
          value={item.scale}
          min={SCALE_MIN}
          max={SCALE_MAX}
          step={0.01}
          display={`${Math.round(item.scale * 100)}%`}
          onChange={(v) => {
            commit();
            s().liveUpdate(item.id, { scale: v });
          }}
        />
        <Slider
          label="Tilt"
          value={normAngle(item.rotation)}
          min={-180}
          max={180}
          step={1}
          display={`${Math.round(normAngle(item.rotation))}°`}
          onChange={(v) => {
            commit();
            s().liveUpdate(item.id, { rotation: Math.abs(v) < 3 ? 0 : v });
          }}
        />
      </div>

      <div className="-mx-1 flex items-center justify-between">
        <Action label="Forward" onClick={() => s().moveLayer(item.id, "up")} disabled={index === count - 1}>
          <ArrowUp size={18} />
        </Action>
        <Action label="Back" onClick={() => s().moveLayer(item.id, "down")} disabled={index === 0}>
          <ArrowDown size={18} />
        </Action>
        <Action
          label="Copy"
          onClick={() => {
            const id = s().duplicateItem(item.id);
            if (id) sound.play("pop");
            else toast("That's as many flowers as one bouquet can hold!");
          }}
        >
          <Copy size={18} />
        </Action>
        <Action label="Flip" onClick={() => s().updateItem(item.id, { flip: !item.flip })}>
          <FlipHorizontal2 size={18} />
        </Action>
        <Action
          label="Remove"
          danger
          onClick={() => {
            sound.play("unpick");
            s().removeItem(item.id);
            toast(`${def.single} removed`, { label: "Undo", run: () => useBouquet.getState().undo() });
          }}
        >
          <Trash2 size={18} />
        </Action>
        <Action label="Done" onClick={() => s().select(null)}>
          <Check size={18} />
        </Action>
      </div>
    </div>
  );
}
