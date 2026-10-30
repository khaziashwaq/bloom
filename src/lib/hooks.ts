"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useBouquet } from "./store";

export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/**
 * For continuous inputs (sliders, mouse wheel): opens a history gesture on first
 * change and closes it shortly after the last one, so each adjustment is one undo step.
 */
export function useGestureCommit(idleMs = 350) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        useBouquet.getState().endGesture();
      }
    },
    [],
  );
  return useCallback(() => {
    const s = useBouquet.getState();
    if (!timer.current) s.beginGesture();
    else clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      useBouquet.getState().endGesture();
    }, idleMs);
  }, [idleMs]);
}
