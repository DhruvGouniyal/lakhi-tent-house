"use client";

import type { SceneConfig } from "@/lib/scenes";

/**
 * How a scene arrives and leaves.
 *
 * These are deliberately *physical* moves — the camera dollies, the table
 * surface wipes the next course in, the room turns — rather than fades. The
 * exit of one scene and the entrance of the next overlap on the timeline
 * (see the overlap constants in scenes.ts), so the cut is always hidden inside
 * a movement.
 *
 * NO BLUR. An earlier version animated `filter: blur()` on these layers, which
 * looked good and cost far too much: each layer is a full-viewport element
 * containing a decoding video, two or three overlap during a hand-off, and
 * blurring them dropped scrolling to ~24fps with 500ms+ frames. Depth now comes
 * from scale and brightness, which composite on the GPU for free.
 */
export interface TransformState {
  scale: number;
  y: string;
  x: string;
  rotate: number;
  opacity: number;
  filter: string;
  clipPath: string;
}

const FULL: TransformState = {
  scale: 1,
  y: "0%",
  x: "0%",
  rotate: 0,
  opacity: 1,
  filter: "brightness(1)",
  clipPath: "inset(0% 0% 0% 0%)",
};

export const restingState = (): TransformState => ({ ...FULL });

/** State the scene animates *from* as it enters. */
export function enterState(scene: SceneConfig): TransformState {
  // A filmed transition is already doing the work — moving it as well would
  // fight the footage. It just crossfades in.
  if (scene.kind === "transition") {
    return { ...FULL, opacity: 0, filter: "brightness(0.85)" };
  }

  switch (scene.camera) {
    case "hold":
      return { ...FULL, opacity: 0, filter: "brightness(0.8)" };
    case "push":
      // Camera is still far back, then settles onto the subject.
      return { ...FULL, scale: 1.18, opacity: 0, filter: "brightness(0.6)" };
    case "pull":
      // We start tight on the previous subject and retreat to find this one.
      return { ...FULL, scale: 0.86, opacity: 0, filter: "brightness(0.65)" };
    case "travel":
      // The room slides past — used where the camera walks the counter line.
      return { ...FULL, x: "10%", scale: 1.08, opacity: 0, filter: "brightness(0.7)" };
    case "orbit":
      // Arc in around the platter.
      return { ...FULL, scale: 1.12, rotate: 1.8, opacity: 0, filter: "brightness(0.7)" };
  }
}

/** State the scene animates *to* as the next one takes over. */
export function exitState(scene: SceneConfig): TransformState {
  if (scene.kind === "transition") {
    return { ...FULL, opacity: 0, filter: "brightness(0.75)" };
  }

  switch (scene.camera) {
    case "hold":
      return { ...FULL, opacity: 0, filter: "brightness(0.55)" };
    case "push":
      // Keep pushing past the subject — it slides out toward us.
      return { ...FULL, scale: 1.24, opacity: 0, filter: "brightness(0.45)" };
    case "pull":
      return { ...FULL, scale: 0.8, opacity: 0, filter: "brightness(0.45)" };
    case "travel":
      return { ...FULL, x: "-10%", scale: 1.06, opacity: 0, filter: "brightness(0.45)" };
    case "orbit":
      return { ...FULL, scale: 0.9, rotate: -1.8, opacity: 0, filter: "brightness(0.45)" };
  }
}

/**
 * A surface wipe used on some scenes: the table plane rises and carries the
 * next course in, instead of the layer simply appearing. Never on a filmed
 * transition — the clip is the transition.
 */
export const usesSurfaceWipe = (scene: SceneConfig) =>
  scene.kind === "scene" && scene.index % 4 === 3;

export const WIPE_FROM = "inset(100% 0% 0% 0%)";
export const WIPE_TO = "inset(0% 0% 0% 0%)";
