"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: ReactNode;
  className?: string;
  /** Extra scroll distance, as a multiple of the track's overflow width. */
  lengthFactor?: number;
}

/**
 * Vertical scroll translated into lateral camera travel.
 *
 * Pins its own viewport and drags the track sideways by exactly its overflow,
 * measured on refresh so it stays correct across resizes and font loads.
 * Falls back to a normal horizontal scroller under reduced motion.
 */
export default function HorizontalScrollSection({
  children,
  className = "",
  lengthFactor = 1,
}: Props) {
  const root = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const rootEl = root.current;
    const trackEl = track.current;
    if (!rootEl || !trackEl || reduced) return;

    const ctx = gsap.context(() => {
      const overflow = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);

      gsap.to(trackEl, {
        x: () => -overflow(),
        ease: "none",
        scrollTrigger: {
          trigger: rootEl,
          start: "top top",
          end: () => `+=${overflow() * lengthFactor}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, rootEl);

    return () => ctx.revert();
  }, [lengthFactor, reduced]);

  return (
    <div ref={root} className={`relative overflow-hidden ${className}`}>
      <div
        ref={track}
        className="flex will-change-transform max-md:overflow-x-auto"
      >
        {children}
      </div>
    </div>
  );
}
