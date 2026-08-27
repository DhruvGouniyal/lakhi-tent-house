"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Coarse pointer OR narrow viewport — both mean "don't run the heavy path". */
export const useIsMobile = () => useMediaQuery("(max-width: 900px), (pointer: coarse)");

/**
 * Viewport width only. Used to pick the small video re-encode: a touchscreen
 * laptop reports a coarse pointer but still has a large display, and serving it
 * the 640px clip would look soft for no reason.
 */
export const useIsNarrowViewport = () => useMediaQuery("(max-width: 900px)");

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** True only on a real desktop pointer, where a custom cursor makes sense. */
export const useHasFinePointer = () => useMediaQuery("(pointer: fine) and (min-width: 901px)");

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** Progress of `v` across [a, b], clamped to 0..1. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Mix two hex colours. Used to cross-fade scene environments. */
export function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bl = Math.round(lerp(ab, bb, t));
  return `rgb(${r}, ${g}, ${bl})`;
}
