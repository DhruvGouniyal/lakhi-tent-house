"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MENU } from "@/lib/menu";
import { useReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

/**
 * Two kitchens.
 *
 * The vegetarian / non-vegetarian split runs through most of the brochure, so
 * it earns a section. Counts are summed from the menu data — every group whose
 * title names one side or the other — rather than hand-written, so they stay
 * true if the menu is edited.
 */
export default function Kitchens() {
  const root = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const { veg, nonVeg } = useMemo(() => {
    let veg = 0;
    let nonVeg = 0;
    for (const cat of MENU) {
      for (const g of cat.groups) {
        const t = g.title.toLowerCase();
        if (t.includes("non-vegetarian")) nonVeg += g.items.length;
        else if (t.includes("vegetarian")) veg += g.items.length;
      }
    }
    return { veg, nonVeg };
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const panels = el.querySelectorAll<HTMLElement>("[data-panel]");

    if (reduced) {
      gsap.set(panels, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      panels.forEach((panel, i) => {
        // Each half is wiped in from its own outer edge, so they meet in the
        // middle as the section arrives.
        gsap.fromTo(
          panel,
          { clipPath: i === 0 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)", opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            duration: 1.15,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 74%", once: true },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  const panels = [
    {
      label: "Pure vegetarian",
      count: veg,
      body: "Separate preparation and separate service, from paneer tikka and hara bhara kebab through dal makhni, malai kofta and sarson ka saag.",
    },
    {
      label: "Non-vegetarian",
      count: nonVeg,
      body: "Chicken, mutton, fish and egg, across starters, main course, Indo-Chinese and the morning spread.",
    },
  ];

  return (
    <section
      ref={root}
      className="border-t px-6 py-28 md:px-14 md:py-36"
      style={{
        background: "var(--ink)",
        color: "var(--ivory)",
        borderColor: "color-mix(in srgb, var(--sand) 14%, transparent)",
      }}
    >
      <span className="label mb-14 block opacity-45">Two kitchens</span>

      <div className="grid gap-x-14 gap-y-12 md:grid-cols-2">
        {panels.map((p) => (
          <div key={p.label} data-panel>
            <div className="flex items-baseline gap-4">
              <span
                className="font-display text-[clamp(2.6rem,6vw,4.4rem)] leading-none"
                style={{ color: "var(--gold-light)" }}
              >
                {p.count}
              </span>
              <span className="label text-[0.58rem] opacity-55">dishes</span>
            </div>
            <h3 className="font-display mt-5 text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.05]">
              {p.label}
            </h3>
            <p className="mt-4 max-w-md text-sm font-light leading-relaxed opacity-60">
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
