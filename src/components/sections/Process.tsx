"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

/**
 * The booking sequence, taken from the brochure's own Deal & Order
 * Confirmation sheet (page 11). Every field named here — date, venue, function,
 * guests/pax, rate per plate, add-ons, tax, advance, balance — appears on that
 * form, so this documents how they already work rather than inventing a process.
 */
const STEPS = [
  {
    n: "01",
    title: "Share the event",
    body: "Date, venue, function and guest count. That is enough to start building a package.",
  },
  {
    n: "02",
    title: "Choose the package",
    body: "Pick your courses across the nine categories, and we set a rate per plate against them.",
  },
  {
    n: "03",
    title: "Add live counters",
    body: "Chaat, tandoor, pasta, sushi, waffle, rolled ice-cream — added on top as extra inclusions.",
  },
  {
    n: "04",
    title: "Confirm the order",
    body: "A written confirmation with subtotal, add-ons, tax and grand total, signed by both sides.",
  },
  {
    n: "05",
    title: "Advance & balance",
    body: "An advance secures the date. The balance settles against the final guest count.",
  },
];

/**
 * A sticky heading beside a stepped list, with a rail that draws itself as the
 * steps go by and each step lifting out of dim as it becomes current.
 */
export default function Process() {
  const root = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const steps = el.querySelectorAll<HTMLElement>("[data-step]");
    const rail = el.querySelector<HTMLElement>("[data-rail]");

    if (reduced) {
      gsap.set(steps, { opacity: 1 });
      if (rail) gsap.set(rail, { scaleY: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      if (rail) {
        gsap.fromTo(
          rail,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el.querySelector("[data-steps]"),
              start: "top 70%",
              end: "bottom 75%",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      steps.forEach((step) => {
        gsap.fromTo(
          step,
          { opacity: 0.25, x: 18 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: step, start: "top 78%", once: true },
          }
        );

        // The dot fills once the rail has reached it.
        gsap.fromTo(
          step.querySelector("[data-dot]"),
          { scale: 0.4, backgroundColor: "rgba(184,138,54,0.25)" },
          {
            scale: 1,
            backgroundColor: "rgb(217,178,106)",
            duration: 0.5,
            ease: "back.out(2)",
            scrollTrigger: { trigger: step, start: "top 72%", once: true },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={root}
      id="process"
      className="border-t px-6 py-28 md:px-14 md:py-40"
      style={{
        background: "var(--ink)",
        color: "var(--ivory)",
        borderColor: "color-mix(in srgb, var(--sand) 14%, transparent)",
      }}
    >
      <div className="lg:flex lg:gap-20">
        <header className="mb-14 lg:sticky lg:top-32 lg:mb-0 lg:h-fit lg:w-2/5">
          <span className="label opacity-45">How booking works</span>
          <h2 className="font-display mt-6 text-[clamp(2.2rem,5vw,3.8rem)] leading-[0.98]">
            From a date
            <br />
            to a table.
          </h2>
          <p className="mt-6 max-w-sm text-sm font-light leading-relaxed opacity-55">
            Five steps, the same ones printed on our order confirmation sheet.
          </p>
        </header>

        <div data-steps className="relative flex-1 pl-10">
          {/* rail */}
          <div
            className="absolute left-[3px] top-2 h-[calc(100%-1rem)] w-px"
            style={{ background: "color-mix(in srgb, var(--sand) 16%, transparent)" }}
          />
          <div
            data-rail
            className="absolute left-[3px] top-2 h-[calc(100%-1rem)] w-px origin-top"
            style={{ background: "var(--gold)", transform: "scaleY(0)" }}
          />

          {STEPS.map((s) => (
            <article key={s.n} data-step className="relative pb-14 last:pb-0">
              <span
                data-dot
                className="absolute -left-10 top-[0.55rem] block h-[7px] w-[7px] rounded-full"
              />
              <span className="label text-[0.55rem]" style={{ color: "var(--gold)" }}>
                {s.n}
              </span>
              <h3 className="font-display mt-2 text-[clamp(1.4rem,2.6vw,2.1rem)] leading-[1.05]">
                {s.title}
              </h3>
              <p className="mt-3 max-w-md text-sm font-light leading-relaxed opacity-60">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
