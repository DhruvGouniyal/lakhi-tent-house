"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: ReactNode;
  /** Positive drifts slower than the page, negative overtakes it. */
  speed?: number;
  /** Also drift horizontally. */
  speedX?: number;
  className?: string;
}

/** Depth by differential movement. Kept subtle — this is set dressing. */
export default function ParallaxObject({
  children,
  speed = 0.2,
  speedX = 0,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed * 50, xPercent: -speedX * 50 },
        {
          yPercent: speed * 50,
          xPercent: speedX * 50,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [speed, speedX, reduced]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
