"use client";

import { motion } from "framer-motion";

/** A pastel gift box. `open` sends the lid flying and lets the box sink away. */
export function GiftBox({ open, onOpen, toName }: { open: boolean; onOpen?: () => void; toName?: string }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={open || !onOpen}
      aria-label="Open your gift"
      className="group relative mx-auto block w-[min(72vw,18rem)] cursor-pointer select-none focus-visible:outline-none disabled:cursor-default"
    >
      <motion.div
        animate={open ? { rotate: [0, -4, 4, -3, 2, 0] } : { y: [0, -10, 0] }}
        transition={open ? { duration: 0.5 } : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* lid */}
        <motion.svg
          viewBox="0 0 300 130"
          className="relative z-10 block w-full"
          animate={open ? { y: -260, x: -70, rotate: -28, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
          transition={open ? { delay: 0.45, duration: 0.9, ease: [0.3, 0, 0.2, 1] } : { duration: 0.3 }}
          style={{ originX: 0.5, originY: 1 }}
        >
          <g className="origin-[150px_60px] transition-transform duration-300 group-hover:scale-105">
            <path d="M150,62 C118,20 70,14 66,40 C62,64 112,70 150,62Z" fill="#c9b6e8" stroke="#9f88cb" strokeWidth="2.5" />
            <path d="M150,62 C124,40 92,36 88,46 C86,56 118,62 150,62Z" fill="#9f88cb" opacity="0.45" />
            <path d="M150,62 C182,20 230,14 234,40 C238,64 188,70 150,62Z" fill="#c9b6e8" stroke="#9f88cb" strokeWidth="2.5" />
            <path d="M150,62 C176,40 208,36 212,46 C214,56 182,62 150,62Z" fill="#9f88cb" opacity="0.45" />
            <path d="M80,32 C90,24 110,24 122,32" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          </g>
          <rect x="12" y="62" width="276" height="60" rx="16" fill="#f2b3c6" stroke="#d98ba5" strokeWidth="3" />
          <rect x="12" y="100" width="276" height="22" rx="10" fill="#e9a0b7" opacity="0.6" />
          <rect x="133" y="62" width="34" height="60" fill="#c9b6e8" stroke="#9f88cb" strokeWidth="2.5" />
          <ellipse cx="150" cy="64" rx="18" ry="14" fill="#d8c8f0" stroke="#9f88cb" strokeWidth="2.5" />
          <path d="M30,74 H120" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        </motion.svg>

        {/* box */}
        <motion.svg
          viewBox="0 0 300 220"
          className="relative -mt-[6%] block w-full"
          animate={open ? { y: 80, scale: 0.85, opacity: 0 } : { y: 0, scale: 1, opacity: 1 }}
          transition={open ? { delay: 1.0, duration: 0.7, ease: "easeIn" } : { duration: 0.3 }}
        >
          <defs>
            <pattern id="gift-dots" width="34" height="34" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="4" fill="#fff" opacity="0.55" />
              <circle cx="25" cy="25" r="3" fill="#fff" opacity="0.4" />
            </pattern>
          </defs>
          <rect x="28" y="0" width="244" height="210" rx="18" fill="#f6c9d6" stroke="#d98ba5" strokeWidth="3" />
          <rect x="28" y="0" width="244" height="210" rx="18" fill="url(#gift-dots)" />
          <rect x="28" y="0" width="244" height="26" fill="#d98ba5" opacity="0.28" />
          <rect x="133" y="0" width="34" height="210" fill="#c9b6e8" stroke="#9f88cb" strokeWidth="2.5" />
          <rect x="230" y="30" width="22" height="160" rx="11" fill="#fff" opacity="0.18" />
          {toName && (
            <g transform="translate(176,120) rotate(-8)">
              <path d="M0,0 L14,-14 L92,-14 Q98,-14 98,-8 L98,30 Q98,36 92,36 L14,36 L0,22 Z" fill="#fffdf8" stroke="#d8c6b4" strokeWidth="2" />
              <circle cx="12" cy="11" r="4" fill="#f6c9d6" stroke="#d8c6b4" strokeWidth="1.5" />
              <text x="56" y="18" textAnchor="middle" fontSize={toName.length > 9 ? 13 : 17} fill="#59453f" style={{ fontFamily: "var(--font-hand)" }}>
                for {toName.length > 14 ? toName.slice(0, 13) + "…" : toName}
              </text>
            </g>
          )}
        </motion.svg>
        <div className="mx-auto -mt-2 h-4 w-3/4 rounded-[50%] bg-cocoa/10 blur-md" />
      </motion.div>
    </button>
  );
}
