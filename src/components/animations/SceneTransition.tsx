"use client";

import type { SceneConfig } from "@/lib/scenes";

/**
 * How a scene arrives and leaves.
 *
 * These are deliberately *physical* moves — the camera dollies, the table
 * surface wipes the next course in, the room turns — rather than fades. The
 * exit of one scene and the entrance of the next overlap on the timeline
 * (see SCENE_OVERLAP_VH), so the cut is always hidden inside a movement.
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
  filter: "blur(0px) brightness(1)",
  clipPath: "inset(0% 0% 0% 0%)",
};

export const restingState = (): TransformState => ({ ...FULL });

/** State the scene animates *from* as it enters. */
export function enterState(scene: SceneConfig): TransformState {
  // A filmed transition is already doing the work — pushing or blurring it as
  // well would fight the footage. It just crossfades in.
  if (scene.kind === "transition") {
    return { ...FULL, opacity: 0, filter: "blur(4px) brightness(0.8)" };
  }

  switch (scene.camera) {
    case "hold":
      return { ...FULL, opacity: 0, filter: "blur(6px) brightness(0.75)" };
    case "push":
      // Camera is still far back and out of focus, then settles onto the subject.
      return {
        ...FULL,
        scale: 1.28,
        opacity: 0,
        filter: "blur(16px) brightness(0.55)",
      };
    case "pull":
      // We start tight on the previous subject and retreat to find this one.
      return {
        ...FULL,
        scale: 0.78,
        opacity: 0,
        filter: "blur(12px) brightness(0.6)",
      };
    case "travel":
      // The room slides past — used where the camera walks the counter line.
      return {
        ...FULL,
        x: "14%",
        scale: 1.1,
        opacity: 0,
        filter: "blur(10px) brightness(0.7)",
      };
    case "orbit":
      // Arc in around the platter.
      return {
        ...FULL,
        scale: 1.16,
        rotate: 2.4,
        opacity: 0,
        filter: "blur(12px) brightness(0.65)",
      };
  }
}

/** State the scene animates *to* as the next one takes over. */
export function exitState(scene: SceneConfig): TransformState {
  if (scene.kind === "transition") {
    return { ...FULL, opacity: 0, filter: "blur(4px) brightness(0.7)" };
  }

  switch (scene.camera) {
    case "hold":
      return { ...FULL, opacity: 0, filter: "blur(8px) brightness(0.5)" };
    case "push":
      // Keep pushing past the subject — it slides out of focus toward us.
      return {
        ...FULL,
        scale: 1.35,
        opacity: 0,
        filter: "blur(18px) brightness(0.4)",
      };
    case "pull":
      return {
        ...FULL,
        scale: 0.72,
        opacity: 0,
        filter: "blur(14px) brightness(0.35)",
      };
    case "travel":
      return {
        ...FULL,
        x: "-14%",
        scale: 1.08,
        opacity: 0,
        filter: "blur(12px) brightness(0.4)",
      };
    case "orbit":
      return {
        ...FULL,
        scale: 0.86,
        rotate: -2.4,
        opacity: 0,
        filter: "blur(14px) brightness(0.4)",
      };
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
