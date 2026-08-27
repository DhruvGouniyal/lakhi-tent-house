"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CinematicSection from "../animations/CinematicSection";
import TextReveal from "../animations/TextReveal";
import { getScene } from "@/lib/scenes";
import { READY_EVENT } from "@/lib/events";

gsap.registerPlugin(ScrollTrigger);

const scene = getScene("hero");

/**
 * Scene 01 — the empty table.
 *
 * The wordmark waits for the loader to hand over, then the whole title block
 * is carried away on scroll while the table stays put, so the first movement
 * of the film is the camera rather than a section change.
 */
export default function HeroScene({ filmRef }: { filmRef: RefObject<HTMLElement | null> }) {
  const [ready, setReady] = useState(false);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onReady = () => setReady(true);
    window.addEventListener(READY_EVENT, onReady);
    // If the loader already finished before this mounted, don't wait forever.
    if (document.documentElement.dataset.ready === "true") setReady(true);
    return () => window.removeEventListener(READY_EVENT, onReady);
  }, []);

  useEffect(() => {
    const title = titleRef.current;
    const cue = cueRef.current;
    if (!title) return;

    const ctx = gsap.context(() => {
      gsap.to(title, {
        yPercent: -34,
        opacity: 0,
        filter: "blur(10px)",
        ease: "none",
        scrollTrigger: {
          trigger: filmRef.current,
          start: "top top",
          end: () => `top+=${globalThis.innerHeight * 0.9} top`,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      if (cue) {
        gsap.to(cue, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: filmRef.current,
            start: "top top",
            end: () => `top+=${globalThis.innerHeight * 0.35} top`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [filmRef]);

  return (
    <CinematicSection scene={scene} filmRef={filmRef}>
      <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center">
        <div ref={titleRef} className="text-center will-change-transform">
          <TextReveal
            as="h1"
            text="LAKHI"
            show={ready}
            className="font-display text-[clamp(4rem,17vw,15rem)] leading-[0.85] tracking-[-0.03em]"
            stagger={0.07}
          />
          <TextReveal
            text="Tent House & Caters"
            show={ready}
            split="words"
            className="label mt-6 block opacity-70"
            stagger={0.05}
            delay={0.5}
          />
        </div>
      </div>

      <div
        ref={cueRef}
        className="pointer-events-none absolute bottom-10 left-1/2 z-30 -translate-x-1/2 text-center"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 1s ease 1.4s" }}
      >
        <span className="label block opacity-50">Scroll</span>
        <span className="scroll-cue mx-auto mt-3 block h-10 w-px origin-top bg-current" />
      </div>
    </CinematicSection>
  );
}
