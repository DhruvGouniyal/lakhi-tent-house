"use client";

import HorizontalScrollSection from "./animations/HorizontalScrollSection";
import ImageReveal from "./animations/ImageReveal";
import { CHAPTERS } from "@/lib/scenes";

/**
 * After the film.
 *
 * The brief is animation-first, so this is intentionally spare: it exists to
 * give the nav real destinations and to let the journey land, not to carry
 * menu copy. The full nine-category menu belongs here later.
 */
export default function Coda() {
  return (
    <div className="relative z-10" style={{ background: "var(--ink)", color: "var(--ivory)" }}>
      {/* ---- the courses, travelled laterally ---- */}
      <section id="menu" className="relative">
        <div className="px-6 pb-14 pt-28 md:px-14 md:pt-36">
          <span className="label opacity-45">The nine courses</span>
        </div>

        <HorizontalScrollSection className="pb-24">
          {CHAPTERS.filter((s) => s.id !== "hero" && s.id !== "finale").map((scene) => (
            <article
              key={scene.id}
              className="w-[78vw] shrink-0 border-l px-8 md:w-[38vw] md:px-12"
              style={{ borderColor: "color-mix(in srgb, var(--sand) 18%, transparent)" }}
            >
              <span className="label opacity-40">{scene.chapter}</span>
              <h3 className="font-display mt-6 text-[clamp(2rem,4.4vw,3.4rem)] leading-[0.95]">
                {scene.title.replace("\n", " ")}
              </h3>
              <p className="mt-5 max-w-sm text-sm font-light leading-relaxed opacity-55">
                {scene.subtitle}
              </p>
            </article>
          ))}
        </HorizontalScrollSection>
      </section>

      {/* ---- about ---- */}
      <section id="about" className="px-6 py-28 md:px-14 md:py-40">
        <ImageReveal from="bottom" className="max-w-4xl">
          <p className="font-display text-[clamp(1.7rem,4.2vw,3.2rem)] leading-[1.18]">
            Weddings, marriages, functions and events — cooked fresh, served
            warm, and staged as one continuous celebration.
          </p>
        </ImageReveal>
      </section>

      {/* ---- contact ---- */}
      <section
        id="contact"
        className="border-t px-6 py-24 md:px-14 md:py-32"
        style={{ borderColor: "color-mix(in srgb, var(--sand) 14%, transparent)" }}
      >
        <div className="flex flex-col justify-between gap-12 md:flex-row md:items-end">
          <div>
            <span className="label opacity-45">Plan your event</span>
            <h2 className="font-display mt-6 text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.92]">
              Let&rsquo;s set the table.
            </h2>
          </div>

          <a
            href="#contact"
            data-cursor="Enquire"
            className="label inline-flex shrink-0 items-center gap-3 rounded-full border px-8 py-4 transition-colors duration-500 hover:bg-white/5"
            style={{ borderColor: "var(--gold)", color: "var(--gold-light)" }}
          >
            Request a quote <span aria-hidden>&rarr;</span>
          </a>
        </div>

        <footer className="mt-24 flex flex-col justify-between gap-4 text-xs opacity-40 md:flex-row">
          <span>Lakhi Tent House &amp; Caters</span>
          <span>Wedding &middot; Marriage &middot; Functions &middot; Events</span>
        </footer>
      </section>
    </div>
  );
}
