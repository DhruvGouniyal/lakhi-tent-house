"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import HeroScene from "./scenes/HeroScene";
import LiveCounterScene from "./scenes/LiveCounterScene";
import FinalScene from "./scenes/FinalScene";
import StoryScene from "./scenes/StoryScene";
import ProgressRail from "./ui/ProgressRail";
import PointerAtmosphere from "./animations/PointerAtmosphere";

import { FILM_HEIGHT_VH, SCENES, SCENE_OFFSETS_VH } from "@/lib/scenes";
import { clamp, mixHex } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

/**
 * THE FILM.
 *
 * One tall wrapper, one sticky viewport. Because the stage is pinned for the
 * entire journey rather than re-pinned per section, there is never a handover
 * between pin-spacers — the classic source of scroll-jumping — and the whole
 * thing reads as a single continuous shot.
 *
 * Scenes stack inside that one viewport and hand off to each other through
 * overlapping scroll windows (see CinematicSection).
 */
export default function Film() {
  const filmRef = useRef<HTMLElement | null>(null);
  const envRef = useRef<HTMLDivElement | null>(null);

  // Cross-fade the room colour continuously across the whole film.
  useEffect(() => {
    const film = filmRef.current;
    const env = envRef.current;
    if (!film || !env) return;

    const root = document.documentElement;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: film,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const vhTotal = FILM_HEIGHT_VH - 100;
          const posVh = self.progress * vhTotal;

          // Which scene are we in, and how far through it?
          let i = 0;
          for (let k = SCENES.length - 1; k >= 0; k--) {
            if (posVh >= SCENE_OFFSETS_VH[k]) {
              i = k;
              break;
            }
          }
          const scene = SCENES[i];
          const next = SCENES[Math.min(i + 1, SCENES.length - 1)];
          const local = clamp((posVh - SCENE_OFFSETS_VH[i]) / scene.scrollVh);

          // Blend into the next room over the tail of this one.
          const t = clamp((local - 0.62) / 0.38);

          const bg = mixHex(scene.environment.bg, next.environment.bg, t);
          const fog = mixHex(scene.environment.fog, next.environment.fog, t);
          const accent = mixHex(scene.environment.accent, next.environment.accent, t);
          const text = mixHex(scene.environment.text, next.environment.text, t);

          env.style.background = bg;
          root.style.setProperty("--env-bg", bg);
          root.style.setProperty("--env-fog", fog);
          root.style.setProperty("--env-accent", accent);
          root.style.setProperty("--env-text", text);
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={filmRef}
      id="journey"
      className="relative"
      style={{ height: `${FILM_HEIGHT_VH}vh` }}
    >
      <div className="grain vignette sticky top-0 h-screen w-full overflow-hidden">
        {/* the room */}
        <div ref={envRef} className="absolute inset-0" style={{ background: "#0b0908" }} />

        {/* Three beats have bespoke behaviour; everything else — including all
            six filmed transitions — is the generic StoryScene driven by config. */}
        {SCENES.map((scene) => {
          if (scene.id === "hero") return <HeroScene key={scene.id} filmRef={filmRef} />;
          if (scene.id === "live-counters")
            return <LiveCounterScene key={scene.id} filmRef={filmRef} />;
          if (scene.id === "finale") return <FinalScene key={scene.id} filmRef={filmRef} />;
          return <StoryScene key={scene.id} scene={scene} filmRef={filmRef} />;
        })}

        <PointerAtmosphere />
        <ProgressRail filmRef={filmRef} />
      </div>
    </section>
  );
}
