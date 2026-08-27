"use client";

import { RefObject } from "react";
import CinematicSection from "../animations/CinematicSection";
import SceneCaption from "../ui/SceneCaption";
import type { SceneConfig, SceneId } from "@/lib/scenes";

type Placement = "center" | "bottom-left" | "bottom-right" | "top-left";

/**
 * Copy placement per beat. Varied deliberately: identical framing on every
 * scene is what makes a scroll site feel like a template.
 */
const PLACEMENT: Partial<Record<SceneId, Placement>> = {
  drinks: "bottom-right",
  breakfast: "bottom-left",
  starters: "bottom-right",
  "main-course": "center",
  "breads-rice": "top-left",
  asian: "center",
  desserts: "bottom-right",
};

/**
 * The default beat.
 *
 * Handles every scene that needs no bespoke behaviour, and every filmed
 * transition — a transition is simply a beat with no copy, which is why it
 * needs no component of its own.
 */
export default function StoryScene({
  scene,
  filmRef,
}: {
  scene: SceneConfig;
  filmRef: RefObject<HTMLElement | null>;
}) {
  return (
    <CinematicSection scene={scene} filmRef={filmRef}>
      {scene.kind === "scene" && (
        <SceneCaption
          scene={scene}
          filmRef={filmRef}
          placement={PLACEMENT[scene.id] ?? "bottom-left"}
        />
      )}
    </CinematicSection>
  );
}
