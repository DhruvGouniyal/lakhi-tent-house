"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { READY_EVENT } from "@/lib/events";
import { useSmoothScroll } from "../animations/SmoothScroll";

/**
 * Premium hold before the first frame.
 *
 * Critically it is time-boxed: the film's clips may not exist yet, and even
 * when they do we only ever load metadata, so the loader must never wait on
 * them. It counts up, hands over, and gets out of the way.
 */
export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { setLocked } = useSmoothScroll();

  useEffect(() => {
    setLocked(true);
    // Always start the journey at the top, even on a soft reload.
    window.scrollTo(0, 0);

    const counter = { v: 0 };
    const tl = gsap.to(counter, {
      v: 100,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => setProgress(Math.round(counter.v)),
      onComplete: () => setDone(true),
    });

    return () => {
      tl.kill();
      setLocked(false);
    };
  }, [setLocked]);

  useEffect(() => {
    if (!done) return;
    const root = rootRef.current;

    setLocked(false);
    document.documentElement.dataset.ready = "true";
    window.dispatchEvent(new CustomEvent(READY_EVENT));
    // Positions measured behind the loader can be stale.
    ScrollTrigger.refresh();

    if (!root) return;
    gsap.to(root, {
      autoAlpha: 0,
      duration: 0.9,
      ease: "power2.inOut",
      onComplete: () => {
        root.style.display = "none";
      },
    });
  }, [done, setLocked]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center"
      style={{ background: "#0b0908", color: "#f7f2e8" }}
      aria-hidden={done}
    >
      <div className="text-center">
        <h1 className="font-display text-[clamp(2.5rem,9vw,6rem)] leading-none tracking-[-0.02em]">
          LAKHI
        </h1>
        <p className="label mt-4 opacity-50">Tent House &amp; Caters</p>
      </div>

      <div className="mt-14 h-px w-[min(46vw,20rem)] overflow-hidden bg-white/12">
        <div
          className="h-full origin-left"
          style={{
            background: "#b88a36",
            transform: `scaleX(${progress / 100})`,
            transition: "transform 120ms linear",
          }}
        />
      </div>

      <span className="label mt-5 text-[0.6rem] opacity-40">
        {String(progress).padStart(3, "0")}
      </span>
    </div>
  );
}
