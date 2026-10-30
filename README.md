# Bloom — a little digital flower shop

Pick flowers, arrange them into a bouquet, wrap it, write a note, and send it to someone as a link. They open it like a gift: the box opens, the flowers bloom, and the note appears.

Nothing is bought or shipped; it's all digital.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production: `npm run build && npm start`.

## The flow

| Route      | Screen                                                                |
| ---------- | --------------------------------------------------------------------- |
| `/`        | Welcome — the illustrated shop front                                  |
| `/shop`    | Flower collection — 10 flowers × 5 colours, plus greenery             |
| `/studio`  | Bouquet studio — the interactive canvas                               |
| `/wrap`    | Wrapping paper, ribbon and decorations                                |
| `/note`    | The greeting card                                                     |
| `/send`    | Final preview and the shareable link                                  |
| `/b/[id]`  | What the recipient sees                                               |

The bouquet being made is saved as a draft in `localStorage`, so a refresh doesn't lose work. That draft is only for the sender. It is not how bouquets are shared.

## Sharing and storage

Every bouquet serialises to a `Bouquet` object (`src/lib/types.ts`): flowers, variants, positions, rotation, scale, layer order, wrapping, ribbon, decorations and the note, plus a unique id. Storage lives behind one module, `src/lib/storage/index.ts`, which has two adapters:

- **Self-contained link (default, no setup).** The bouquet is compressed into the URL fragment: `/b/<id>#<data>`. The link itself carries the gift, so it opens on any device, and the fragment is never sent to a server. Links are typically 500–900 characters.
- **Supabase (optional).** Run `supabase/schema.sql` in your Supabase project, then set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`). Bouquets are saved to a table, and links become short: `/b/<id>`. Anyone can create a bouquet, but rows can't be listed; one can only be read by id, through the `get_bouquet` function. If Supabase can't be reached when sending, the app falls back to a self-contained link and says so.

Data from links or the database is untrusted, so it is validated and clamped in `sanitizeBouquet` (`src/lib/codec.ts`) before rendering.

To add another backend, implement save/load the way `src/lib/storage/supabase.ts` does and select it in `storage/index.ts`.

## How the studio works

The editor (`src/components/studio/BouquetEditor.tsx`) is built from layered HTML and SVG, not a canvas library:

- The canvas has a fixed logical size of 1000 × 1200. Positions are stored in those units, so a bouquet looks identical at any screen size.
- Each flower is its own SVG illustration, so it stays crisp at any zoom and is hit-tested on its painted shape. Clicking an empty corner of one flower doesn't grab it.
- Stems are drawn live, curving from each flower down to the point where the ribbon ties.
- Gestures:
  - drag to move
  - rotate and resize handles
  - two-finger pinch to rotate and scale
  - mouse wheel to resize (Shift + wheel rotates)
  - keyboard: arrows nudge, `[`/`]` change layer, `R` rotates, `F` flips, `Delete` removes, `Ctrl/Cmd+D` duplicates, `Ctrl/Cmd+Z` undoes
- Each gesture becomes one undo step (`src/lib/store.ts`).
- On phones, the tray scrolls sideways. Drag a flower upward out of the tray to place it. Selecting a flower swaps the tray for size and tilt sliders.
- "Arrange for me" (`src/lib/arrange.ts`) composes a dome: focal blooms in the centre, fillers at the edge, greenery behind.

## Art and sound

- All flowers, greenery, wrapping paper, ribbons and the shop scene are hand-built SVG components in `src/components/art` and `src/components/bouquet`. Colour variants are palettes in `src/lib/catalog.ts`.
- Sound effects and the optional music-box loop are synthesised with the Web Audio API (`src/lib/sound.ts`). There are no audio files. Music is off by default, and both sound effects and music have toggles.
- Animations respect `prefers-reduced-motion`.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Zustand, lz-string, lucide-react icons.
