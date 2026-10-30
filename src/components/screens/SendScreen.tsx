"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ExternalLink, Flower2, Link2, MessageCircle, PenLine, RefreshCw, Scroll, Send, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { BouquetStage } from "@/components/bouquet/BouquetStage";
import { GreetingCard } from "@/components/card/GreetingCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PetalBurst, PetalField } from "@/components/ui/Petals";
import { TopBar } from "@/components/ui/TopBar";
import { ribbonDef, wrappingDef } from "@/lib/catalog";
import { sanitizeBouquet } from "@/lib/codec";
import { newId } from "@/lib/ids";
import { sound } from "@/lib/sound";
import { saveBouquet } from "@/lib/storage";
import { toast, useBouquet } from "@/lib/store";

export function SendScreen() {
  const router = useRouter();
  const design = useBouquet((s) => s.design);
  const note = useBouquet((s) => s.note);
  const hydrated = useBouquet((s) => s.hydrated);
  const lastShare = useBouquet((s) => s.lastShare);
  const setLastShare = useBouquet((s) => s.setLastShare);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);

  const fingerprint = useMemo(() => JSON.stringify({ design, note }), [design, note]);
  const result = lastShare && lastShare.key === fingerprint ? lastShare : null;
  const flowers = design.items.length;
  const noteReady = note.to.trim() && note.from.trim() && note.message.trim();

  const send = async () => {
    if (sending) return;
    setSending(true);
    sound.play("ribbon");
    const bouquet = sanitizeBouquet({
      id: newId(10),
      version: 1,
      createdAt: new Date().toISOString(),
      design,
      note: { ...note, to: note.to.trim(), from: note.from.trim(), message: note.message.trim() },
    });
    if (!bouquet) {
      setSending(false);
      toast("Something went wrong wrapping that up — please try again.");
      return;
    }
    const [res] = await Promise.all([saveBouquet(bouquet, window.location.origin), new Promise((r) => setTimeout(r, 1300))]);
    setLastShare({ key: fingerprint, id: res.id, url: res.url, mode: res.mode });
    setSending(false);
    sound.play("chime");
    if (res.fellBack) toast("Couldn't reach the flower cloud, so the bouquet is packed into the link itself.");
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.url);
    } catch {
      linkRef.current?.select();
      document.execCommand("copy");
    }
    sound.play("pick");
    setCopied(true);
    toast("Link copied — paste it anywhere!");
    setTimeout(() => setCopied(false), 2200);
  };

  const shareText = `${note.to ? `${note.to}, ` : ""}I made you a little bouquet. Open it here:`;
  const whatsapp = result ? `https://wa.me/?text=${encodeURIComponent(`${shareText} ${result.url}`)}` : "#";
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const startOver = () => {
    useBouquet.getState().startOver();
    sound.play("whoosh");
    router.push("/shop");
  };

  if (hydrated && (!flowers || !noteReady)) {
    return (
      <main className="relative min-h-dvh">
        <TopBar step={4} backHref="/note" />
        <div className="mx-auto mt-16 max-w-md px-6 text-center">
          <h1 className="font-serif text-4xl font-medium text-cocoa">Almost there</h1>
          <p className="mt-3 text-cocoa-soft">
            {!flowers ? "Your bouquet doesn't have any flowers yet." : "Your note still needs a name, a message and who it's from."}
          </p>
          <ButtonLink href={!flowers ? "/studio" : "/note"} variant="rose" className="mt-6">
            {!flowers ? "Go to the studio" : "Finish the note"}
          </ButtonLink>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-x-hidden pb-16">
      <PetalField count={12} className="fixed" />
      <TopBar step={4} backHref="/note" backLabel="Back to the note" />

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:mt-4 sm:px-6">
        <div className="text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-rosewood">Step 5 · Send</p>
          <h1 className="mt-1 font-serif text-4xl font-medium tracking-tight text-cocoa sm:text-5xl">
            {result ? "Your bouquet is ready to go" : "Ready to send?"}
          </h1>
          {hydrated && (
            <p className="mt-2 text-cocoa-soft">
              For <span className="font-hand text-2xl text-cocoa">{note.to}</span> · from <span className="font-hand text-2xl text-cocoa">{note.from}</span>
            </p>
          )}
        </div>

        <div className="relative mx-auto mt-6 grid max-w-5xl items-center gap-6 lg:grid-cols-2">
          <motion.div
            className="relative mx-auto w-full max-w-[25rem]"
            animate={sending ? { scale: [1, 0.94, 1.02], y: [0, 8, -14], rotate: [0, -2, 1] } : { scale: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            {hydrated && <BouquetStage design={design} className="animate-gentle-sway rounded-[2rem] shadow-float ring-1 ring-cocoa/8" />}
            {result && <PetalBurst key={result.id} count={30} originY={40} />}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 24, rotate: 6 }}
            animate={{ opacity: 1, x: 0, rotate: 2.5 }}
            transition={{ type: "spring", stiffness: 110, damping: 16, delay: 0.15 }}
            className="mx-auto w-full max-w-[28rem] lg:-ml-10"
          >
            {hydrated && <GreetingCard note={note} />}
          </motion.div>
        </div>

        {hydrated && (
          <p className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm text-cocoa-soft">
            <span>
              {flowers} {flowers === 1 ? "stem" : "stems"}
            </span>
            <span aria-hidden>·</span>
            <span>{wrappingDef(design.wrapping).name} wrapping</span>
            <span aria-hidden>·</span>
            <span>{ribbonDef(design.ribbon).name.toLowerCase()} ribbon</span>
          </p>
        )}

        <div className="mx-auto mt-6 max-w-xl">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="send" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center gap-4">
                <Button variant="rose" size="lg" onClick={send} disabled={sending || !hydrated} silent className="min-w-[17rem]">
                  {sending ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Wrapping it up…
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Send this little bouquet
                    </>
                  )}
                </Button>
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  <Link href="/studio" className="flex items-center gap-1 rounded-full px-3 py-1.5 font-bold text-cocoa-soft hover:bg-cocoa/5 hover:text-cocoa">
                    <Flower2 size={14} /> Edit flowers
                  </Link>
                  <Link href="/wrap" className="flex items-center gap-1 rounded-full px-3 py-1.5 font-bold text-cocoa-soft hover:bg-cocoa/5 hover:text-cocoa">
                    <Scroll size={14} /> Edit wrapping
                  </Link>
                  <Link href="/note" className="flex items-center gap-1 rounded-full px-3 py-1.5 font-bold text-cocoa-soft hover:bg-cocoa/5 hover:text-cocoa">
                    <PenLine size={14} /> Edit note
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.section
                key="share"
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="rounded-[2rem] bg-paper p-5 shadow-float ring-1 ring-cocoa/8 sm:p-6"
                aria-label="Share your bouquet"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-cocoa">
                    <Check size={18} strokeWidth={3} />
                  </span>
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-cocoa">Wrapped & ready</h2>
                    <p className="text-xs text-cocoa-soft">
                      {result.mode === "supabase"
                        ? "Saved to the flower cloud. Anyone with this link can open it."
                        : "The whole bouquet lives inside this link — no account needed. Anyone with it can open it."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-cream p-1.5 pl-3 ring-1 ring-cocoa/10">
                  <Link2 size={16} className="shrink-0 text-cocoa-soft" />
                  <input
                    ref={linkRef}
                    readOnly
                    value={result.url}
                    aria-label="Shareable link"
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 truncate bg-transparent text-sm font-semibold text-cocoa focus:outline-none"
                  />
                  <Button size="sm" variant="primary" onClick={copy} silent>
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.play("tap")}
                    className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#25d366] px-4 text-sm font-extrabold text-white shadow-[0_3px_0_0_#1a9e4b] transition hover:-translate-y-0.5 active:translate-y-0.5"
                  >
                    <MessageCircle size={17} /> WhatsApp
                  </a>
                  {canNativeShare && (
                    <Button
                      variant="secondary"
                      onClick={() => navigator.share({ title: "A little bouquet for you", text: shareText, url: result.url }).catch(() => {})}
                    >
                      <Share2 size={16} /> Share…
                    </Button>
                  )}
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.play("tap")}
                    className={`flex h-11 items-center justify-center gap-2 rounded-full bg-paper px-4 text-sm font-extrabold text-cocoa ring-1 ring-cocoa/15 transition hover:bg-white ${canNativeShare ? "col-span-2 sm:col-span-1" : ""}`}
                  >
                    <ExternalLink size={16} /> Preview as them
                  </a>
                </div>

                <div className="mt-5 flex flex-col items-center justify-between gap-2 border-t border-dashed border-cocoa/15 pt-4 sm:flex-row">
                  <p className="text-xs text-cocoa-soft">Changed your mind? Edits make a fresh link.</p>
                  <Button variant="ghost" size="sm" onClick={startOver}>
                    <Flower2 size={15} /> Make another bouquet
                  </Button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
