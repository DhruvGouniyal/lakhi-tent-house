"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

/**
 * The four occasion types printed on the brochure cover.
 *
 * Descriptions deliberately describe what is *offered* — which the menu
 * evidences — rather than making claims about experience, scale or history that
 * nothing in the source material supports.
 */
const SERVICES = [
  {
    n: "01",
    title: "Wedding",
    body: "Catering across every function of the wedding, from the welcome drink at the gate to the last sweet of the night.",
  },
  {
    n: "02",
    title: "Marriage",
    body: "Ceremony dining for both sides of the family — vegetarian and non-vegetarian spreads served in parallel.",
  },
  {
    n: "03",
    title: "Functions",
    body: "Engagements, mehndi, sangeet and reception. Live counters, chaat stations and full main-course service.",
  },
  {
    n: "04",
    title: "Events",
    body: "Corporate and private gatherings, with breakfast spreads, Indo-Chinese menus and gourmet coffee bars.",
  },
];

/**
 * Cards uncovered by a clip-path wipe with per-card parallax drift, rather than
 * the usual fade-and-rise — so the section reads as part of the film's language
 * instead of a template block.
 */
export default function Services() {
  const root = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-card]");

    if (reduced) {
      gsap.set(cards, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { clipPath: "inset(0% 0% 100% 0%)", opacity: 0, y: 40 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            delay: (i % 2) * 0.12,
            scrollTrigger: { trigger: card, start: "top 84%", once: true },
          }
        );

        // Alternating drift gives the grid depth as it passes.
        gsap.fromTo(
          card,
          { yPercent: i % 2 === 0 ? 4 : -4 },
          {
            yPercent: i % 2 === 0 ? -4 : 4,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={root}
      id="services"
      className="border-t px-6 py-28 md:px-14 md:py-40"
      style={{
        background: "var(--ink)",
        color: "var(--ivory)",
        borderColor: "color-mix(in srgb, var(--sand) 14%, transparent)",
      }}
    >
      <header className="mb-16 max-w-2xl">
        <span className="label opacity-45">What we cater</span>
        <h2 className="font-display mt-6 text-[clamp(2.2rem,5.5vw,4rem)] leading-[0.98]">
          Four kinds of celebration.
        </h2>
      </header>

      <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <article
            key={s.n}
            data-card
            className="border-t pt-7"
            style={{ borderColor: "color-mix(in srgb, var(--sand) 18%, transparent)" }}
          >
            <span className="label text-[0.58rem]" style={{ color: "var(--gold)" }}>
              {s.n}
            </span>
            <h3 className="font-display mt-4 text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.02]">
              {s.title}
            </h3>
            <p className="mt-4 max-w-md text-sm font-light leading-relaxed opacity-60">
              {s.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
