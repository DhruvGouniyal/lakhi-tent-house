"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

const TEXT =
  "A wedding is not a meal. It is a morning of chai and pakoras, a courtyard of live counters at noon, copper handis carried out at dusk, and jalebi still warm at midnight. We cook all of it, on site, in front of your guests.";

/**
 * Scroll-scrubbed word fill.
 *
 * The paragraph is dim until scroll passes over it, then each word brightens in
 * turn — so reading speed and scroll speed are the same thing. Only opacity
 * animates, which keeps it free even with a hundred spans on screen.
 */
export default function Manifesto() {
  const root = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    if (reduced) {
      gsap.set(words, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 1,
          scrollTrigger: {
            // Spans the tall wrapper while the text is held sticky, so the
            // fill takes a real amount of scrolling. Tied to the section's own
            // height it finished in a few hundred pixels and read as a flash.
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    // Tall wrapper, text held sticky in the middle of it — the words fill as
    // the wrapper passes, which is what gives the effect room to breathe.
    <section
      ref={root}
      className="relative h-[220vh]"
      style={{ background: "var(--ink)", color: "var(--ivory)" }}
    >
      <div className="sticky top-0 flex h-screen items-center px-6 md:px-14">
        <div>
          <span className="label mb-10 block opacity-40">Why us</span>
          <p className="font-display max-w-5xl text-[clamp(1.6rem,4vw,3.1rem)] leading-[1.28]">
            {TEXT.split(" ").map((word, i) => (
              <span key={i} data-word style={{ opacity: 0.14 }}>
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
