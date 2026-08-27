"use client";

import ImageReveal from "./animations/ImageReveal";
import { CHAPTERS } from "@/lib/scenes";

/**
 * After the film.
 *
 * Intentionally spare: the brief is animation-first, so this exists to let the
 * journey land and to give the nav real destinations, not to carry menu copy.
 *
 * The course list used to be a pinned horizontal scroller. It looked broken in
 * practice — the cards sat jammed under the fixed nav with most of a viewport
 * of empty black beneath them, and it cost a second ScrollTrigger pin plus
 * ~2400px of scrolling for content the film has already shown. A plain grid
 * says the same thing, always renders, and pins nothing.
 */
export default function Coda() {
  const courses = CHAPTERS.filter((s) => s.id !== "hero" && s.id !== "finale");

  return (
    <div className="relative z-10" style={{ background: "var(--ink)", color: "var(--ivory)" }}>
      {/* ---- the courses ---- */}
      <section id="menu" className="px-6 pb-24 pt-32 md:px-14 md:pt-40">
        <span className="label opacity-45">The nine courses</span>

        <ul className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((scene) => (
            <li
              key={scene.id}
              className="border-t pt-6"
              style={{ borderColor: "color-mix(in srgb, var(--sand) 16%, transparent)" }}
            >
              <span className="label text-[0.58rem] opacity-40">{scene.chapter}</span>
              <h3 className="font-display mt-4 text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.02]">
                {scene.title.replace("\n", " ")}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed opacity-55">
                {scene.subtitle}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- about ---- */}
      <section
        id="about"
        className="border-t px-6 py-28 md:px-14 md:py-40"
        style={{ borderColor: "color-mix(in srgb, var(--sand) 14%, transparent)" }}
      >
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
