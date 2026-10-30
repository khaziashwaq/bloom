import type { BasketEntry } from "./store";
import type { ItemKind, RibbonId, WrappingId } from "./types";

export interface Preset {
  name: string;
  wrapping: WrappingId;
  ribbon: RibbonId;
  stems: [ItemKind, string, number][];
}

/** Curated mixes for the "Surprise me" button. */
export const PRESETS: Preset[] = [
  {
    name: "Blush garden",
    wrapping: "cream",
    ribbon: "satin-pink",
    stems: [
      ["peony", "blush", 2],
      ["rose", "pink", 3],
      ["carnation", "pink", 2],
      ["babysbreath", "white", 2],
      ["eucalyptus", "silver", 2],
    ],
  },
  {
    name: "Sunny day",
    wrapping: "newspaper",
    ribbon: "gold",
    stems: [
      ["sunflower", "golden", 3],
      ["daisy", "white", 3],
      ["tulip", "yellow", 2],
      ["babysbreath", "white", 1],
      ["ruscus", "green", 2],
    ],
  },
  {
    name: "Lavender dreams",
    wrapping: "lavender",
    ribbon: "white",
    stems: [
      ["hydrangea", "lavender", 1],
      ["lavender", "classic", 3],
      ["rose", "white", 2],
      ["tulip", "purple", 2],
      ["babysbreath", "lavender", 1],
      ["eucalyptus", "silver", 2],
    ],
  },
  {
    name: "Classic romance",
    wrapping: "blush",
    ribbon: "red",
    stems: [
      ["rose", "red", 5],
      ["rose", "white", 2],
      ["babysbreath", "white", 2],
      ["fern", "green", 2],
      ["eucalyptus", "silver", 1],
    ],
  },
  {
    name: "Peach sorbet",
    wrapping: "floral",
    ribbon: "satin-pink",
    stems: [
      ["rose", "peach", 3],
      ["peony", "coral", 1],
      ["carnation", "apricot", 2],
      ["daisy", "coral", 2],
      ["pampas", "natural", 2],
      ["olive", "silver", 1],
    ],
  },
  {
    name: "Wildflower meadow",
    wrapping: "sage",
    ribbon: "lavender",
    stems: [
      ["daisy", "white", 3],
      ["daisy", "lilac", 1],
      ["lavender", "classic", 2],
      ["tulip", "pink", 1],
      ["carnation", "lilac", 1],
      ["babysbreath", "white", 1],
      ["fern", "soft", 1],
      ["olive", "silver", 1],
    ],
  },
];

export function presetBasket(p: Preset): BasketEntry[] {
  return p.stems.map(([kind, variant, count]) => ({ kind, variant, count }));
}
