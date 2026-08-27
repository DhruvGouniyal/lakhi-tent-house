"use client";

import { RefObject, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CinematicSection from "../animations/CinematicSection";
import SceneCaption from "../ui/SceneCaption";
import { SCENE_OFFSETS_VH, getScene } from "@/lib/scenes";
import { useReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

const scene = getScene("live-counters");

/** The stations the camera walks past. Labels only — the scene is the hero. */
const STATIONS = ["Chaat", "Tandoor", "Pasta", "Sushi", "Waffle", "Rolled Ice-Cream"];

/**
 * Scene 04 — the longest beat.
 *
 * On top of the shared camera move, a strip of station names travels laterally
 * against the scroll so the viewer feels they are walking the counter line
 * rather than watching a section change.
 */
export default function LiveCounterScene({
  filmRef,
}: {
  filmRef: RefObject<HTMLElement | null>;
}) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const strip = stripRef.current;
    const film = filmRef.current;
    if (!strip || !film || reduced) return;

    const vh = () => globalThis.innerHeight / 100;
    const base = SCENE_OFFSETS_VH[scene.index];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        strip,
        { xPercent: 18, opacity: 0 },
        {
          xPercent: -42,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: film,
            start: () => `top+=${base * vh()} top`,
            end: () => `top+=${(base + scene.scrollVh) * vh()} top`,
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        }
      );
    }, strip);

    return () => ctx.revert();
  }, [filmRef, reduced]);

  return (
    <CinematicSection scene={scene} filmRef={filmRef}>
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center overflow-hidden">
        <div
          ref={stripRef}
          className="flex shrink-0 gap-[8vw] whitespace-nowrap will-change-transform"
        >
          {STATIONS.map((s) => (
            <span
              key={s}
              className="font-display text-[clamp(3rem,11vw,9rem)] leading-none opacity-[0.13]"
              style={{ color: scene.environment.accent }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <SceneCaption scene={scene} filmRef={filmRef} placement="bottom-left" />
    </CinematicSection>
  );
}
