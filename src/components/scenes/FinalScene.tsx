"use client";

import { RefObject, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CinematicSection from "../animations/CinematicSection";
import TextReveal from "../animations/TextReveal";
import { SCENE_OFFSETS_VH, getScene } from "@/lib/scenes";

gsap.registerPlugin(ScrollTrigger);

const scene = getScene("finale");

/**
 * Scene 10 — the payoff.
 *
 * The camera has pulled back far enough to show the whole room, and only then
 * does the wordmark return. Same type as the hero, so the journey closes where
 * it opened.
 */
export default function FinalScene({ filmRef }: { filmRef: RefObject<HTMLElement | null> }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;

    const vh = () => globalThis.innerHeight / 100;
    const base = SCENE_OFFSETS_VH[scene.index];

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: film,
        start: () => `top+=${(base + scene.scrollVh * 0.42) * vh()} top`,
        end: () => `top+=${(base + scene.scrollVh + 60) * vh()} top`,
        invalidateOnRefresh: true,
        onToggle: (self) => setShow(self.isActive),
      });
    });

    return () => ctx.revert();
  }, [filmRef]);

  return (
    <CinematicSection scene={scene} filmRef={filmRef}>
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center">
        <TextReveal
          text={scene.subtitle}
          show={show}
          split="words"
          className="label mb-8 block opacity-70"
          stagger={0.035}
        />

        <TextReveal
          as="h2"
          text="LAKHI"
          show={show}
          className="font-display text-[clamp(3.5rem,15vw,13rem)] leading-[0.85] tracking-[-0.03em]"
          stagger={0.06}
          delay={0.12}
        />

        <TextReveal
          text="Tent House & Caters"
          show={show}
          split="words"
          className="label mt-5 block opacity-65"
          stagger={0.045}
          delay={0.4}
        />

        <div
          className="pointer-events-auto mt-14"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 900ms ease 700ms, transform 900ms ease 700ms",
          }}
        >
          <a
            href="#contact"
            data-cursor="Enquire"
            className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full border px-9 py-4"
            style={{ borderColor: scene.environment.accent, color: scene.environment.text }}
          >
            <span
              className="absolute inset-0 origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100"
              style={{ background: scene.environment.accent, opacity: 0.16 }}
            />
            <span className="label relative">Plan your event</span>
            <span className="relative transition-transform duration-500 group-hover:translate-x-1">
              &rarr;
            </span>
          </a>
        </div>
      </div>
    </CinematicSection>
  );
}
