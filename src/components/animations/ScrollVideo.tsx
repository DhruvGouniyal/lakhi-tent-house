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

/**
 * Frame rate of the source clips. Seeks are snapped to this grid; asking for
 * times between real frames costs a decode and shows nothing new.
 */
const SOURCE_FPS = 24;

interface Props {
  src: string;
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
 * `currentTime`. Three details make that actually smooth:
 *
 *  1. **Seek pump on rAF.** Scroll only records a target; a frame loop applies
 *     it when `video.seeking` is false. Driving this from the `seeked` event
 *     instead wedged permanently whenever that event failed to arrive.
 *  2. **The element is conditionally mounted.** It exists only while the scene
 *     is in range, so one media pipeline is alive rather than sixteen.
 *  3. **Seek slack.** Deltas under a frame are ignored, so a paused scroll
 *     doesn't thrash the decoder.
 *
 * If the file is missing the component degrades to a procedural canvas scene
 * rather than showing a broken frame.
 */
const ScrollVideo = forwardRef<ScrollVideoHandle, Props>(function ScrollVideo(
  { src, active, variant, accent, fog, preferFallback = false, className = "" },
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

      const raw = targetTimeRef.current * v.duration * 0.999;

      // Snap to the source clip's own frame grid. The clips are 24fps, so a
      // display running at 60Hz was asking for a new seek three times per
      // available frame — two of those decode to the identical picture and
      // are pure waste. Quantising drops seek traffic by ~60% and is
      // invisible, because there is no in-between frame to show.
      const quantised = Math.round(raw * SOURCE_FPS) / SOURCE_FPS;
      if (Math.abs(v.currentTime - quantised) < 1 / (SOURCE_FPS * 2)) return;

      try {
        v.currentTime = quantised;
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
  // Depends on the same flags that gate the element's existence: the <video>
  // is now mounted conditionally, so an effect that ran only once would attach
  // its listeners to nothing and the clip would never report ready.
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
  }, [useVideo, active]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/*
        The element itself only exists while the scene is in range. Keeping
        sixteen <video> elements mounted held sixteen media pipelines alive for
        the whole session; `active` covers the scene's window plus its overlap,
        so the element is created well before the layer becomes visible and
        there is no pop-in.
      */}
      {useVideo && active && (
        <video
          ref={videoRef}
          preload="metadata"
          muted
          playsInline
          disablePictureInPicture
          aria-hidden
          className="h-full w-full object-cover"
          style={{ opacity: status === "ready" ? 1 : 0, transition: "opacity 420ms ease" }}
        />
      )}

      {/*
        Procedural stand-in, shown until a real clip is ready.

        Gated on `active` as well as readiness. Every layer sits inside the
        same always-on-screen sticky stage, so an IntersectionObserver inside
        the canvas can't tell that fifteen of these are invisible — they all
        "intersect" the viewport at all times. Without this gate all sixteen
        ran a full rAF gradient-painting loop on every frame, which was the
        single largest cause of scroll jank.
      */}
      {active && (!useVideo || status !== "ready") && (
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
