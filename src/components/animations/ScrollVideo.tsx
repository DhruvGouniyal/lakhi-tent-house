"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { PlaceholderVariant } from "@/lib/scenes";
import { clamp } from "@/lib/hooks";
import ScenePlaceholder from "./ScenePlaceholder";

export interface ScrollVideoHandle {
  /** Drive the film. `p` is 0..1 across this scene's scroll window. */
  seek: (p: number) => void;
}

type Status = "idle" | "loading" | "ready" | "missing";

interface Props {
  src: string;
  poster?: string;
  /** Scene is in or near the viewport. Drives load/unload. */
  active: boolean;
  /** Drawn when the video file is absent, or on mobile. */
  variant: PlaceholderVariant;
  accent: string;
  fog: string;
  /** Skip the video entirely (mobile / reduced motion) and draw the fallback. */
  preferFallback?: boolean;
  className?: string;
}

/**
 * Scroll-scrubbed video.
 *
 * The video never plays itself — scroll position maps straight onto
 * `currentTime`. Two details make that actually smooth:
 *
 *  1. **Seek queue.** Assigning `currentTime` while a previous seek is still
 *     resolving makes browsers drop requests and stutter. We keep only the
 *     latest target and re-issue it on `seeked`.
 *  2. **Lazy activation.** `src` is attached only when the scene is near the
 *     viewport and detached when it leaves, so ten clips never decode at once.
 *
 * If the file is missing the component degrades to a procedural canvas scene
 * rather than showing a broken frame — which is why the prototype looks
 * finished before a single clip exists.
 */
const ScrollVideo = forwardRef<ScrollVideoHandle, Props>(function ScrollVideo(
  { src, poster, active, variant, accent, fog, preferFallback = false, className = "" },
  ref
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef(0);
  const targetTimeRef = useRef(0);
  const [status, setStatus] = useState<Status>("idle");

  const useVideo = !preferFallback && status !== "missing";

  useImperativeHandle(
    ref,
    () => ({
      // Recording the target is all this does. Applying it is the rAF loop's
      // job, which keeps scroll handling cheap and the seeking self-healing.
      seek: (p: number) => {
        const clamped = clamp(p);
        progressRef.current = clamped;
        targetTimeRef.current = clamped;
      },
    }),
    []
  );

  /**
   * Seek pump.
   *
   * An earlier version queued seeks off the `seeked` event and kept a "busy"
   * flag. If that event never arrived — which happens when a seek is issued
   * during a decode or at a low readyState — the flag stayed set and the clip
   * froze, most visibly when scrolling back up. Reading `video.seeking` each
   * frame instead means a dropped event costs one frame rather than wedging
   * playback permanently.
   */
  useEffect(() => {
    if (!useVideo || !active) return;
    let raf = 0;

    const pump = () => {
      raf = requestAnimationFrame(pump);
      const v = videoRef.current;
      if (!v || v.seeking || !v.duration || !isFinite(v.duration)) return;

      const target = targetTimeRef.current * v.duration * 0.999;
      // A frame's worth of slack, so tiny deltas don't thrash the decoder.
      if (Math.abs(v.currentTime - target) < 1 / 50) return;

      try {
        v.currentTime = target;
      } catch {
        /* element torn down mid-frame — the next tick retries */
      }
    };

    raf = requestAnimationFrame(pump);
    return () => cancelAnimationFrame(raf);
  }, [useVideo, active]);

  // Attach/detach the source as the scene enters and leaves.
  useEffect(() => {
    if (preferFallback) return;
    const v = videoRef.current;
    if (!v) return;

    if (active) {
      if (!v.getAttribute("src")) {
        setStatus("loading");
        v.setAttribute("src", src);
        v.load();
      }
      return;
    }

    // Leaving: release the decoder and buffered data.
    if (v.getAttribute("src")) {
      v.removeAttribute("src");
      v.load();
      setStatus("idle");
    }
  }, [active, src, preferFallback]);

  // Element lifecycle. All listeners are removed on unmount — no leaks.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onMeta = () => {
      v.pause(); // never let it play on its own
      setStatus("ready");
    };
    const onError = () => {
      // Missing file is the expected case before clips are generated.
      if (v.getAttribute("src")) setStatus("missing");
    };
    const onPlay = () => v.pause();

    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("error", onError);
    v.addEventListener("play", onPlay);

    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("error", onError);
      v.removeEventListener("play", onPlay);
      v.removeAttribute("src");
      v.load();
    };
  }, []);

  return (
    <div className={`absolute inset-0 ${className}`}>
      {useVideo && (
        <video
          ref={videoRef}
          poster={poster}
          preload="metadata"
          muted
          playsInline
          disablePictureInPicture
          aria-hidden
          className="h-full w-full object-cover"
          style={{ opacity: status === "ready" ? 1 : 0, transition: "opacity 420ms ease" }}
        />
      )}

      {/* Procedural stand-in: shown until a real clip is dropped in. */}
      {(!useVideo || status !== "ready") && (
        <ScenePlaceholder
          variant={variant}
          accent={accent}
          fog={fog}
          progressRef={progressRef}
        />
      )}
    </div>
  );
});

export default ScrollVideo;
