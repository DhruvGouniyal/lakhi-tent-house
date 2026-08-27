"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "../animations/TextReveal";
import { SCENE_OFFSETS_VH, type SceneConfig } from "@/lib/scenes";

gsap.registerPlugin(ScrollTrigger);

type Placement = "center" | "bottom-left" | "bottom-right" | "top-left";

interface Props {
  scene: SceneConfig;
  filmRef: RefObject<HTMLElement | null>;
  placement?: Placement;
  /**
   * Fraction of the scene's window where copy is on screen. Passed as two
   * numbers rather than a tuple so a default value can't create a new array
   * identity on every render and re-run the ScrollTrigger effect.
   */
  fromFraction?: number;
  toFraction?: number;
  /** Suppress the big title (the hero and finale draw their own). */
  hideTitle?: boolean;
}

const POSITION: Record<Placement, string> = {
  center: "items-center justify-center text-center",
  "bottom-left": "items-end justify-start text-left",
  "bottom-right": "items-end justify-end text-right",
  "top-left": "items-start justify-start text-left",
};

/**
 * Directional scrim behind the copy.
 *
 * With real footage behind it, ivory text on a bright frame — steam, fire,
 * string lights — was close to unreadable. This darkens only the side the copy
 * sits on and fades to nothing, so it buys contrast without dropping a slab
 * over the picture.
 */
const SCRIM: Record<Placement, string> = {
  center:
    "radial-gradient(ellipse 62% 48% at 50% 50%, rgba(0,0,0,0.52), rgba(0,0,0,0.22) 55%, transparent 78%)",
  "bottom-left":
    "linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0.28) 34%, transparent 62%)",
  "bottom-right":
    "linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0.28) 34%, transparent 62%)",
  "top-left":
    "linear-gradient(to bottom, rgba(0,0,0,0.62), rgba(0,0,0,0.28) 34%, transparent 62%)",
};

/**
 * Copy for one beat. Text is secondary to the visual, so it lives inside the
 * scene's own window and leaves before the next course arrives.
 */
export default function SceneCaption({
  scene,
  filmRef,
  placement = "bottom-left",
  fromFraction = 0.24,
  toFraction = 0.76,
  hideTitle = false,
}: Props) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;

    const vh = () => globalThis.innerHeight / 100;
    const base = SCENE_OFFSETS_VH[scene.index];
    const startPx = () => (base + scene.scrollVh * fromFraction) * vh();
    const endPx = () => (base + scene.scrollVh * toFraction) * vh();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: film,
        start: () => `top+=${startPx()} top`,
        end: () => `top+=${endPx()} top`,
        invalidateOnRefresh: true,
        onToggle: (self) => setShow(self.isActive),
      });
    });

    return () => ctx.revert();
  }, [scene, filmRef, fromFraction, toFraction]);

  // On the one light room, ink-on-cream needs a pale scrim, not a dark one.
  const isLightRoom = scene.environment.text === "#30282b";

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 z-30 flex p-8 md:p-16 lg:p-20 ${POSITION[placement]}`}
      style={{ color: scene.environment.text }}
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: isLightRoom
            ? SCRIM[placement].replace(/rgba\(0,0,0,/g, "rgba(247,242,232,")
            : SCRIM[placement],
          opacity: show ? 1 : 0,
          transition: "opacity 900ms ease",
        }}
      />

      <div
        className="max-w-[min(92vw,44rem)]"
        style={{
          textShadow: isLightRoom
            ? "0 1px 22px rgba(247,242,232,0.85)"
            : "0 1px 26px rgba(0,0,0,0.55)",
        }}
      >
        <TextReveal
          text={scene.chapter}
          show={show}
          split="words"
          className="label mb-5 block opacity-80"
          stagger={0.03}
        />

        {!hideTitle && (
          <TextReveal
            as="h2"
            text={scene.title}
            show={show}
            className="font-display text-[clamp(2.6rem,8vw,7rem)] leading-[0.92]"
            stagger={0.022}
            delay={0.06}
          />
        )}

        <TextReveal
          text={scene.subtitle}
          show={show}
          split="words"
          className="mt-6 block max-w-md text-[0.95rem] font-light leading-relaxed opacity-70"
          stagger={0.02}
          delay={0.18}
        />
      </div>
    </div>
  );
}
