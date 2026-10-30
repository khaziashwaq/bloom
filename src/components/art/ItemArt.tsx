"use client";

import { memo, useId, type ComponentType, type CSSProperties } from "react";
import { getDef, getVariant } from "@/lib/catalog";
import type { ItemKind } from "@/lib/types";
import {
  BabysBreathArt,
  CarnationArt,
  DaisyArt,
  HydrangeaArt,
  LavenderArt,
  LilyArt,
  PeonyArt,
  RoseArt,
  SunflowerArt,
  TulipArt,
  type ArtProps,
} from "./flowers";
import { EucalyptusArt, FernArt, OliveArt, PampasArt, RuscusArt } from "./greenery";

const ART: Record<ItemKind, ComponentType<ArtProps>> = {
  rose: RoseArt,
  tulip: TulipArt,
  sunflower: SunflowerArt,
  daisy: DaisyArt,
  peony: PeonyArt,
  lily: LilyArt,
  carnation: CarnationArt,
  hydrangea: HydrangeaArt,
  babysbreath: BabysBreathArt,
  lavender: LavenderArt,
  eucalyptus: EucalyptusArt,
  fern: FernArt,
  olive: OliveArt,
  ruscus: RuscusArt,
  pampas: PampasArt,
};

/** Unique, url()-safe id for SVG gradients. */
export function useSvgId() {
  return "f" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

interface GlyphProps {
  kind: ItemKind;
  variant: string;
  /** Adds an invisible grab area so thin sprigs are easy to pick up. */
  hit?: boolean;
}

/** The flower drawn as an SVG <g>, for use inside another SVG. */
export function ItemGlyph({ kind, variant, hit }: GlyphProps) {
  const uid = useSvgId();
  const def = getDef(kind);
  const Art = ART[kind];
  const [x, y, w, h] = def.box;
  const thin = def.focal < 0.3;
  return (
    <g style={hit ? { pointerEvents: "visiblePainted" } : undefined}>
      {hit && (
        <ellipse
          cx={x + w / 2}
          cy={y + h / 2 + (thin ? -h * 0.08 : 0)}
          rx={w * (thin ? 0.34 : 0.4)}
          ry={h * (thin ? 0.4 : 0.4)}
          fill="transparent"
        />
      )}
      <Art p={getVariant(kind, variant).palette} uid={uid} />
    </g>
  );
}

interface ArtSvgProps extends GlyphProps {
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/** A standalone flower illustration with a transparent background. */
export const ItemArt = memo(function ItemArt({ kind, variant, hit, className, style, title }: ArtSvgProps) {
  const def = getDef(kind);
  return (
    <svg
      viewBox={def.box.join(" ")}
      className={className}
      style={style}
      overflow="visible"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <ItemGlyph kind={kind} variant={variant} hit={hit} />
    </svg>
  );
});
