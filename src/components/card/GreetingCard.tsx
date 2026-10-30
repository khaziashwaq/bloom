"use client";

import { ItemArt } from "@/components/art/ItemArt";
import { LIMITS, cardColorDef } from "@/lib/catalog";
import type { BouquetNote } from "@/lib/types";

const LINE = 40;

/**
 * A little handwritten card. In `editable` mode the card *is* the form:
 * you write straight onto the paper.
 */
export function GreetingCard({
  note,
  editable = false,
  onChange,
  className = "",
  revealDelay,
}: {
  note: BouquetNote;
  editable?: boolean;
  onChange?: (patch: Partial<BouquetNote>) => void;
  className?: string;
  /** Receive page: fade the message in line by line after this many ms. */
  revealDelay?: number;
}) {
  const c = cardColorDef(note.card);
  const lines = `repeating-linear-gradient(to bottom, transparent 0, transparent ${LINE - 1.5}px, ${c.line} ${LINE - 1.5}px, ${c.line} ${LINE}px)`;
  const field =
    "w-full bg-transparent font-hand text-[26px] leading-none text-cocoa placeholder:text-cocoa/30 focus:outline-none sm:text-[28px]";

  return (
    <div
      className={`relative overflow-hidden rounded-[1.6rem] p-6 shadow-float ring-1 ring-cocoa/8 sm:p-8 ${className}`}
      style={{ background: c.paper }}
    >
      {/* deckled inner border + corner posies */}
      <div className="pointer-events-none absolute inset-2.5 rounded-[1.2rem] border-2 border-dashed" style={{ borderColor: c.line }} />
      <div className="pointer-events-none absolute -right-3 -top-3 flex rotate-12">
        <ItemArt kind="rose" variant="pink" className="h-14 w-14" />
        <ItemArt kind="babysbreath" variant="white" className="-ml-7 mt-2 h-12 w-12" />
      </div>
      <div className="pointer-events-none absolute -bottom-4 -left-3 -rotate-12">
        <ItemArt kind="eucalyptus" variant="silver" className="h-16 w-12" />
      </div>

      <div className="relative">
        <label className="flex items-baseline gap-2">
          <span className="font-hand text-2xl text-cocoa-soft">Dear</span>
          {editable ? (
            <input
              value={note.to}
              maxLength={LIMITS.to}
              onChange={(e) => onChange?.({ to: e.target.value })}
              placeholder="their name"
              aria-label="Recipient's name"
              className={`${field} border-b-2 border-dashed pb-1`}
              style={{ borderColor: c.line }}
            />
          ) : (
            <span className="font-hand text-[30px] leading-none text-cocoa">{note.to || "you"},</span>
          )}
          {editable && <span className="font-hand text-2xl text-cocoa-soft">,</span>}
        </label>

        <div className="relative mt-4" style={{ backgroundImage: lines, backgroundAttachment: "local" }}>
          {editable ? (
            <>
              <textarea
                value={note.message}
                maxLength={LIMITS.message}
                onChange={(e) => onChange?.({ message: e.target.value })}
                placeholder="Write a few words from the heart…"
                aria-label="Personal message"
                rows={5}
                className="block w-full resize-none bg-transparent font-hand text-[25px] text-cocoa placeholder:text-cocoa/30 focus:outline-none sm:text-[27px]"
                style={{ lineHeight: `${LINE}px`, minHeight: LINE * 5 }}
              />
              <span className="absolute -bottom-5 right-0 text-[11px] font-bold tabular-nums text-cocoa-soft/70">
                {note.message.length}/{LIMITS.message}
              </span>
            </>
          ) : (
            <p className="whitespace-pre-wrap break-words font-hand text-[25px] text-cocoa sm:text-[27px]" style={{ lineHeight: `${LINE}px`, minHeight: LINE * 3 }}>
              {revealDelay !== undefined
                ? note.message.split(/(\s+)/).map((w, i) => (
                    <span key={i} className="animate-[fade-in_0.5s_ease_both]" style={{ animationDelay: `${revealDelay + i * 45}ms` }}>
                      {w}
                    </span>
                  ))
                : note.message}
            </p>
          )}
        </div>

        <label className="mt-7 flex items-baseline justify-end gap-2">
          <span className="font-hand text-2xl text-cocoa-soft">with love,</span>
          {editable ? (
            <input
              value={note.from}
              maxLength={LIMITS.from}
              onChange={(e) => onChange?.({ from: e.target.value })}
              placeholder="your name"
              aria-label="Your name"
              className={`${field} max-w-[11rem] border-b-2 border-dashed pb-1`}
              style={{ borderColor: c.line }}
            />
          ) : (
            <span
              className={`font-hand text-[30px] leading-none ${revealDelay !== undefined ? "animate-[fade-in_0.6s_ease_both]" : ""}`}
              style={{ color: c.accent, animationDelay: revealDelay !== undefined ? `${revealDelay + note.message.split(/\s+/).length * 90 + 200}ms` : undefined }}
            >
              {note.from || "someone who loves you"}
            </span>
          )}
        </label>
      </div>
    </div>
  );
}
