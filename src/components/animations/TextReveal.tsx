"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

interface Props {
  /** Use \n to force line breaks. Each line masks its own characters. */
  text: string;
  show: boolean;
  className?: string;
  /** "chars" staggers letters; "words" is calmer for longer lines. */
  split?: "chars" | "words";
  stagger?: number;
  delay?: number;
  as?: "h1" | "h2" | "p" | "span";
}

/**
 * Masked reveal: characters rise out of their own clipping line.
 *
 * Driven by a boolean rather than its own ScrollTrigger, so a scene decides
 * when its copy belongs on screen and the text animates back out cleanly when
 * the viewer scrolls in reverse.
 *
 * The hidden state is applied with `gsap.set` rather than an inline
 * `transform: translateY(108%)`. GSAP tracks yPercent in its own cache, and
 * mixing that with a pre-existing percentage transform in the style attribute
 * left the reveal tween animating opacity while the glyphs stayed parked below
 * their mask.
 */
export default function TextReveal({
  text,
  show,
  className = "",
  split = "chars",
  stagger = 0.028,
  delay = 0,
  as: Tag = "span",
}: Props) {
  const root = useRef<HTMLElement | null>(null);

  const lines = useMemo(() => text.split("\n"), [text]);

  // Park every glyph below its mask before the first paint.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const parts = el.querySelectorAll<HTMLElement>("[data-part]");
    gsap.set(parts, { yPercent: 108, opacity: 0 });
  }, [lines, split]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const parts = el.querySelectorAll<HTMLElement>("[data-part]");
    if (!parts.length) return;

    // GSAP promotes what it animates, but a caption is static once revealed.
    // Leaving ~200 character spans promoted kept that many composited layers
    // alive and showed up as a large style-recalc cost on every scroll frame,
    // so the hint is released as soon as each tween settles.
    const release = () => gsap.set(parts, { willChange: "auto" });

    const tween = show
      ? gsap.to(parts, {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger,
          delay,
          overwrite: "auto",
          onComplete: release,
        })
      : gsap.to(parts, {
          yPercent: 108,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          stagger: stagger * 0.4,
          overwrite: "auto",
          onComplete: release,
        });

    return () => {
      tween.kill();
    };
  }, [show, stagger, delay]);

  return (
    <Tag ref={root as never} className={className} aria-label={text.replace(/\n/g, " ")}>
      {lines.map((line, li) => (
        <span key={li} className="reveal-line" aria-hidden>
          {split === "chars"
            ? Array.from(line).map((ch, ci) => (
                <span key={ci} data-part>
                  {ch === " " ? " " : ch}
                </span>
              ))
            : line.split(" ").map((word, wi, arr) => (
                // The separating space must be a direct text child of the line,
                // not tucked inside a wrapper span: whitespace at the edge of an
                // inline-block is trimmed, which ran every word together. As a
                // sibling it renders, and it gives the line somewhere to wrap.
                <Fragment key={wi}>
                  <span data-part>{word}</span>
                  {wi < arr.length - 1 ? " " : null}
                </Fragment>
              ))}
        </span>
      ))}
    </Tag>
  );
}
