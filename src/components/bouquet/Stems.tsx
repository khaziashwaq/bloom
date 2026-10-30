"use client";

import { memo } from "react";
import { BIND_POINT, getDef, itemBoxSize } from "@/lib/catalog";
import type { CanvasItem } from "@/lib/types";

/** Where the stem leaves the flower head, in canvas units. */
export function stemAnchor(item: CanvasItem): [number, number] {
  const def = getDef(item.kind);
  const [bx, by, bw, bh] = def.box;
  const unit = (itemBoxSize(item.kind).w / bw) * item.scale;
  const ax = (def.stemAnchor[0] - (bx + bw / 2)) * unit * (item.flip ? -1 : 1);
  const ay = (def.stemAnchor[1] - (by + bh / 2)) * unit;
  const r = (item.rotation * Math.PI) / 180;
  return [item.x + ax * Math.cos(r) - ay * Math.sin(r), item.y + ax * Math.sin(r) + ay * Math.cos(r)];
}

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** A natural stem curving from the flower down into the bunch where everything is tied. */
export function stemPath(item: CanvasItem): string {
  const [ax, ay] = stemAnchor(item);
  const B = BIND_POINT;
  const r = (item.rotation * Math.PI) / 180;
  const down: [number, number] = [-Math.sin(r), Math.cos(r)];
  const jitter = (hash(item.id) % 40) - 20;
  const f = (n: number) => Math.round(n);
  if (ay > B.y - 60) {
    return `M${f(ax)},${f(ay)} L${f(ax + down[0] * 150)},${f(ay + down[1] * 150)}`;
  }
  const L = Math.hypot(B.x - ax, B.y - ay);
  const bx = B.x + (ax - B.x) * 0.07;
  const c1x = ax + down[0] * L * 0.32;
  const c1y = ay + down[1] * L * 0.32;
  const c2y = B.y - L * 0.32;
  const endX = B.x + (ax - B.x) * 0.15 + jitter * 0.4;
  const endY = B.y + 255 + (hash(item.id) % 30);
  return `M${f(ax)},${f(ay)} C${f(c1x)},${f(c1y)} ${f(bx)},${f(c2y)} ${f(bx)},${B.y} L${f(endX)},${f(endY)}`;
}

export const Stems = memo(function Stems({ items }: { items: CanvasItem[] }) {
  return (
    <g fill="none" strokeLinecap="round">
      {items.map((it) => {
        const def = getDef(it.kind);
        const w = def.stemWidth * Math.min(1.4, Math.max(0.7, it.scale));
        return (
          <g key={it.id}>
            <path d={stemPath(it)} stroke={def.stemColor} strokeWidth={w} />
            <path d={stemPath(it)} stroke="#ffffff" strokeOpacity={0.18} strokeWidth={w * 0.3} transform={`translate(${-w * 0.2},0)`} />
          </g>
        );
      })}
    </g>
  );
});
