"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MENU, MENU_ITEM_COUNT } from "@/lib/menu";
import { useReducedMotion } from "@/lib/hooks";
import { useSmoothScroll } from "./animations/SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * The full printed menu — all nine categories, every dish.
 *
 * Everything is visible by default rather than hidden behind accordions: this
 * is the content a caterer's customer actually came for, and collapsing ~250
 * dishes behind clicks would also keep them out of search results.
 *
 * Long item lists use CSS multi-column so a group of 29 starters reads as a
 * compact block instead of a column running off the page.
 */
export default function Menu() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(MENU[0].id);
  const reduced = useReducedMotion();
  const { scrollTo } = useSmoothScroll();

  // Reveal each category as it comes up, and track which one we are inside.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-cat]").forEach((section) => {
        if (!reduced) {
          gsap.fromTo(
            section.querySelectorAll("[data-rise]"),
            { y: 26, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power2.out",
              stagger: 0.06,
              scrollTrigger: { trigger: section, start: "top 78%", once: true },
            }
          );
        }

        ScrollTrigger.create({
          trigger: section,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) setCurrent(section.dataset.cat!);
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="menu"
      ref={rootRef}
      className="relative px-6 pb-28 pt-32 md:px-14 md:pt-40"
      style={{ background: "var(--ink)", color: "var(--ivory)" }}
    >
      <header className="mb-16 max-w-3xl">
        <span className="label opacity-45">The menu</span>
        <h2 className="font-display mt-6 text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.95]">
          Nine courses,
          <br />
          {MENU_ITEM_COUNT} dishes.
        </h2>
        <p className="mt-6 max-w-xl text-sm font-light leading-relaxed opacity-55">
          Everything below is prepared fresh on site. Mix and match freely —
          packages are built around your event, not the other way round.
        </p>
      </header>

      <div className="lg:flex lg:gap-16">
        {/* category jump list — sticky on desktop, scrollable chips on mobile */}
        <nav
          className="mb-12 lg:sticky lg:top-28 lg:mb-0 lg:h-fit lg:w-56 lg:shrink-0"
          aria-label="Menu categories"
        >
          <ul className="flex gap-x-5 gap-y-2 overflow-x-auto pb-3 lg:flex-col lg:gap-2 lg:overflow-visible lg:pb-0">
            {MENU.map((cat) => (
              <li key={cat.id} className="shrink-0">
                <button
                  onClick={() => scrollTo(`#${cat.id}`)}
                  data-cursor="Jump"
                  className="label whitespace-nowrap text-[0.58rem] transition-opacity duration-300 lg:whitespace-normal lg:text-left"
                  style={{
                    opacity: current === cat.id ? 1 : 0.4,
                    color: current === cat.id ? "var(--gold-light)" : "inherit",
                  }}
                >
                  {cat.number} — {cat.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* the menu itself */}
        <div className="min-w-0 flex-1">
          {MENU.map((cat) => (
            <article
              key={cat.id}
              id={cat.id}
              data-cat={cat.id}
              className="scroll-mt-28 border-t pt-10 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-20"
              style={{ borderColor: "color-mix(in srgb, var(--sand) 15%, transparent)" }}
            >
              <div data-rise>
                <span className="label text-[0.58rem]" style={{ color: "var(--gold)" }}>
                  {cat.number}
                </span>
                <h3 className="font-display mt-3 text-[clamp(1.8rem,3.4vw,2.9rem)] leading-[1.02]">
                  {cat.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm font-light leading-relaxed opacity-50">
                  {cat.blurb}
                </p>
              </div>

              <div className="mt-9 grid gap-x-10 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
                {cat.groups.map((group) => (
                  <div key={group.title} data-rise>
                    <h4
                      className="label mb-4 text-[0.58rem]"
                      style={{ color: "var(--gold-light)" }}
                    >
                      {group.title}
                    </h4>
                    <ul
                      className="text-sm font-light leading-[1.9] opacity-70"
                      style={{
                        // Width-based rather than a fixed count: the browser
                        // adds a second column only where one genuinely fits.
                        // A fixed count squeezed long dish names like "Chicken
                        // Reshmi Kebab" into columns too narrow to hold them.
                        columns: group.items.length > 14 ? "12rem auto" : "auto",
                        columnGap: "2.25rem",
                      }}
                    >
                      {group.items.map((item, i) => (
                        <li key={`${item}-${i}`} className="break-inside-avoid">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {cat.note && (
                <p
                  data-rise
                  className="label mt-8 text-[0.58rem]"
                  style={{ color: "var(--gold)" }}
                >
                  {cat.note}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
