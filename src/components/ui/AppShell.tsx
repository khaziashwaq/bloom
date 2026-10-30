"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { sound } from "@/lib/sound";
import { useBouquet, useSettings, useToasts } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useBouquet.persist.rehydrate();
    void useSettings.persist.rehydrate();

    const apply = (s: { sfx: boolean; music: boolean }) => {
      sound.setSfx(s.sfx);
      sound.setMusic(s.music);
    };
    apply(useSettings.getState());
    const unsub = useSettings.subscribe(apply);

    const unlock = () => sound.unlock();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      unsub();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster />
    </MotionConfig>
  );
}

function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[100] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-cocoa px-5 py-2.5 text-sm font-semibold text-cream shadow-float"
          >
            <span>{t.message}</span>
            {t.action && (
              <button
                className="rounded-full bg-cream/15 px-3 py-1 text-butter transition hover:bg-cream/25"
                onClick={() => {
                  t.action?.run();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
