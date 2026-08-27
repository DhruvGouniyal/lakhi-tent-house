"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BUSINESS, MENU, MENU_ITEM_COUNT } from "@/lib/menu";
import { useReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

/**
 * Counters driven by scroll position.
 *
 * Every figure is computed from the menu data itself rather than typed in, so
 * none of it can drift out of step with the brochure — and nothing here is a
 * claim the source material doesn't support (no years in business, no event
 * counts, no awards).
 */
export default function Numbers() {
  const root = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const stats = useMemo(() => {
    const liveCounters = MENU.find((c) => c.id === "live-counters");
    const stations = liveCounters?.groups.reduce((n, g) => n + g.items.length, 0) ?? 0;
    return [
      { value: MENU.length, label: "Menu courses", suffix: "" },
      { value: MENU_ITEM_COUNT, label: "Dishes to choose from", suffix: "" },
      { value: stations, label: "Live counters & stations", suffix: "" },
      { value: BUSINESS.services.length, label: "Kinds of occasion", suffix: "" },
    ];
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const cells = el.querySelectorAll<HTMLElement>("[data-stat]");

    if (reduced) {
      cells.forEach((c) => {
        c.querySelector("[data-value]")!.textContent = c.dataset.stat!;
      });
      return;
    }

    const ctx = gsap.context(() => {
      cells.forEach((cell, i) => {
        const target = Number(cell.dataset.stat);
        const out = cell.querySelector<HTMLElement>("[data-value]")!;
        const counter = { v: 0 };

        gsap.to(counter, {
          v: target,
          ease: "none",
          scrollTrigger: {
            trigger: cell,
            start: "top 88%",
            end: "top 45%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
          onUpdate: () => {
            out.textContent = String(Math.round(counter.v));
          },
        });

        // The rule under each figure draws itself across the same span.
        gsap.fromTo(
          cell.querySelector("[data-rule]"),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: cell,
              start: "top 88%",
              end: "top 45%",
              scrub: 0.6,
            },
          }
        );

        gsap.fromTo(
          cell,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            delay: i * 0.05,
            scrollTrigger: { trigger: cell, start: "top 92%", once: true },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={root}
      className="border-t px-6 py-24 md:px-14 md:py-32"
      style={{
        background: "var(--ink)",
        color: "var(--ivory)",
        borderColor: "color-mix(in srgb, var(--sand) 14%, transparent)",
      }}
    >
      <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} data-stat={s.value}>
            <div
              className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-none"
              style={{ color: "var(--gold-light)" }}
            >
              <span data-value>0</span>
              {s.suffix}
            </div>
            <div
              data-rule
              className="mt-5 h-px w-full origin-left"
              style={{ background: "color-mix(in srgb, var(--gold) 55%, transparent)" }}
            />
            <p className="label mt-5 text-[0.58rem] opacity-55">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
