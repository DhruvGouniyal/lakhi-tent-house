"use client";

import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollApi {
  lenis: Lenis | null;
  /** Stop/start scrolling — used to hold the page still behind the loader. */
  setLocked: (locked: boolean) => void;
  scrollTo: (target: string | number) => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi>({
  lenis: null,
  setLocked: () => {},
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

/**
 * Lenis driven by GSAP's ticker so Lenis and ScrollTrigger share one clock.
 * Without this they run on separate rAF loops and scrub animations judder.
 *
 * Tuned heavy and cinematic rather than springy: a low lerp with a gentle
 * exponential ease reads as weight, not rubber.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [api, setApi] = useState<SmoothScrollApi>({
    lenis: null,
    setLocked: () => {},
    scrollTo: () => {},
  });

  useEffect(() => {
    // Respect the OS setting: no smoothing, no scrub inertia.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      lerp: reduced ? 1 : 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      smoothWheel: !reduced,
      syncTouch: false,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger drives scroll position through Lenis during scrollTo etc.
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length && typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
    });

    setApi({
      lenis,
      setLocked: (locked: boolean) => (locked ? lenis.stop() : lenis.start()),
      scrollTo: (target) => lenis.scrollTo(target, { duration: 1.6 }),
    });

    // Handy escape hatch for debugging and automated checks: programmatic
    // scrolling has to go through Lenis or it fights the smoothing.
    (window as unknown as { __lenis?: Lenis; __ScrollTrigger?: typeof ScrollTrigger }).__lenis =
      lenis;
    (window as unknown as { __ScrollTrigger?: typeof ScrollTrigger }).__ScrollTrigger =
      ScrollTrigger;

    // Layout settles after fonts load; stale pin/trigger positions look like
    // scroll-jumping, so recompute once everything is measured.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>
  );
}
