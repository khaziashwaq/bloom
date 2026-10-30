export type FlowerKind =
  | "rose"
  | "tulip"
  | "sunflower"
  | "daisy"
  | "peony"
  | "lily"
  | "carnation"
  | "hydrangea"
  | "babysbreath"
  | "lavender";

export type GreeneryKind = "eucalyptus" | "fern" | "olive" | "ruscus" | "pampas";

export type ItemKind = FlowerKind | GreeneryKind;

export type WrappingId =
  | "cream"
  | "blush"
  | "lavender"
  | "floral"
  | "newspaper"
  | "sage"
  | "none";

export type RibbonId = "satin-pink" | "red" | "white" | "lavender" | "gold" | "none";

export type BackgroundId = "cream" | "blush" | "lavender" | "sage" | "butter" | "gingham";

export type CardColorId = "cream" | "blush" | "lavender" | "sage";

/** One flower (or sprig of greenery) placed on the bouquet canvas. */
export interface CanvasItem {
  id: string;
  kind: ItemKind;
  variant: string;
  /** Centre position in canvas units (canvas is 1000 x 1200). */
  x: number;
  y: number;
  /** Degrees, clockwise. */
  rotation: number;
  scale: number;
  flip: boolean;
}

export interface Decorations {
  hearts: boolean;
  sparkles: boolean;
  tag: boolean;
  tagText: string;
  label: boolean;
  labelText: string;
}

/** Everything that shapes how the bouquet looks. Layer order = order of `items`. */
export interface BouquetDesign {
  items: CanvasItem[];
  wrapping: WrappingId;
  ribbon: RibbonId;
  background: BackgroundId;
  decorations: Decorations;
}

export interface BouquetNote {
  to: string;
  message: string;
  from: string;
  card: CardColorId;
}

/** The full serialisable gift: what gets saved and shared. */
export interface Bouquet {
  id: string;
  version: 1;
  createdAt: string;
  design: BouquetDesign;
  note: BouquetNote;
}

export interface Palette {
  light: string;
  base: string;
  dark: string;
  deep: string;
  /** Centre / disc colours where relevant. */
  center?: string;
  centerDark?: string;
  /** Anthers, stamens, berries, etc. */
  accent?: string;
  /** Bold speckles (e.g. stargazer lilies). */
  spots?: string;
}

export interface Variant {
  id: string;
  name: string;
  palette: Palette;
}
