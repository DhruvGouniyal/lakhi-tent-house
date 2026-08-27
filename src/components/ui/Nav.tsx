"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "../animations/SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

const LINKS = [
  { label: "Journey", href: "#journey" },
  { label: "Services", href: "#services" },
  { label: "Menu", href: "#menu" },
  { label: "Booking", href: "#process" },
  { label: "Contact", href: "#contact" },
];

/**
 * Deliberately quiet chrome — the scroll experience is the attraction, so the
 * nav inherits the current scene's text colour and otherwise stays out of the
 * way. Full-screen overlay on mobile.
 */
export default function Nav() {
  const [open, setOpen] = useState(false);
  const [onContent, setOnContent] = useState(false);
  const { scrollTo, setLocked } = useSmoothScroll();

  /**
   * Over the film the nav floats on cinematic footage and needs no backdrop.
   * Over the menu it was overlapping dish names, so past the film it picks up
   * a translucent bar. Tracked with a trigger rather than a scroll listener so
   * it stays correct when the film's height changes.
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: "#journey",
        start: "bottom 72px",
        onEnter: () => setOnContent(true),
        onLeaveBack: () => setOnContent(false),
        invalidateOnRefresh: true,
      });
    });
    return () => ctx.revert();
  }, []);

  // Lock the film while the mobile menu is open.
  useEffect(() => {
    setLocked(open);
    return () => setLocked(false);
  }, [open, setLocked]);

  const go = (href: string) => {
    setOpen(false);
    // Let the overlay close before travelling.
    setTimeout(() => scrollTo(href), open ? 380 : 0);
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[70] flex items-center justify-between px-6 py-5 md:px-10 md:py-7"
        // The film writes --env-text per scene and it already inverts to ink on
        // the light breakfast room, so the nav stays legible without a blend
        // mode (difference washed it out against the cream background).
        style={{
          color: onContent ? "var(--ivory)" : "var(--env-text)",
          background: onContent ? "color-mix(in srgb, var(--ink) 82%, transparent)" : "transparent",
          backdropFilter: onContent ? "blur(10px)" : "none",
          borderBottom: onContent
            ? "1px solid color-mix(in srgb, var(--sand) 12%, transparent)"
            : "1px solid transparent",
          transition: "background 400ms ease, border-color 400ms ease, color 400ms ease",
        }}
      >
        <button
          onClick={() => go("#journey")}
          data-cursor="Top"
          className="font-display text-lg tracking-[0.22em]"
        >
          LAKHI
        </button>

        <nav className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              data-cursor="View"
              className="label opacity-70 transition-opacity duration-300 hover:opacity-100"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => go("#contact")}
            data-cursor="Enquire"
            className="label rounded-full border border-current px-5 py-2 opacity-80 transition-opacity duration-300 hover:opacity-100"
          >
            Get a quote
          </button>
        </nav>

        {/* mobile trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative z-[80] flex h-6 w-7 flex-col justify-center gap-[6px] md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span
            className="block h-px w-full bg-current transition-transform duration-400"
            style={{ transform: open ? "translateY(3.5px) rotate(45deg)" : "none" }}
          />
          <span
            className="block h-px w-full bg-current transition-transform duration-400"
            style={{ transform: open ? "translateY(-3.5px) rotate(-45deg)" : "none" }}
          />
        </button>
      </header>

      {/* full-screen mobile menu */}
      <div
        className="fixed inset-0 z-[75] flex flex-col items-center justify-center gap-2 md:hidden"
        style={{
          background: "var(--env-bg)",
          color: "var(--env-text)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 460ms ease",
        }}
      >
        {LINKS.map((l, i) => (
          <button
            key={l.href}
            onClick={() => go(l.href)}
            className="font-display text-[3rem] leading-tight"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(18px)",
              transition: `opacity 520ms ease ${i * 70 + 120}ms, transform 520ms ease ${
                i * 70 + 120
              }ms`,
            }}
          >
            {l.label}
          </button>
        ))}
        <button
          onClick={() => go("#contact")}
          className="label mt-8 rounded-full border border-current px-7 py-3"
          style={{
            opacity: open ? 0.9 : 0,
            transition: "opacity 520ms ease 460ms",
          }}
        >
          Get a quote
        </button>
      </div>
    </>
  );
}
