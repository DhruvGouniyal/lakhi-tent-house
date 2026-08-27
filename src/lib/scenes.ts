/**
 * THE FILM — single source of truth.
 *
 * Sixteen beats: ten scenes and six filmed transitions between them. Scroll
 * length, video, palette and copy all live here, so retiming the movie never
 * means touching a component.
 *
 * `scrollVh` is derived from each clip's real duration:
 *   scenes      ≈ 17vh per second of footage
 *   transitions ≈ 12vh per second — connective tissue should pass quicker
 * Keeping those ratios roughly constant is what makes the whole film feel like
 * one playback speed rather than sixteen different ones.
 *
 * To swap a clip: drop the file at `public/videos/<video>` (and a smaller copy
 * at `public/videos/mobile/<video>`) and reload. A missing file falls back to
 * the procedural placeholder automatically.
 */

export type SceneId =
  | "hero"
  | "drinks"
  | "to-breakfast"
  | "breakfast"
  | "to-counters"
  | "live-counters"
  | "to-starters"
  | "starters"
  | "to-main"
  | "main-course"
  | "breads-rice"
  | "to-wok"
  | "asian"
  | "to-dessert"
  | "desserts"
  | "finale";

/** Which procedural silhouette the placeholder draws when a video is absent. */
export type PlaceholderVariant =
  | "table" | "glass" | "plate" | "counter" | "platter"
  | "handi" | "tandoor" | "wok" | "dessert" | "banquet";

export interface Environment {
  bg: string;
  fog: string;
  accent: string;
  text: string;
}

export interface SceneConfig {
  id: SceneId;
  index: number;
  /** "scene" carries copy and a chapter tick; "transition" is pure motion. */
  kind: "scene" | "transition";
  chapter: string;
  title: string;
  subtitle: string;
  video: string;
  scrollVh: number;
  /** Real duration of the clip, in seconds. Documents where scrollVh came from. */
  clipSeconds: number;
  variant: PlaceholderVariant;
  environment: Environment;
  /**
   * Site-side camera. The generated clips already contain their own camera
   * movement, so these are deliberately small — a large move here would
   * compound with the footage and read as drift. "hold" adds none at all,
   * which is what every filmed transition wants.
   */
  camera: "push" | "pull" | "travel" | "orbit" | "hold";
  nextScene: SceneId | null;
}

// Rooms, matched to what the generated footage actually looks like.
const DARK_HALL: Environment = { bg: "#0b0908", fog: "#3a2c1e", accent: "#d9b26a", text: "#f7f2e8" };
const WARM_PARTY: Environment = { bg: "#17110c", fog: "#6a4a28", accent: "#e0b268", text: "#f7f2e8" };
const MORNING: Environment = { bg: "#e8dfcd", fog: "#f7f2e8", accent: "#b88a36", text: "#30282b" };
const COUNTERS: Environment = { bg: "#241a14", fog: "#7a4a22", accent: "#e0a850", text: "#f7f2e8" };
const STARTERS: Environment = { bg: "#1a1412", fog: "#5a3a2a", accent: "#c89a46", text: "#f7f2e8" };
const BURGUNDY: Environment = { bg: "#2a0c16", fog: "#7a1c34", accent: "#d9b26a", text: "#f7f2e8" };
const TANDOOR: Environment = { bg: "#241408", fog: "#a05c18", accent: "#e0a850", text: "#f7f2e8" };
const COLD_KITCHEN: Environment = { bg: "#050506", fog: "#1c2a2e", accent: "#e8703a", text: "#f7f2e8" };
const SWEET: Environment = { bg: "#1d1216", fog: "#8a4a52", accent: "#e6b9a0", text: "#f7f2e8" };
const GOLD: Environment = { bg: "#12100f", fog: "#8a6a2a", accent: "#d9b26a", text: "#f7f2e8" };

/**
 * A transition takes the environment of the room it is delivering you into, so
 * the colour change happens *during* the move rather than after it lands.
 */
const raw: Omit<SceneConfig, "index">[] = [
  {
    id: "hero", kind: "scene",
    chapter: "01 — The Table", title: "LAKHI", subtitle: "Tent House & Caters",
    video: "/videos/hero-table.mp4", clipSeconds: 10, scrollVh: 170,
    variant: "table", environment: DARK_HALL, camera: "push", nextScene: "drinks",
  },
  {
    id: "drinks", kind: "scene",
    chapter: "02 — Welcome", title: "THE FIRST\nPOUR",
    subtitle: "Kesar, badam, and a long summer afternoon",
    video: "/videos/drinks.mp4", clipSeconds: 10, scrollVh: 170,
    variant: "glass", environment: WARM_PARTY, camera: "push", nextScene: "to-breakfast",
  },
  {
    id: "to-breakfast", kind: "transition",
    chapter: "", title: "", subtitle: "",
    video: "/videos/transition-drink-breakfast.mp4", clipSeconds: 6, scrollVh: 75,
    variant: "plate", environment: MORNING, camera: "hold", nextScene: "breakfast",
  },
  {
    id: "breakfast", kind: "scene",
    chapter: "03 — Morning", title: "THE DAY\nBEGINS",
    subtitle: "Before the guests, the kitchen wakes",
    video: "/videos/breakfast.mp4", clipSeconds: 6, scrollVh: 100,
    variant: "plate", environment: MORNING, camera: "pull", nextScene: "to-counters",
  },
  {
    id: "to-counters", kind: "transition",
    chapter: "", title: "", subtitle: "",
    video: "/videos/transition-breakfast-counters.mp4", clipSeconds: 6, scrollVh: 75,
    variant: "counter", environment: COUNTERS, camera: "hold", nextScene: "live-counters",
  },
  {
    id: "live-counters", kind: "scene",
    chapter: "04 — Live", title: "COUNTERS\nALIVE",
    subtitle: "Chaat, tandoor, pasta, sushi — cooked in front of you",
    video: "/videos/live-counters.mp4", clipSeconds: 10, scrollVh: 170,
    variant: "counter", environment: COUNTERS, camera: "travel", nextScene: "to-starters",
  },
  {
    id: "to-starters", kind: "transition",
    chapter: "", title: "", subtitle: "",
    video: "/videos/transition-counters-starters.mp4", clipSeconds: 6, scrollVh: 75,
    variant: "platter", environment: STARTERS, camera: "hold", nextScene: "starters",
  },
  {
    id: "starters", kind: "scene",
    chapter: "05 — Starters", title: "THE\nPLATTER",
    subtitle: "Crisp, grilled, tandoor, Indo-Chinese",
    video: "/videos/starters.mp4", clipSeconds: 6, scrollVh: 100,
    variant: "platter", environment: STARTERS, camera: "orbit", nextScene: "to-main",
  },
  {
    id: "to-main", kind: "transition",
    chapter: "", title: "", subtitle: "",
    video: "/videos/transition-starters-main.mp4", clipSeconds: 6, scrollVh: 75,
    variant: "handi", environment: BURGUNDY, camera: "hold", nextScene: "main-course",
  },
  {
    id: "main-course", kind: "scene",
    chapter: "06 — Main Course", title: "THE\nCENTREPIECE",
    subtitle: "Copper, saffron, and slow heat",
    video: "/videos/main-course.mp4", clipSeconds: 10, scrollVh: 170,
    variant: "handi", environment: BURGUNDY, camera: "push", nextScene: "breads-rice",
  },
  {
    id: "breads-rice", kind: "scene",
    chapter: "07 — Breads & Rice", title: "FROM THE\nTANDOOR",
    subtitle: "Naan, kulcha, saffron rice",
    video: "/videos/breads-rice.mp4", clipSeconds: 6, scrollVh: 100,
    variant: "tandoor", environment: TANDOOR, camera: "travel", nextScene: "to-wok",
  },
  {
    id: "to-wok", kind: "transition",
    chapter: "", title: "", subtitle: "",
    video: "/videos/transition-tandoor-wok.mp4", clipSeconds: 6, scrollVh: 75,
    variant: "wok", environment: COLD_KITCHEN, camera: "hold", nextScene: "asian",
  },
  {
    id: "asian", kind: "scene",
    chapter: "08 — Asian", title: "THE\nWOK", subtitle: "Fire, toss, steam",
    video: "/videos/asian.mp4", clipSeconds: 10, scrollVh: 170,
    variant: "wok", environment: COLD_KITCHEN, camera: "push", nextScene: "to-dessert",
  },
  {
    id: "to-dessert", kind: "transition",
    chapter: "", title: "", subtitle: "",
    video: "/videos/transition-wok-dessert.mp4", clipSeconds: 6, scrollVh: 75,
    variant: "dessert", environment: SWEET, camera: "hold", nextScene: "desserts",
  },
  {
    id: "desserts", kind: "scene",
    chapter: "09 — Sweets", title: "A SWEET\nFINISH",
    subtitle: "Rabri, kulfi, jalebi still warm",
    video: "/videos/desserts.mp4", clipSeconds: 6, scrollVh: 100,
    variant: "dessert", environment: SWEET, camera: "pull", nextScene: "finale",
  },
  {
    id: "finale", kind: "scene",
    chapter: "10 — The Celebration", title: "ONE LONG\nCELEBRATION",
    subtitle: "We serve with passion — you celebrate with joy",
    video: "/videos/final-celebration.mp4", clipSeconds: 10, scrollVh: 170,
    variant: "banquet", environment: GOLD, camera: "pull", nextScene: null,
  },
];

export const SCENES: SceneConfig[] = raw.map((s, index) => ({ ...s, index }));

/**
 * Scenes overlap by this much (vh) on each side, so one beat is already
 * arriving while the previous is still leaving and the cut always happens
 * inside a movement. Filmed transitions use a tighter overlap — they are
 * already doing the blending themselves.
 */
export const SCENE_OVERLAP_VH = 40;
export const TRANSITION_OVERLAP_VH = 18;

export const overlapFor = (scene: SceneConfig) =>
  scene.kind === "transition" ? TRANSITION_OVERLAP_VH : SCENE_OVERLAP_VH;

/** Cumulative scroll offset (vh) at which each beat's window opens. */
export const SCENE_OFFSETS_VH: number[] = SCENES.reduce<number[]>((acc, _, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].scrollVh);
  return acc;
}, []);

export const FILM_HEIGHT_VH = SCENES.reduce((sum, s) => sum + s.scrollVh, 0) + 100;

/** Only real scenes get a chapter tick and copy. */
export const CHAPTERS = SCENES.filter((s) => s.kind === "scene");

/** Phones get a smaller re-encode of the same clip. */
export const mobileSrc = (video: string) => video.replace("/videos/", "/videos/mobile/");

export const getScene = (id: SceneId) => SCENES.find((s) => s.id === id)!;
