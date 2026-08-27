"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS, FILM_HEIGHT_VH, SCENES, SCENE_OFFSETS_VH } from "@/lib/scenes";
import { useSmoothScroll } from "../animations/SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * A thin chapter rail — the only persistent chrome inside the film.
 *
 * Doubles as the timeline scrubber the brief asks the scroll wheel to feel
 * like: ticks are proportional to each scene's real scroll length, and
 * clicking one travels there.
 */
export default function ProgressRail({ filmRef }: { filmRef: RefObject<HTMLElement | null> }) {
  const fillRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);
  const { lenis } = useSmoothScroll();

  const totalVh = FILM_HEIGHT_VH - 100;

  useEffect(() => {
    const film = filmRef.current;
    const fill = fillRef.current;
    if (!film || !fill) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: film,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          fill.style.transform = `scaleY(${self.progress})`;
          const posVh = self.progress * totalVh;
          // Find the beat we're in, then attribute it to the nearest real
          // chapter — a transition belongs to the chapter it just left.
          let i = 0;
          for (let k = SCENES.length - 1; k >= 0; k--) {
            if (posVh >= SCENE_OFFSETS_VH[k]) {
              i = k;
              break;
            }
          }
          while (i > 0 && SCENES[i].kind === "transition") i -= 1;
          const chapter = CHAPTERS.findIndex((c) => c.id === SCENES[i].id);
          setCurrent((prev) => (prev === chapter ? prev : chapter));
        },
      });
    });

    return () => ctx.revert();
  }, [filmRef, totalVh]);

  const goTo = (chapterIndex: number) => {
    const film = filmRef.current;
    if (!film || !lenis) return;
    const sceneIndex = SCENES.findIndex((s) => s.id === CHAPTERS[chapterIndex].id);
    const top = film.getBoundingClientRect().top + window.scrollY;
    const target = top + (SCENE_OFFSETS_VH[sceneIndex] / 100) * window.innerHeight;
    lenis.scrollTo(target, { duration: 1.8 });
  };

  return (
    <div
      className="pointer-events-none absolute right-5 top-1/2 z-40 hidden -translate-y-1/2 md:block lg:right-8"
      style={{ color: "var(--env-text)" }}
    >
      <div className="relative flex flex-col items-end gap-0">
        {/* rail */}
        <div className="absolute right-[3px] top-0 h-full w-px opacity-20" style={{ background: "currentColor" }} />
        <div
          ref={fillRef}
          className="absolute right-[3px] top-0 h-full w-px origin-top"
          style={{ background: "var(--env-accent)", transform: "scaleY(0)" }}
        />

        {CHAPTERS.map((scene, i) => (
          <button
            key={scene.id}
            onClick={() => goTo(i)}
            data-cursor="Jump"
            className="pointer-events-auto group flex items-center justify-end gap-3 py-[6px] pr-[1px]"
            style={{ height: `${(scene.scrollVh / totalVh) * 52}vh` }}
            aria-label={`Go to ${scene.chapter}`}
          >
            {/* No text label here — the scene's own caption already names the
                chapter, and showing it twice read as a duplication bug. The
                rail stays dots only, which is also what keeps it quiet. */}
            <span
              className="block rounded-full transition-all duration-500"
              style={{
                width: current === i ? 7 : 3,
                height: current === i ? 7 : 3,
                background: current === i ? "var(--env-accent)" : "currentColor",
                opacity: current === i ? 1 : 0.35,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
