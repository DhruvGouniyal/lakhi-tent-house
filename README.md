# LAKHI TENT HOUSE & CATERS — cinematic scroll prototype

The whole page is **one continuous shot**: sixteen beats — ten scenes and six
filmed transitions — share a single pinned viewport and hand off through
overlapping scroll windows, so nothing ever hard-cuts between sections. All
sixteen clips are generated and wired in; scroll drives every frame.

```bash
npm run dev     # http://localhost:3000
npm run build
```

Stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · GSAP +
ScrollTrigger · Lenis. Nothing else.

---

## Swapping a clip

Overwrite the file in `public/videos/` (names in
[`src/lib/scenes.ts`](src/lib/scenes.ts)) and reload — no code change. Also drop
a smaller copy in `public/videos/mobile/`, which is what phones load:

```bash
ffmpeg -i new.mp4 -vf scale=640:-2 -c:v libx264 -crf 27 -g 12 -keyint_min 12 \
       -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart -an \
       public/videos/mobile/<name>.mp4
```

A missing file stays a supported state, not an error: that scene falls back to a
procedural canvas set drawn from the same scroll progress the video would have
used, and the rest of the film is unaffected.

**Encode for scrubbing.** Seeking is only as precise as the keyframe interval:

```bash
ffmpeg -i in.mp4 -c:v libx264 -crf 22 -g 12 -keyint_min 12 \
       -sc_threshold 0 -movflags +faststart -an out.mp4
```

`-g 12` puts a keyframe roughly every half second at 24fps, which is what makes
`currentTime` land instantly instead of decoding a long GOP. Strip audio — the
film never plays sound.

---

## Retiming the film

Everything lives in `src/lib/scenes.ts`. Each scene declares its scroll length
in viewport heights, its video, its room palette, and its camera intent
(`push` / `pull` / `travel` / `orbit`). Change `scrollVh` and that beat gets
longer or shorter; every downstream scene, the chapter rail and the
environment cross-fade follow automatically.

`SCENE_OVERLAP_VH` (58) and `TRANSITION_OVERLAP_VH` (28) control how far
neighbouring beats bleed into each other. Raise for softer hand-offs, lower for
sharper ones.

### Matching scroll length to clip duration

`scrollVh` decides how much scrolling it takes to play one second of footage.
Get this wrong and a scene either races past or feels stuck, even though nothing
is broken.

```
scenes      scrollVh ≈ clip seconds × 17
transitions scrollVh ≈ clip seconds × 12   (connective tissue passes quicker)
```

Current lengths follow that: 10s scenes at 170vh, 6s scenes at 100vh, 6s
transitions at 75vh. Each entry records its `clipSeconds` so the derivation
stays visible. Keeping the ratio roughly constant is what makes the film feel
like one playback speed rather than sixteen different ones.

The clip is scrubbed across the middle ~78% of a beat's window; the margins are
the arrival and departure, which is why the first and last frames of each clip
sit on screen for a moment.

---

## How it is put together

```
src/
  lib/scenes.ts                 the film — single source of truth
  components/
    Film.tsx                    tall wrapper + one sticky stage + env cross-fade
    Coda.tsx                    the quiet page after the film
    animations/
      SmoothScroll.tsx          Lenis on the GSAP ticker (one shared clock)
      ScrollVideo.tsx           scroll → video.currentTime, with fallback
      ScenePlaceholder.tsx      procedural set drawn when a clip is missing
      CinematicSection.tsx      one beat: window, transitions, camera, scrub
      SceneTransition.tsx       how each camera type enters and leaves
      TextReveal.tsx            masked character/word reveal
      ImageReveal.tsx           clip-path reveal
      PointerAtmosphere.tsx     subtle cursor-following key light
    scenes/                     HeroScene, LiveCounterScene, FinalScene are
                                bespoke; StoryScene covers every other beat
                                including all six filmed transitions
    lib/menu.ts                 the printed menu, as data
    components/Menu.tsx         renders it
    ui/                         Nav, Cursor, Loader, SceneCaption, ProgressRail
```

### Three decisions worth knowing

**One pin, not ten.** The stage is pinned once for the entire journey with a
single `sticky` element rather than a ScrollTrigger pin per section. Per-section
pinning creates a handover between pin-spacers at every boundary — the usual
source of scroll-jumping, and the exact seam this design is trying to avoid.

**Scenes overlap.** Each scene's scroll window is widened by
`SCENE_OVERLAP_VH` at both ends, so one beat is still leaving while the next is
already arriving. The cut always happens inside a movement.

**One video at a time.** The `<video>` element is mounted only while its scene
is in range, so one media pipeline is alive instead of sixteen. Seeks are pumped
on rAF and snapped to the clips' 24fps grid — see the notes below.

---

## Verified

Checked in headless Chrome against the running dev server, with
`prefers-reduced-motion` explicitly disabled (headless defaults to `reduce`,
which silently exercises the fallback path instead of the real one):

- all sixteen beats compose at their scroll positions; the stage stays pinned at
  `top: 0` throughout
- scroll drives `video.currentTime` linearly (1.82s → 8.35s across a 10s clip)
  and the element stays `paused` — nothing autoplays
- reverse scrubbing runs the clip backwards (8.35s → 2.69s)
- every filmed transition shows three layers mid-hand-off: the scene leaving,
  the transition, and the scene arriving
- the room colour lands on the right value at each beat, including the one
  light room and the cold wok kitchen
- **1–3 videos decoded at a time out of 16** — lazy activation holding
- mobile (390×844) pins correctly and loads `/videos/mobile/*`
- zero page errors, zero console errors, zero failed requests
- ScrollTrigger instances, canvases and video elements constant across resize
  and refresh — no leaks

### Two bugs worth remembering

**Seeking is pumped on rAF, not the `seeked` event.** An event-driven queue with
a "busy" flag wedged permanently whenever `seeked` failed to arrive — which
happens if a seek is issued mid-decode or at a low readyState. It showed up as a
clip frozen on one frame while scrolling back up. Reading `video.seeking` every
frame instead means a dropped event costs one frame, not the scene.

**Site-side camera is deliberately tiny.** The generated clips contain their own
camera movement. The original ±7% scale moves compounded with the footage and
read as drift, so scenes now move 2–3% and filmed transitions use `camera:
"hold"` and don't move at all.

## Home-page sections

Below the film, each section carries its own scroll behaviour rather than the
same fade-up repeated:

| Section | Behaviour |
|---|---|
| `Manifesto` | Words brighten one at a time, scrubbed. Held sticky over a 220vh wrapper so the fill has room — tied to its own height it finished in a few hundred pixels and read as a flash. |
| `Services` | Cards uncovered by a clip-path wipe, with alternating parallax drift for depth. |
| `Numbers` | Counters driven by scroll position, with a rule that draws underneath across the same span. |
| `Kitchens` | The veg / non-veg halves wipe in from opposite outer edges and meet in the middle. |
| `Process` | Sticky heading beside a stepped list; a gold rail draws itself down and each dot fills as the rail reaches it. |

Everything animates opacity, transform or clip-path only — no per-frame canvas
and no filters on large elements, which is what kept the film smooth.

### On the content

Figures are computed from the menu data, never typed in, so they cannot drift:
9 courses, 305 dishes, 32 live counters, 4 occasion types. The booking steps are
taken from the brochure's own Deal & Order Confirmation sheet (page 11) — every
field named is on that form.

Nothing here asserts anything the brochure does not support. There are no
testimonials, no years-in-business, no event counts and no awards, because no
source material backs them. If you want those, supply the real numbers.

## The menu

All nine categories and 305 dishes from the printed brochure live in
[`src/lib/menu.ts`](src/lib/menu.ts) as plain data, rendered by
`Menu.tsx` below the film. Everything is visible by default rather than
collapsed behind accordions — it is the content customers came for, and hiding
it would also keep it out of search results. Long groups use width-based CSS
columns, so a second column appears only where one genuinely fits.

Contact details come from the brochure cover (the only page carrying the phone
number) and live alongside the menu data in `BUSINESS`.

## Not built yet

Out of scope so far: a real quote form, SEO metadata beyond the basics,
analytics, CMS. Page 11 of the brochure is an order-confirmation form that
would map naturally onto a quote request.
