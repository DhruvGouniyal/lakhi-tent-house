"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useHasFinePointer, useReducedMotion } from "@/lib/hooks";

/**
 * A soft key light that follows the pointer across the set.
 *
 * Intentionally almost subliminal — it adds depth to a flat frame without
 * competing with scroll for attention. Desktop only.
 */
export default function PointerAtmosphere() {
  const ref = useRef<HTMLDivElement | null>(null);
  const fine = useHasFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !fine || reduced) return;

    const x = gsap.quickTo(el, "xPercent", { duration: 1.1, ease: "power3.out" });
    const y = gsap.quickTo(el, "yPercent", { duration: 1.1, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      // Map the pointer to a gentle ±14% drift, not a 1:1 follow.
      x((e.clientX / window.innerWidth - 0.5) * 28);
      y((e.clientY / window.innerHeight - 0.5) * 28);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf(el);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-[-20%] z-[35]"
      style={{
        background:
          "radial-gradient(ellipse 42% 42% at 50% 50%, color-mix(in srgb, var(--env-fog) 26%, transparent), transparent 70%)",
        mixBlendMode: "screen",
        opacity: 0.5,
        willChange: "transform",
      }}
    />
  );
}
