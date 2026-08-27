"use client";

import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideo, { ScrollVideoHandle } from "./ScrollVideo";
import {
  SCENE_OFFSETS_VH,
  mobileSrc,
  overlapFor,
  type SceneConfig,
} from "@/lib/scenes";
import {
  enterState,
  exitState,
  restingState,
  usesSurfaceWipe,
  WIPE_FROM,
  WIPE_TO,
} from "./SceneTransition";
import { range, useIsNarrowViewport, useReducedMotion } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  scene: SceneConfig;
  /** The tall film wrapper every scene measures its window against. */
  filmRef: RefObject<HTMLElement | null>;
  /** Scene-specific overlay content (titles, CTA). Receives no props. */
  children?: ReactNode;
}

/**
 * One beat of the film.
 *
 * Every scene occupies a slice of the shared scroll timeline defined in
 * `scenes.ts`. The slice is widened by SCENE_OVERLAP_VH at both ends so
 * neighbouring scenes are simultaneously leaving and arriving — that overlap
 * is what makes the journey read as one continuous shot rather than ten
 * stacked sections.
 *
 * The stage itself is pinned once by the parent (a single sticky viewport), so
 * there are no per-section pin-spacers to jump between.
 */
export default function CinematicSection({ scene, filmRef, children }: Props) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<ScrollVideoHandle | null>(null);
  const [active, setActive] = useState(scene.index === 0);

  const isNarrow = useIsNarrowViewport();
  const reduced = useReducedMotion();

  useEffect(() => {
    const layer = layerRef.current;
    const camera = cameraRef.current;
    const film = filmRef.current;
    if (!layer || !camera || !film) return;

    const isFirst = scene.index === 0;
    const vh = () => window.innerHeight / 100;

    // Window boundaries in px, recomputed on every refresh so resizing never
    // leaves a scene mistimed.
    const overlap = overlapFor(scene);
    const lead = isFirst ? 0 : overlap;
    const startPx = () => (SCENE_OFFSETS_VH[scene.index] - lead) * vh();
    const endPx = () =>
      (SCENE_OFFSETS_VH[scene.index] + scene.scrollVh + overlap) * vh();

    const ctx = gsap.context(() => {
      const enter = enterState(scene);
      const exit = exitState(scene);
      const rest = restingState();
      const wipe = usesSurfaceWipe(scene);

      // The first scene is already composed when the page opens.
      gsap.set(layer, isFirst ? { ...rest, autoAlpha: 1 } : { ...enter, autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: film,
          start: () => `top+=${startPx()} top`,
          end: () => `top+=${endPx()} top`,
          scrub: reduced ? true : 0.55,
          invalidateOnRefresh: true,
          onToggle: (self) => setActive(self.isActive),
        },
      });

      // --- arrive -------------------------------------------------------
      if (!isFirst) {
        tl.fromTo(
          layer,
          {
            ...enter,
            autoAlpha: 0,
            clipPath: wipe ? WIPE_FROM : enter.clipPath,
          },
          {
            ...rest,
            autoAlpha: 1,
            clipPath: wipe ? WIPE_TO : rest.clipPath,
            duration: 0.18,
            ease: "power2.out",
          },
          0
        );
      } else {
        tl.set(layer, { ...rest, autoAlpha: 1 }, 0);
      }

      // --- hold: a slow continuous camera move through the whole beat ----
      // Deliberately small. The generated clips already contain their own
      // camera movement; a large move here compounds with it and reads as
      // drift. "hold" adds nothing, which is what filmed transitions want.
      const drift =
        scene.camera === "hold"
          ? { scale: 1 }
          : scene.camera === "travel"
          ? { x: "-2.5%", scale: 1.02 }
          : scene.camera === "pull"
          ? { scale: 0.975 }
          : { scale: 1.03 };

      tl.fromTo(
        camera,
        { scale: scene.camera === "pull" ? 1.025 : 1, x: "0%" },
        { ...drift, duration: 0.82, ease: "none" },
        isFirst ? 0 : 0.18
      );

      // --- leave ---------------------------------------------------------
      if (scene.nextScene) {
        tl.to(
          layer,
          { ...exit, autoAlpha: 0, duration: 0.18, ease: "power2.in" },
          0.82
        );
      }

      // Video scrub + caption progress ride the smoothed timeline value.
      const videoWindowStart = isFirst ? 0 : 0.12;
      tl.eventCallback("onUpdate", () => {
        const p = tl.progress();
        videoRef.current?.seek(range(p, videoWindowStart, 0.9));
      });
    }, layer);

    return () => ctx.revert(); // kills triggers, tweens and inline styles
  }, [scene, filmRef, reduced]);

  // Note: no permanent `will-change` on the layers below. Promoting sixteen
  // full-viewport elements — each wrapping a video — pinned a large amount of
  // GPU memory for layers that are invisible almost all the time. GSAP promotes
  // what it is actually animating, which is the only moment it helps.
  return (
    <div
      ref={layerRef}
      className="absolute inset-0"
      style={{ zIndex: scene.index + 1 }}
      data-scene={scene.id}
    >
      <div ref={cameraRef} className="absolute inset-0">
        <ScrollVideo
          ref={videoRef}
          src={isNarrow ? mobileSrc(scene.video) : scene.video}
          active={active}
          variant={scene.variant}
          accent={scene.environment.accent}
          fog={scene.environment.fog}
          // The footage always plays. Reduced motion suppresses *involuntary*
          // movement — scroll inertia, idle loops, grain, the pointer light —
          // but scrubbing is driven entirely by the user, and treating it as
          // decoration meant anyone with Windows animations disabled saw the
          // procedural stand-in instead of the film. The fallback is now only
          // for a genuinely missing file.
          preferFallback={false}
        />
      </div>
      {children}
    </div>
  );
}
