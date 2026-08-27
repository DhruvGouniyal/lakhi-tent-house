"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useHasFinePointer } from "@/lib/hooks";

/**
 * Small circular cursor that expands over anything carrying `data-cursor`,
 * showing that element's label. Desktop pointers only — never mounted on
 * touch, where it would just be a lagging dot.
 */
export default function Cursor() {
  const enabled = useHasFinePointer();
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    if (!dot) return;

    document.documentElement.classList.add("has-custom-cursor");

    const x = gsap.quickTo(dot, "x", { duration: 0.42, ease: "power3.out" });
    const y = gsap.quickTo(dot, "y", { duration: 0.42, ease: "power3.out" });

    // Stay invisible until the pointer actually moves — otherwise the dot
    // sits parked in the top-left corner on load.
    gsap.set(dot, { opacity: 0 });
    let seen = false;

    const onMove = (e: PointerEvent) => {
      if (!seen) {
        seen = true;
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        gsap.to(dot, { opacity: 1, duration: 0.4 });
      }
      x(e.clientX);
      y(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-cursor], a, button");
      if (!el) {
        setLabel(null);
        return;
      }
      setLabel(el.getAttribute("data-cursor") ?? "");
    };

    const onLeave = () => gsap.to(dot, { opacity: 0, duration: 0.3 });
    const onEnter = () => gsap.to(dot, { opacity: 1, duration: 0.3 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      gsap.killTweensOf(dot);
    };
  }, [enabled]);

  if (!enabled) return null;

  const active = label !== null;

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[200] flex items-center justify-center rounded-full"
      style={{
        width: active ? 74 : 13,
        height: active ? 74 : 13,
        marginLeft: active ? -37 : -6.5,
        marginTop: active ? -37 : -6.5,
        border: `1px solid var(--env-accent)`,
        background: active ? "color-mix(in srgb, var(--env-accent) 14%, transparent)" : "var(--env-accent)",
        backdropFilter: active ? "blur(2px)" : "none",
        transition:
          "width 420ms cubic-bezier(.22,1,.36,1), height 420ms cubic-bezier(.22,1,.36,1), margin 420ms cubic-bezier(.22,1,.36,1), background 420ms ease",
        willChange: "transform",
      }}
    >
      <span
        className="label text-[0.5rem] leading-none"
        style={{
          color: "var(--env-text)",
          opacity: active && label ? 0.9 : 0,
          transition: "opacity 260ms ease",
        }}
      >
        {label}
      </span>
    </div>
  );
}
