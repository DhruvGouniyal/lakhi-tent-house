"use client";

import ImageReveal from "./animations/ImageReveal";
import Menu from "./Menu";
import Manifesto from "./sections/Manifesto";
import Services from "./sections/Services";
import Numbers from "./sections/Numbers";
import Kitchens from "./sections/Kitchens";
import Process from "./sections/Process";
import { BUSINESS } from "@/lib/menu";

/**
 * After the film: the menu, then the closing pitch.
 *
 * The film is the marketing; this is the substance. Contact details come from
 * the brochure cover, which is the only place the phone number appears.
 */
export default function Coda() {
  return (
    <div className="relative z-10" style={{ background: "var(--ink)", color: "var(--ivory)" }}>
      {/* The film hands over to prose, then to substance. Order matters: the
          manifesto catches the mood the finale leaves you in, and the menu sits
          after the framing rather than immediately after the credits. */}
      <Manifesto />
      <Services />
      <Numbers />
      <Kitchens />
      <Menu />
      <Process />

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
        <p className="label mt-10 opacity-45">{BUSINESS.tagline}</p>
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

            <a
              href={BUSINESS.phoneHref}
              data-cursor="Call"
              className="font-display mt-8 inline-block text-[clamp(1.6rem,3.4vw,2.6rem)] leading-none transition-opacity duration-300 hover:opacity-70"
              style={{ color: "var(--gold-light)" }}
            >
              M: {BUSINESS.phone}
            </a>
          </div>

          <a
            href={BUSINESS.phoneHref}
            data-cursor="Call"
            className="label inline-flex shrink-0 items-center gap-3 rounded-full border px-8 py-4 transition-colors duration-500 hover:bg-white/5"
            style={{ borderColor: "var(--gold)", color: "var(--gold-light)" }}
          >
            Request a quote <span aria-hidden>&rarr;</span>
          </a>
        </div>

        <footer className="mt-24 flex flex-col justify-between gap-4 text-xs opacity-40 md:flex-row">
          <span>{BUSINESS.name}</span>
          <span>{BUSINESS.services.join(" · ")}</span>
        </footer>
      </section>
    </div>
  );
}
