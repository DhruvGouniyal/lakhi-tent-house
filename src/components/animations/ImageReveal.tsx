"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: ReactNode;
  className?: string;
  /** Direction the mask opens from. */
  from?: "bottom" | "left" | "circle";
}

const FROM: Record<NonNullable<Props["from"]>, string> = {
  bottom: "inset(100% 0% 0% 0%)",
  left: "inset(0% 100% 0% 0%)",
  circle: "circle(0% at 50% 55%)",
};

const TO: Record<NonNullable<Props["from"]>, string> = {
  bottom: "inset(0% 0% 0% 0%)",
  left: "inset(0% 0% 0% 0%)",
  circle: "circle(78% at 50% 55%)",
};

/**
 * Clip-path reveal — the visual is uncovered rather than faded up, which keeps
 * it feeling like part of the set instead of a DOM element appearing.
 */
export default function ImageReveal({ children, className = "", from = "bottom" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      gsap.set(el, { clipPath: TO[from], scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: FROM[from], scale: 1.12 },
        {
          clipPath: TO[from],
          scale: 1,
          duration: 1.3,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 78%", once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [from, reduced]);

  return (
    <div ref={ref} className={className} style={{ willChange: "clip-path, transform" }}>
      {children}
    </div>
  );
}
