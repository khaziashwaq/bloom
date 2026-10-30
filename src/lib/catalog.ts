import type {
  BackgroundId,
  CardColorId,
  Decorations,
  FlowerKind,
  GreeneryKind,
  ItemKind,
  Palette,
  RibbonId,
  Variant,
  WrappingId,
} from "./types";

/** Logical canvas size. Every position is stored in these units. */
export const CANVAS_W = 1000;
export const CANVAS_H = 1200;
/** Where the stems gather and the ribbon is tied. */
export const BIND_POINT = { x: 500, y: 880 };
/** Centre of the flower dome. */
export const DOME = { x: 500, y: 455, rx: 285, ry: 235 };

export const MAX_ITEMS = 60;

export interface ItemDef {
  kind: ItemKind;
  category: "flower" | "greenery";
  name: string;
  single: string;
  meaning: string;
  /** Art viewBox: [minX, minY, width, height]. The item pivots around its centre. */
  box: [number, number, number, number];
  /** Display width on the canvas (canvas units) at scale 1. */
  size: number;
  /** Point in art units where the stem leaves the flower head. */
  stemAnchor: [number, number];
  stemColor: string;
  stemWidth: number;
  /** 0..1 — how much of a focal flower it is when auto-arranging. */
  focal: number;
  variants: Variant[];
}

const v = (id: string, name: string, palette: Palette): Variant => ({ id, name, palette });

const STEM = "#7fa36b";

export const FLOWERS: ItemDef[] = [
  {
    kind: "rose",
    category: "flower",
    name: "Roses",
    single: "Rose",
    meaning: "love, gratitude & admiration",
    box: [-100, -100, 200, 200],
    size: 185,
    stemAnchor: [0, 40],
    stemColor: STEM,
    stemWidth: 7,
    focal: 0.8,
    variants: [
      v("red", "Red", { light: "#f27c89", base: "#db4258", dark: "#b32740", deep: "#7e142b" }),
      v("pink", "Pink", { light: "#fdd9e3", base: "#f5aac0", dark: "#e3809c", deep: "#bb5473" }),
      v("white", "White", { light: "#ffffff", base: "#fcf6ef", dark: "#ebdfd2", deep: "#c9b6a3" }),
      v("yellow", "Yellow", { light: "#fff3bf", base: "#f9dd74", dark: "#ecbd43", deep: "#c79423" }),
      v("peach", "Peach", { light: "#ffe5d4", base: "#f9c4a3", dark: "#efa07a", deep: "#cd7a55" }),
    ],
  },
  {
    kind: "tulip",
    category: "flower",
    name: "Tulips",
    single: "Tulip",
    meaning: "perfect, cheerful love",
    box: [-62, -84, 124, 146],
    size: 130,
    stemAnchor: [0, 52],
    stemColor: "#86ab70",
    stemWidth: 8,
    focal: 0.55,
    variants: [
      v("pink", "Pink", { light: "#ffd8e3", base: "#f6a6bf", dark: "#e27b9d", deep: "#bd5577" }),
      v("purple", "Purple", { light: "#dfccf2", base: "#b994dd", dark: "#946ec1", deep: "#6d4999" }),
      v("white", "White", { light: "#ffffff", base: "#fbf7ef", dark: "#e9dfd0", deep: "#c6b7a2" }),
      v("yellow", "Yellow", { light: "#fff2b0", base: "#fbdc61", dark: "#edbd33", deep: "#c79419" }),
      v("red", "Red", { light: "#f9858b", base: "#e2454f", dark: "#bb2a3a", deep: "#851829" }),
    ],
  },
  {
    kind: "sunflower",
    category: "flower",
    name: "Sunflowers",
    single: "Sunflower",
    meaning: "warmth, loyalty & sunshine",
    box: [-100, -100, 200, 200],
    size: 216,
    stemAnchor: [0, 30],
    stemColor: "#7d9d5c",
    stemWidth: 10,
    focal: 0.9,
    variants: [
      v("golden", "Golden", { light: "#ffe57d", base: "#f8c531", dark: "#e09a16", deep: "#b4740c", center: "#6e4426", centerDark: "#3f2414" }),
      v("lemon", "Lemon", { light: "#fff6b0", base: "#fbe466", dark: "#ecc639", deep: "#c6a120", center: "#5c4a2a", centerDark: "#33270f" }),
      v("amber", "Amber", { light: "#ffc580", base: "#f39a3d", dark: "#d9731e", deep: "#a9520f", center: "#5a3420", centerDark: "#2e190e" }),
      v("velvet", "Velvet red", { light: "#de7062", base: "#b5413a", dark: "#8e2a2a", deep: "#641a1e", center: "#4a2a1a", centerDark: "#20110a" }),
      v("cream", "Cream", { light: "#fffbea", base: "#f6ebc2", dark: "#e3d095", deep: "#bca563", center: "#4e3a26", centerDark: "#2a1d10" }),
    ],
  },
  {
    kind: "daisy",
    category: "flower",
    name: "Daisies",
    single: "Daisy",
    meaning: "innocence & new beginnings",
    box: [-80, -80, 160, 160],
    size: 145,
    stemAnchor: [0, 14],
    stemColor: "#8ab176",
    stemWidth: 5,
    focal: 0.45,
    variants: [
      v("white", "White", { light: "#ffffff", base: "#fbf8f2", dark: "#e6ddd0", deep: "#c4b5a3", center: "#f6c73f", centerDark: "#d59a1d" }),
      v("blush", "Blush", { light: "#ffeaf0", base: "#f8c6d5", dark: "#e9a0b7", deep: "#c47790", center: "#f5c54a", centerDark: "#d2961f" }),
      v("butter", "Butter", { light: "#fff8cf", base: "#fae68e", dark: "#ecc952", deep: "#c79e30", center: "#e59b2a", centerDark: "#b86e14" }),
      v("lilac", "Lilac", { light: "#f2e9fb", base: "#d7c4f0", dark: "#b79ede", deep: "#8d70ba", center: "#f4d25a", centerDark: "#cfa22a" }),
      v("coral", "Coral", { light: "#ffdacc", base: "#f8a98e", dark: "#e98264", deep: "#c05d41", center: "#f3c24a", centerDark: "#c9861d" }),
    ],
  },
  {
    kind: "peony",
    category: "flower",
    name: "Peonies",
    single: "Peony",
    meaning: "happiness & good fortune",
    box: [-100, -100, 200, 200],
    size: 233,
    stemAnchor: [0, 40],
    stemColor: STEM,
    stemWidth: 8,
    focal: 1,
    variants: [
      v("blush", "Blush", { light: "#fff1f4", base: "#f9cdd8", dark: "#eda4b8", deep: "#cc7c95", accent: "#f3d27a" }),
      v("coral", "Coral", { light: "#ffd9cd", base: "#f8a794", dark: "#eb806e", deep: "#c55b4b", accent: "#f4d27a" }),
      v("white", "White", { light: "#ffffff", base: "#fcf6ee", dark: "#ede1d1", deep: "#cfbca7", accent: "#f0cd72" }),
      v("fuchsia", "Fuchsia", { light: "#f8b0cf", base: "#e2679c", dark: "#c5447c", deep: "#93285a", accent: "#f3d27a" }),
      v("burgundy", "Burgundy", { light: "#cc7387", base: "#9e3a55", dark: "#7a2440", deep: "#521428", accent: "#e9c46a" }),
    ],
  },
  {
    kind: "lily",
    category: "flower",
    name: "Lilies",
    single: "Lily",
    meaning: "devotion & a pure heart",
    box: [-104, -104, 208, 208],
    size: 233,
    stemAnchor: [0, 12],
    stemColor: "#79a064",
    stemWidth: 8,
    focal: 0.85,
    variants: [
      v("white", "White", { light: "#ffffff", base: "#fdf9f2", dark: "#ebe2d2", deep: "#c8b9a2", center: "#dce8b0", accent: "#a5532f" }),
      v("stargazer", "Stargazer", { light: "#fff3f7", base: "#f4a6c0", dark: "#de6d95", deep: "#ad3f6a", center: "#f6e7a8", accent: "#9a3f2a", spots: "#8e2c55" }),
      v("tiger", "Tiger orange", { light: "#ffc790", base: "#f7984a", dark: "#e47325", deep: "#ae4f0f", center: "#f9d27a", accent: "#5a2614", spots: "#5a2614" }),
      v("sunny", "Sunny yellow", { light: "#fff4bd", base: "#fbdd6b", dark: "#eebf3b", deep: "#c8991f", center: "#e8efa9", accent: "#9a4a1e" }),
      v("peach", "Peach", { light: "#ffeadd", base: "#fbc6a6", dark: "#f1a27c", deep: "#cd7d58", center: "#f5e3a4", accent: "#a8522e" }),
    ],
  },
  {
    kind: "carnation",
    category: "flower",
    name: "Carnations",
    single: "Carnation",
    meaning: "fascination & deep affection",
    box: [-70, -72, 140, 144],
    size: 147,
    stemAnchor: [0, 64],
    stemColor: "#8aab8e",
    stemWidth: 6,
    focal: 0.6,
    variants: [
      v("red", "Red", { light: "#f4848c", base: "#dd4655", dark: "#b42b3f", deep: "#80162b" }),
      v("pink", "Pink", { light: "#ffd8e2", base: "#f6abc1", dark: "#e586a3", deep: "#bf5d7c" }),
      v("white", "White", { light: "#ffffff", base: "#fbf7f0", dark: "#e9dfd1", deep: "#c8b8a3" }),
      v("apricot", "Apricot", { light: "#ffe2ca", base: "#fbc097", dark: "#ef9e6c", deep: "#ca7846" }),
      v("lilac", "Lilac", { light: "#f0e4fa", base: "#d3b8ee", dark: "#b393dc", deep: "#8868b6" }),
    ],
  },
  {
    kind: "hydrangea",
    category: "flower",
    name: "Hydrangeas",
    single: "Hydrangea",
    meaning: "heartfelt gratitude",
    box: [-100, -100, 200, 200],
    size: 240,
    stemAnchor: [0, 40],
    stemColor: "#7f9f68",
    stemWidth: 9,
    focal: 0.95,
    variants: [
      v("blue", "Sky blue", { light: "#dbe7fb", base: "#a9c2ee", dark: "#7f9edb", deep: "#5c78b8" }),
      v("lavender", "Lavender", { light: "#efe6fb", base: "#cdb7ee", dark: "#aa8ddc", deep: "#8065b8" }),
      v("pink", "Pink", { light: "#ffe4ee", base: "#f6bcd0", dark: "#e796b3", deep: "#c26e8e" }),
      v("white", "White", { light: "#ffffff", base: "#f5f5ea", dark: "#dfe5cf", deep: "#b5c29f" }),
      v("green", "Antique green", { light: "#edf4da", base: "#cadda9", dark: "#a8c384", deep: "#7e9b5e" }),
    ],
  },
  {
    kind: "babysbreath",
    category: "flower",
    name: "Baby's Breath",
    single: "Baby's breath",
    meaning: "everlasting love",
    box: [-96, -100, 192, 196],
    size: 207,
    stemAnchor: [0, 92],
    stemColor: "#9db58a",
    stemWidth: 4,
    focal: 0.1,
    variants: [
      v("white", "White", { light: "#ffffff", base: "#faf7f1", dark: "#e3dccf", deep: "#9db58a" }),
      v("blush", "Blush", { light: "#fff1f5", base: "#f8d0dc", dark: "#e9abbf", deep: "#9db58a" }),
      v("lavender", "Lavender", { light: "#f5effd", base: "#ddcff3", dark: "#bfaae5", deep: "#9db58a" }),
      v("sky", "Sky", { light: "#f0f6ff", base: "#cfe0f6", dark: "#a8c2e7", deep: "#9db58a" }),
      v("butter", "Butter", { light: "#fffbe6", base: "#fbeeb6", dark: "#ead486", deep: "#9db58a" }),
    ],
  },
  {
    kind: "lavender",
    category: "flower",
    name: "Lavender",
    single: "Lavender",
    meaning: "calm & quiet devotion",
    box: [-50, -100, 100, 200],
    size: 119,
    stemAnchor: [0, 96],
    stemColor: "#8da08a",
    stemWidth: 4,
    focal: 0.2,
    variants: [
      v("classic", "Classic", { light: "#bca9e1", base: "#9a84cb", dark: "#7a63af", deep: "#5a468a" }),
      v("violet", "Deep violet", { light: "#a990d8", base: "#7f62b8", dark: "#634599", deep: "#452d70" }),
      v("lilac", "Lilac", { light: "#e0d3f3", base: "#c6b3e7", dark: "#a892d6", deep: "#8570b5" }),
      v("white", "White", { light: "#ffffff", base: "#f0ebf6", dark: "#d9d0e6", deep: "#b2a6c6" }),
      v("pink", "Pink", { light: "#f7d1e2", base: "#e6a6c6", dark: "#cf82a8", deep: "#a85d84" }),
    ],
  },
];

export const GREENERY: ItemDef[] = [
  {
    kind: "eucalyptus",
    category: "greenery",
    name: "Eucalyptus",
    single: "Eucalyptus",
    meaning: "protection & abundance",
    box: [-62, -100, 124, 200],
    size: 165,
    stemAnchor: [0, 96],
    stemColor: "#7f9c8d",
    stemWidth: 4,
    focal: 0,
    variants: [
      v("silver", "Silver dollar", { light: "#d3e3da", base: "#a5bfb1", dark: "#7f9c8d", deep: "#5f7b6d" }),
      v("fresh", "Fresh green", { light: "#cde2c4", base: "#9fc191", dark: "#79a06c", deep: "#577d4d" }),
    ],
  },
  {
    kind: "fern",
    category: "greenery",
    name: "Fern",
    single: "Fern frond",
    meaning: "sincerity",
    box: [-70, -100, 140, 200],
    size: 185,
    stemAnchor: [0, 96],
    stemColor: "#5f8a4a",
    stemWidth: 4,
    focal: 0,
    variants: [
      v("green", "Leather fern", { light: "#bcd79e", base: "#86af66", dark: "#638c4a", deep: "#456a33" }),
      v("soft", "Soft green", { light: "#d6e6c4", base: "#aac795", dark: "#86a874", deep: "#628553" }),
    ],
  },
  {
    kind: "olive",
    category: "greenery",
    name: "Olive branch",
    single: "Olive branch",
    meaning: "peace",
    box: [-62, -100, 124, 200],
    size: 165,
    stemAnchor: [0, 96],
    stemColor: "#7c7a5c",
    stemWidth: 4,
    focal: 0,
    variants: [
      v("silver", "Silver olive", { light: "#d3dabd", base: "#a3b08a", dark: "#7c8c64", deep: "#5a6948", accent: "#4e5a2e" }),
    ],
  },
  {
    kind: "ruscus",
    category: "greenery",
    name: "Ruscus",
    single: "Ruscus",
    meaning: "steadfast friendship",
    box: [-56, -100, 112, 200],
    size: 145,
    stemAnchor: [0, 96],
    stemColor: "#4f7a45",
    stemWidth: 4,
    focal: 0,
    variants: [
      v("green", "Italian ruscus", { light: "#acd09e", base: "#74a066", dark: "#55804a", deep: "#3b6034" }),
    ],
  },
  {
    kind: "pampas",
    category: "greenery",
    name: "Pampas",
    single: "Pampas plume",
    meaning: "softness & ease",
    box: [-62, -100, 124, 200],
    size: 176,
    stemAnchor: [0, 96],
    stemColor: "#b9a57f",
    stemWidth: 4,
    focal: 0,
    variants: [
      v("natural", "Natural", { light: "#fcf5e6", base: "#ebdcc2", dark: "#d6c09b", deep: "#b79d73" }),
      v("blush", "Blush", { light: "#fcefec", base: "#eed4cd", dark: "#dab3a8", deep: "#b98c80" }),
    ],
  },
];

export const ALL_ITEMS: ItemDef[] = [...FLOWERS, ...GREENERY];

const DEF_MAP = new Map<ItemKind, ItemDef>(ALL_ITEMS.map((d) => [d.kind, d]));

export function getDef(kind: ItemKind): ItemDef {
  const def = DEF_MAP.get(kind);
  if (!def) throw new Error(`Unknown item kind: ${kind}`);
  return def;
}

export function isItemKind(kind: unknown): kind is ItemKind {
  return typeof kind === "string" && DEF_MAP.has(kind as ItemKind);
}

export function getVariant(kind: ItemKind, variantId: string): Variant {
  const def = getDef(kind);
  return def.variants.find((x) => x.id === variantId) ?? def.variants[0];
}

export function isFlower(kind: ItemKind): kind is FlowerKind {
  return getDef(kind).category === "flower";
}

export function isGreenery(kind: ItemKind): kind is GreeneryKind {
  return getDef(kind).category === "greenery";
}

/** Size of an item's box on the canvas at scale 1. */
export function itemBoxSize(kind: ItemKind) {
  const def = getDef(kind);
  const [, , w, h] = def.box;
  return { w: def.size, h: (def.size * h) / w };
}

/* ---------------- Wrapping, ribbons, backgrounds ---------------- */

export interface WrappingDef {
  id: WrappingId;
  name: string;
  base: string;
  shade: string;
  edge: string;
  line: string;
  pattern?: "floral" | "newspaper";
}

export const WRAPPINGS: WrappingDef[] = [
  { id: "cream", name: "Cream", base: "#fbf1e2", shade: "#e9d7bd", edge: "#fffcf6", line: "#d3bd9f" },
  { id: "blush", name: "Blush pink", base: "#f7d7e0", shade: "#e7b5c5", edge: "#fdf0f4", line: "#d298ad" },
  { id: "lavender", name: "Lavender", base: "#e5dcf4", shade: "#cbbce7", edge: "#f5f0fc", line: "#b09fd4" },
  { id: "floral", name: "Floral print", base: "#fff6ee", shade: "#ecdac7", edge: "#fffdf9", line: "#d7c1a8", pattern: "floral" },
  { id: "newspaper", name: "Vintage newspaper", base: "#efe6d2", shade: "#d9cbae", edge: "#f8f3e8", line: "#b3a383", pattern: "newspaper" },
  { id: "sage", name: "Sage green", base: "#cddac4", shade: "#adc1a2", edge: "#e6eee1", line: "#8fa685" },
  { id: "none", name: "Hand-tied", base: "transparent", shade: "transparent", edge: "transparent", line: "transparent" },
];

export interface RibbonDef {
  id: RibbonId;
  name: string;
  light: string;
  base: string;
  dark: string;
  deep: string;
}

export const RIBBONS: RibbonDef[] = [
  { id: "satin-pink", name: "Satin pink", light: "#fcd6e1", base: "#f3a9bf", dark: "#da7f9c", deep: "#b65b7a" },
  { id: "red", name: "Red", light: "#f0717e", base: "#d9384b", dark: "#af2236", deep: "#7e1225" },
  { id: "white", name: "White", light: "#ffffff", base: "#faf6f0", dark: "#e1d7cb", deep: "#bfb0a0" },
  { id: "lavender", name: "Lavender", light: "#e0d5f3", base: "#c2aee3", dark: "#9f88cb", deep: "#7d66a8" },
  { id: "gold", name: "Gold", light: "#f9e6aa", base: "#e3bc5e", dark: "#c29433", deep: "#94701e" },
  { id: "none", name: "No ribbon", light: "transparent", base: "transparent", dark: "transparent", deep: "transparent" },
];

export interface BackgroundDef {
  id: BackgroundId;
  name: string;
  color: string;
  accent: string;
}

export const BACKGROUNDS: BackgroundDef[] = [
  { id: "cream", name: "Cream", color: "#fff9f2", accent: "#f6ead9" },
  { id: "blush", name: "Blush", color: "#f9e3ea", accent: "#f2cbd8" },
  { id: "lavender", name: "Lavender", color: "#ede6f7", accent: "#dcd0ef" },
  { id: "sage", name: "Sage", color: "#e1eadb", accent: "#c9d7c0" },
  { id: "butter", name: "Butter", color: "#fbf3cf", accent: "#f7e8a6" },
  { id: "gingham", name: "Gingham", color: "#fff9f2", accent: "#f4cfda" },
];

export interface CardColorDef {
  id: CardColorId;
  name: string;
  paper: string;
  line: string;
  accent: string;
}

export const CARD_COLORS: CardColorDef[] = [
  { id: "cream", name: "Cream", paper: "#fffbf4", line: "#eedfcb", accent: "#e9a9bd" },
  { id: "blush", name: "Blush", paper: "#fdebf0", line: "#f1cbd6", accent: "#c9718c" },
  { id: "lavender", name: "Lavender", paper: "#f3eefb", line: "#ddd2ef", accent: "#9b86c8" },
  { id: "sage", name: "Sage", paper: "#edf3e9", line: "#d3e0cb", accent: "#7f9c74" },
];

export const SUGGESTED_MESSAGES = [
  "Just because you're special.",
  "Sending you a little sunshine.",
  "You make the world prettier.",
  "A little something to brighten your day.",
  "Wish I could give you these in person.",
];

export const LABEL_SUGGESTIONS = ["with love", "just because", "for you", "xoxo", "thinking of you", "you're my sunshine"];

export const DEFAULT_DECORATIONS: Decorations = {
  hearts: false,
  sparkles: false,
  tag: false,
  tagText: "for you",
  label: false,
  labelText: "with love",
};

export const LIMITS = {
  to: 40,
  from: 40,
  message: 320,
  tag: 18,
  label: 22,
};

export function wrappingDef(id: WrappingId) {
  return WRAPPINGS.find((w) => w.id === id) ?? WRAPPINGS[0];
}
export function ribbonDef(id: RibbonId) {
  return RIBBONS.find((r) => r.id === id) ?? RIBBONS[0];
}
export function backgroundDef(id: BackgroundId) {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}
export function cardColorDef(id: CardColorId) {
  return CARD_COLORS.find((c) => c.id === id) ?? CARD_COLORS[0];
}
