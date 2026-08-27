"use client";

import { RefObject, useEffect, useRef } from "react";
import type { PlaceholderVariant } from "@/lib/scenes";

interface Props {
  variant: PlaceholderVariant;
  accent: string;
  fog: string;
  /** Live scroll progress for this scene, 0..1. Read on our own rAF. */
  progressRef: RefObject<number>;
}

/**
 * Procedural stand-in for a not-yet-generated clip.
 *
 * Deliberately abstract: soft rim-lit silhouettes in the scene's own accent,
 * volumetric haze and a moving key light, all driven by the same scroll
 * progress the real video will use. It reads as an unlit set rather than a
 * broken asset — and it doubles as the mobile path, where scrubbing a real
 * video would be far too heavy.
 */
export default function ScenePlaceholder({ variant, accent, fog, progressRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Don't burn frames on a scene that is off screen.
    const io = new IntersectionObserver(
      ([e]) => {
        visibleRef.current = e.isIntersecting;
      },
      { rootMargin: "20%" }
    );
    io.observe(canvas);

    const start = performance.now();

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (!visibleRef.current || w === 0) return;

      const p = Math.min(1, Math.max(0, progressRef.current ?? 0));
      const t = (now - start) / 1000;

      ctx.clearRect(0, 0, w, h);
      paintScene(ctx, { w, h, p, t, accent, fog, variant });
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
    };
  }, [variant, accent, fog, progressRef]);

  // img-blend feathers the canvas edges so the drawn set dissolves into the
  // room instead of ending on a hard rectangle.
  return <canvas ref={canvasRef} className="img-blend h-full w-full" aria-hidden />;
}

/* ------------------------------------------------------------------ */
/* painting                                                            */
/* ------------------------------------------------------------------ */

interface PaintArgs {
  w: number;
  h: number;
  p: number;
  t: number;
  accent: string;
  fog: string;
  variant: PlaceholderVariant;
}

const ease = (x: number) => 1 - Math.pow(1 - x, 3);

function paintScene(ctx: CanvasRenderingContext2D, a: PaintArgs) {
  const { w, h, p, t, accent, fog, variant } = a;

  // --- atmosphere: a key light that drifts as the camera moves -------------
  const lightX = w * (0.5 + Math.sin(t * 0.12) * 0.04 + (p - 0.5) * 0.08);
  const lightY = h * (0.4 - p * 0.06);
  const bloom = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, h * (0.75 + p * 0.3));
  bloom.addColorStop(0, withAlpha(fog, 0.5));
  bloom.addColorStop(0.45, withAlpha(fog, 0.16));
  bloom.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);

  // --- camera: every scene dollies slightly through its window -------------
  const zoom = 1 + p * 0.16;
  ctx.save();
  ctx.translate(w / 2, h * 0.58);
  ctx.scale(zoom, zoom);

  const s = Math.min(w, h);
  const paint: Record<PlaceholderVariant, () => void> = {
    table: () => drawTable(ctx, s, p, t, accent),
    glass: () => drawGlass(ctx, s, p, t, accent),
    plate: () => drawPlate(ctx, s, p, accent),
    counter: () => drawCounter(ctx, s, p, t, accent),
    platter: () => drawPlatter(ctx, s, p, accent),
    handi: () => drawHandi(ctx, s, p, t, accent),
    tandoor: () => drawTandoor(ctx, s, p, t, accent),
    wok: () => drawWok(ctx, s, p, t, accent),
    dessert: () => drawDessert(ctx, s, p, accent),
    banquet: () => drawBanquet(ctx, s, p, t, accent),
  };
  paint[variant]();

  ctx.restore();

  // --- haze drifting in front of the subject -------------------------------
  drawHaze(ctx, w, h, t, p, fog);
}

function withAlpha(hex: string, alpha: number) {
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${alpha})`;
}

/** Soft rim-lit fill used by every silhouette, so the set feels consistent. */
function rimFill(ctx: CanvasRenderingContext2D, s: number, accent: string, strength = 1) {
  const g = ctx.createLinearGradient(0, -s * 0.35, 0, s * 0.2);
  g.addColorStop(0, withAlpha(accent, 0.55 * strength));
  g.addColorStop(0.5, withAlpha(accent, 0.16 * strength));
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  return g;
}

function surfaceLine(ctx: CanvasRenderingContext2D, s: number, accent: string, y: number) {
  const g = ctx.createLinearGradient(-s * 0.8, 0, s * 0.8, 0);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.5, withAlpha(accent, 0.42));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.strokeStyle = g;
  ctx.lineWidth = Math.max(1, s * 0.003);
  ctx.beginPath();
  ctx.moveTo(-s * 0.8, y);
  ctx.lineTo(s * 0.8, y);
  ctx.stroke();
}

/* --- 01 empty table ------------------------------------------------------ */
function drawTable(ctx: CanvasRenderingContext2D, s: number, p: number, t: number, accent: string) {
  surfaceLine(ctx, s, accent, 0);

  // tabletop ellipse catching the light
  ctx.beginPath();
  ctx.ellipse(0, s * 0.02, s * 0.62, s * 0.075, 0, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(0, s * 0.02, 0, 0, s * 0.02, s * 0.62);
  g.addColorStop(0, withAlpha(accent, 0.18));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fill();

  // two candle flames waking up as the scene begins
  [-0.26, 0.26].forEach((off, i) => {
    const flicker = 0.85 + Math.sin(t * 3.1 + i * 2) * 0.15;
    const alpha = ease(Math.min(1, p * 2.2)) * flicker;
    const cx = s * off;
    const cy = -s * 0.06;
    const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.14);
    fg.addColorStop(0, withAlpha(accent, 0.75 * alpha));
    fg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* --- 02 welcome glass ---------------------------------------------------- */
function drawGlass(ctx: CanvasRenderingContext2D, s: number, p: number, t: number, accent: string) {
  surfaceLine(ctx, s, accent, s * 0.02);
  ctx.save();
  ctx.rotate(Math.sin(t * 0.25) * 0.012 + (p - 0.5) * 0.05); // slow settle

  const bowlTop = -s * 0.3;
  const bowlBottom = -s * 0.02;

  // bowl
  ctx.beginPath();
  ctx.moveTo(-s * 0.11, bowlTop);
  ctx.bezierCurveTo(-s * 0.115, bowlBottom - s * 0.02, -s * 0.05, bowlBottom, 0, bowlBottom);
  ctx.bezierCurveTo(s * 0.05, bowlBottom, s * 0.115, bowlBottom - s * 0.02, s * 0.11, bowlTop);
  ctx.closePath();
  ctx.fillStyle = rimFill(ctx, s, accent, 0.9);
  ctx.fill();
  ctx.strokeStyle = withAlpha(accent, 0.5);
  ctx.lineWidth = Math.max(1, s * 0.0028);
  ctx.stroke();

  // liquid rising with scroll
  const fill = ease(Math.min(1, p * 1.6));
  const level = bowlBottom - (bowlBottom - bowlTop) * 0.82 * fill;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-s * 0.11, bowlTop);
  ctx.bezierCurveTo(-s * 0.115, bowlBottom - s * 0.02, -s * 0.05, bowlBottom, 0, bowlBottom);
  ctx.bezierCurveTo(s * 0.05, bowlBottom, s * 0.115, bowlBottom - s * 0.02, s * 0.11, bowlTop);
  ctx.closePath();
  ctx.clip();
  const lg = ctx.createLinearGradient(0, level, 0, bowlBottom);
  lg.addColorStop(0, withAlpha(accent, 0.92));
  lg.addColorStop(1, withAlpha(accent, 0.45));
  ctx.fillStyle = lg;
  ctx.fillRect(-s * 0.12, level, s * 0.24, bowlBottom - level);
  ctx.restore();

  // stem + foot
  ctx.strokeStyle = withAlpha(accent, 0.45);
  ctx.beginPath();
  ctx.moveTo(0, bowlBottom);
  ctx.lineTo(0, s * 0.0);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, s * 0.02, s * 0.062, s * 0.012, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/* --- 03 breakfast plate -------------------------------------------------- */
function drawPlate(ctx: CanvasRenderingContext2D, s: number, p: number, accent: string) {
  surfaceLine(ctx, s, accent, s * 0.06);
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.3, s * 0.075, 0, 0, Math.PI * 2);
  ctx.fillStyle = rimFill(ctx, s, accent, 0.7);
  ctx.fill();
  ctx.strokeStyle = withAlpha(accent, 0.4);
  ctx.lineWidth = Math.max(1, s * 0.0025);
  ctx.stroke();

  // dishes arriving one after another
  const count = 5;
  for (let i = 0; i < count; i++) {
    const appear = Math.min(1, Math.max(0, p * count - i));
    if (appear <= 0) continue;
    const ang = (i / count) * Math.PI * 2 + 0.5;
    const rx = Math.cos(ang) * s * 0.17;
    const ry = Math.sin(ang) * s * 0.04;
    const r = s * 0.045 * ease(appear);
    ctx.beginPath();
    ctx.ellipse(rx, ry - s * 0.012, r, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(accent, 0.3 + 0.3 * appear);
    ctx.fill();
  }
}

/* --- 04 live counters (lateral travel) ----------------------------------- */
function drawCounter(ctx: CanvasRenderingContext2D, s: number, p: number, t: number, accent: string) {
  ctx.save();
  ctx.translate(-(p - 0.5) * s * 1.5, 0); // the camera walks the line

  const stations = 6;
  for (let i = 0; i < stations; i++) {
    const x = (i - (stations - 1) / 2) * s * 0.42;
    const depth = 1 - Math.abs(x) / (s * 1.6); // fake depth falloff
    const a = Math.max(0.12, depth);

    // canopy arch
    ctx.beginPath();
    ctx.moveTo(x - s * 0.15, -s * 0.05);
    ctx.quadraticCurveTo(x, -s * 0.3, x + s * 0.15, -s * 0.05);
    ctx.strokeStyle = withAlpha(accent, 0.38 * a);
    ctx.lineWidth = Math.max(1, s * 0.004);
    ctx.stroke();

    // counter block
    ctx.fillStyle = rimFill(ctx, s, accent, 0.55 * a);
    ctx.fillRect(x - s * 0.15, -s * 0.05, s * 0.3, s * 0.11);

    // burner glow, breathing
    const flick = 0.7 + Math.sin(t * 2.4 + i) * 0.3;
    const gy = -s * 0.06;
    const g = ctx.createRadialGradient(x, gy, 0, x, gy, s * 0.1);
    g.addColorStop(0, withAlpha(accent, 0.6 * a * flick));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, gy, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  surfaceLine(ctx, s, accent, s * 0.06);
}

/* --- 05 starters platter (orbit) ----------------------------------------- */
function drawPlatter(ctx: CanvasRenderingContext2D, s: number, p: number, accent: string) {
  const orbit = p * Math.PI * 0.6 - Math.PI * 0.3;
  const squash = 0.06 + Math.abs(Math.sin(orbit)) * 0.05;

  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.34, s * squash * 1.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = rimFill(ctx, s, accent, 0.75);
  ctx.fill();
  ctx.strokeStyle = withAlpha(accent, 0.45);
  ctx.lineWidth = Math.max(1, s * 0.0025);
  ctx.stroke();

  const items = 9;
  for (let i = 0; i < items; i++) {
    const appear = Math.min(1, Math.max(0, p * 1.4 * items - i) / 1.4);
    if (appear <= 0) continue;
    const ang = (i / items) * Math.PI * 2 + orbit;
    const rx = Math.cos(ang) * s * 0.22;
    const ry = Math.sin(ang) * s * squash;
    const r = s * 0.032 * ease(appear);
    ctx.beginPath();
    ctx.arc(rx, ry - s * 0.014, r, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(accent, 0.75 * appear);
    ctx.fill();
  }
}

/* --- 06 main course handi ------------------------------------------------ */
function drawHandi(ctx: CanvasRenderingContext2D, s: number, p: number, t: number, accent: string) {
  surfaceLine(ctx, s, accent, s * 0.14);

  // body
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, -s * 0.06);
  ctx.bezierCurveTo(-s * 0.26, s * 0.1, -s * 0.13, s * 0.14, 0, s * 0.14);
  ctx.bezierCurveTo(s * 0.13, s * 0.14, s * 0.26, s * 0.1, s * 0.2, -s * 0.06);
  ctx.closePath();
  ctx.fillStyle = rimFill(ctx, s, accent, 1.15);
  ctx.fill();
  ctx.strokeStyle = withAlpha(accent, 0.6);
  ctx.lineWidth = Math.max(1, s * 0.003);
  ctx.stroke();

  // rim
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.06, s * 0.2, s * 0.032, 0, 0, Math.PI * 2);
  ctx.fillStyle = withAlpha(accent, 0.35);
  ctx.fill();
  ctx.stroke();

  // lid lifting away as the dish is revealed
  const lift = ease(Math.min(1, p * 1.5)) * s * 0.22;
  if (lift > 1) {
    ctx.save();
    ctx.globalAlpha = 1 - ease(Math.min(1, p * 1.5)) * 0.65;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.08 - lift, s * 0.19, s * 0.045, 0, Math.PI, 0);
    ctx.fillStyle = withAlpha(accent, 0.4);
    ctx.fill();
    ctx.restore();
  }

  drawSteam(ctx, s, t, Math.min(1, p * 1.8), accent, -s * 0.1);
}

/* --- 07 tandoor ---------------------------------------------------------- */
function drawTandoor(ctx: CanvasRenderingContext2D, s: number, p: number, t: number, accent: string) {
  // cylindrical oven mouth
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.02, s * 0.19, s * 0.055, 0, 0, Math.PI * 2);
  const fire = ctx.createRadialGradient(0, -s * 0.02, 0, 0, -s * 0.02, s * 0.19);
  const flick = 0.75 + Math.sin(t * 3.6) * 0.25;
  fire.addColorStop(0, withAlpha(accent, 0.95 * flick));
  fire.addColorStop(0.6, withAlpha(accent, 0.35));
  fire.addColorStop(1, "rgba(0,0,0,0.7)");
  ctx.fillStyle = fire;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-s * 0.19, -s * 0.02);
  ctx.lineTo(-s * 0.15, s * 0.2);
  ctx.lineTo(s * 0.15, s * 0.2);
  ctx.lineTo(s * 0.19, -s * 0.02);
  ctx.closePath();
  ctx.fillStyle = rimFill(ctx, s, accent, 0.7);
  ctx.fill();

  // breads lifting out one by one
  const breads = 3;
  for (let i = 0; i < breads; i++) {
    const a = Math.min(1, Math.max(0, p * breads - i));
    if (a <= 0) continue;
    const y = -s * 0.05 - ease(a) * s * 0.26;
    ctx.beginPath();
    ctx.ellipse((i - 1) * s * 0.13, y, s * 0.075 * ease(a), s * 0.022 * ease(a), 0, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(accent, 0.75 * a);
    ctx.fill();
  }
}

/* --- 08 wok -------------------------------------------------------------- */
function drawWok(ctx: CanvasRenderingContext2D, s: number, p: number, t: number, accent: string) {
  // flame under the pan, keyed to scroll
  const heat = ease(Math.min(1, p * 1.7));
  const flick = 0.7 + Math.sin(t * 6) * 0.3;
  const fg = ctx.createRadialGradient(0, s * 0.1, 0, 0, s * 0.1, s * 0.3 * (0.4 + heat));
  fg.addColorStop(0, withAlpha(accent, 0.85 * heat * flick));
  fg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(0, s * 0.1, s * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // pan
  ctx.beginPath();
  ctx.moveTo(-s * 0.26, -s * 0.04);
  ctx.quadraticCurveTo(0, s * 0.19, s * 0.26, -s * 0.04);
  ctx.strokeStyle = withAlpha(accent, 0.7);
  ctx.lineWidth = Math.max(1.5, s * 0.006);
  ctx.stroke();
  ctx.fillStyle = rimFill(ctx, s, accent, 0.5);
  ctx.fill();

  // ingredients tossed in an arc
  const toss = Math.max(0, (p - 0.35) / 0.5);
  if (toss > 0) {
    const n = 12;
    for (let i = 0; i < n; i++) {
      const ph = (toss * 1.4 + i / n) % 1;
      const x = (i / n - 0.5) * s * 0.34;
      const y = -Math.sin(ph * Math.PI) * s * 0.24 - s * 0.02;
      const r = s * 0.011;
      ctx.beginPath();
      ctx.arc(x + Math.sin(t * 2 + i) * s * 0.008, y, r, 0, Math.PI * 2);
      ctx.fillStyle = withAlpha(accent, 0.5 + 0.4 * Math.sin(ph * Math.PI));
      ctx.fill();
    }
  }

  drawSteam(ctx, s, t, Math.max(0, (p - 0.55) / 0.45), accent, -s * 0.06);
}

/* --- 09 dessert ---------------------------------------------------------- */
function drawDessert(ctx: CanvasRenderingContext2D, s: number, p: number, accent: string) {
  surfaceLine(ctx, s, accent, s * 0.08);
  ctx.beginPath();
  ctx.ellipse(0, s * 0.05, s * 0.17, s * 0.04, 0, 0, Math.PI * 2);
  ctx.fillStyle = rimFill(ctx, s, accent, 0.6);
  ctx.fill();

  // a single dome, revealed then pulled away from
  const r = s * 0.085 * ease(Math.min(1, p * 2));
  ctx.beginPath();
  ctx.arc(0, s * 0.01, r, Math.PI, 0);
  ctx.lineTo(-r, s * 0.02);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -r, 0, s * 0.03);
  g.addColorStop(0, withAlpha(accent, 0.85));
  g.addColorStop(1, withAlpha(accent, 0.25));
  ctx.fillStyle = g;
  ctx.fill();

  // drizzle
  if (p > 0.45) {
    const d = Math.min(1, (p - 0.45) / 0.4);
    ctx.strokeStyle = withAlpha(accent, 0.8 * d);
    ctx.lineWidth = Math.max(1, s * 0.004);
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.5);
    ctx.quadraticCurveTo(0, -r * 1.1 - s * 0.03 * d, r * 0.7, -r * 0.5);
    ctx.stroke();
  }
}

/* --- 10 banquet (camera pulls back) -------------------------------------- */
function drawBanquet(ctx: CanvasRenderingContext2D, s: number, p: number, t: number, accent: string) {
  const back = 1 - ease(p) * 0.55; // pull back to reveal the whole room
  ctx.save();
  ctx.scale(back, back);

  const rows = 3;
  for (let r = 0; r < rows; r++) {
    const y = s * (0.02 + r * 0.11);
    const spread = s * (0.5 + r * 0.28);
    const a = 0.5 - r * 0.13;
    surfaceLine(ctx, spread / 0.8, accent, y);

    const lights = 7 + r * 3;
    for (let i = 0; i < lights; i++) {
      const x = ((i / (lights - 1)) - 0.5) * spread * 1.7;
      const appear = Math.min(1, Math.max(0, p * 1.6 - r * 0.15 - (i / lights) * 0.3));
      if (appear <= 0) continue;
      const flick = 0.8 + Math.sin(t * 2 + i * 1.3 + r) * 0.2;
      const rad = s * 0.05 * appear;
      const g = ctx.createRadialGradient(x, y - s * 0.02, 0, x, y - s * 0.02, rad);
      g.addColorStop(0, withAlpha(accent, a * flick));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y - s * 0.02, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/* --- shared effects ------------------------------------------------------ */
function drawSteam(
  ctx: CanvasRenderingContext2D,
  s: number,
  t: number,
  amount: number,
  accent: string,
  baseY: number
) {
  if (amount <= 0) return;
  const wisps = 5;
  for (let i = 0; i < wisps; i++) {
    const ph = (t * 0.18 + i / wisps) % 1;
    const y = baseY - ph * s * 0.34;
    const x = Math.sin(ph * 5 + i * 2) * s * 0.05;
    const r = s * (0.03 + ph * 0.07);
    const alpha = amount * (1 - ph) * 0.2;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, withAlpha(accent, alpha));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHaze(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  p: number,
  fog: string
) {
  const layers = 3;
  for (let i = 0; i < layers; i++) {
    const ph = (t * 0.02 + i / layers) % 1;
    const x = w * (ph * 1.4 - 0.2);
    const y = h * (0.55 + Math.sin(t * 0.1 + i) * 0.08);
    const r = h * (0.35 + i * 0.12);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, withAlpha(fog, 0.05 + p * 0.03));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}
