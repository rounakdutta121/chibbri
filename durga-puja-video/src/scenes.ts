export type MotionType =
  | "zoomIn"
  | "zoomOut"
  | "panLeft"
  | "panRight"
  | "driftUp"
  | "driftDown"
  | "punchIn";

export type CaptionPlacement = "top" | "upper" | "mid" | "lower" | "bottom";

export type FocusPoint = "top" | "center" | "bottom" | "left" | "right";

export type StoryScene = {
  image: string;
  caption: string;
  motion: MotionType;
  durationInFrames: number;
  captionPlacement: CaptionPlacement;
  focus?: FocusPoint;
  showCaption?: boolean;
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const BEAT = 90; // 3 seconds — faster cuts for a livelier minute

export const SCENES: StoryScene[] = [
  {
    image: "images/durga-scene-01-child.jpg",
    caption: "Little Arjun asks Thamma — who is Durga Ma?",
    motion: "zoomIn",
    durationInFrames: BEAT,
    captionPlacement: "bottom",
    focus: "center",
  },
  {
    image: "images/durga-scene-02-mahalaya.jpg",
    caption: "Mahalaya — Bengal wakes her with Chandipath",
    motion: "panRight",
    durationInFrames: BEAT,
    captionPlacement: "top",
    focus: "top",
  },
  {
    image: "images/canonical-durga-idol.jpg",
    caption: "Bengali Ma Durga — lion, Mahishasur, four gods beside her",
    motion: "driftUp",
    durationInFrames: BEAT,
    captionPlacement: "top",
    focus: "center",
  },
  {
    image: "images/canonical-durga-idol.jpg",
    caption: "",
    motion: "punchIn",
    durationInFrames: Math.round(BEAT * 0.7),
    captionPlacement: "top",
    focus: "center",
    showCaption: false,
  },
  {
    image: "images/durga-scene-05-boy-pandal.jpg",
    caption: "Pandal lights bloom — Arjun’s eyes go wide",
    motion: "panLeft",
    durationInFrames: BEAT,
    captionPlacement: "top",
    focus: "bottom",
  },
  {
    image: "images/durga-scene-04-shashthi.jpg",
    caption: "Shashthi — Bodhan. Doors open, Ma is called home",
    motion: "zoomOut",
    durationInFrames: BEAT,
    captionPlacement: "bottom",
    focus: "top",
  },
  {
    image: "images/durga-scene-09-dhak.jpg",
    caption: "Dhak rolls — the city starts to dance",
    motion: "driftDown",
    durationInFrames: BEAT,
    captionPlacement: "top",
    focus: "center",
  },
  {
    image: "images/canonical-durga-idol.jpg",
    caption: "Same Ma every year — ekchala, heart of Kolkata",
    motion: "panRight",
    durationInFrames: BEAT,
    captionPlacement: "top",
    focus: "bottom",
  },
  {
    image: "images/durga-scene-05-saptami.jpg",
    caption: "Saptami — Nabapatrika bathed at dawn",
    motion: "driftUp",
    durationInFrames: BEAT,
    captionPlacement: "bottom",
    focus: "center",
  },
  {
    image: "images/durga-scene-11-boy-prayer.jpg",
    caption: "Arjun learns to fold his hands for Pushpanjali",
    motion: "zoomIn",
    durationInFrames: BEAT,
    captionPlacement: "top",
    focus: "center",
  },
  {
    image: "images/durga-scene-06-ashtami.jpg",
    caption: "Ashtami — flowers, Sandhi Puja, hearts full",
    motion: "panLeft",
    durationInFrames: BEAT,
    captionPlacement: "top",
    focus: "bottom",
  },
  {
    image: "images/durga-scene-13-sandhi.jpg",
    caption: "Sandhi’s bell — 108 lotus for the Devi",
    motion: "punchIn",
    durationInFrames: BEAT,
    captionPlacement: "bottom",
    focus: "center",
  },
  {
    image: "images/canonical-durga-idol.jpg",
    caption: "Ma stays unchanged — power in her ten hands",
    motion: "zoomOut",
    durationInFrames: Math.round(BEAT * 0.8),
    captionPlacement: "top",
    focus: "left",
    showCaption: true,
  },
  {
    image: "images/durga-scene-07-navami.jpg",
    caption: "Navami — bhog, khichuri, laughter around Ma",
    motion: "driftDown",
    durationInFrames: BEAT,
    captionPlacement: "bottom",
    focus: "top",
  },
  {
    image: "images/durga-scene-10-artisans.jpg",
    caption: "Kumartuli hands shaped her — now she feeds us all",
    motion: "panRight",
    durationInFrames: BEAT,
    captionPlacement: "top",
    focus: "center",
  },
  {
    image: "images/durga-scene-08-dashami.jpg",
    caption: "Dashami — sindoor khela, tears and smiles",
    motion: "zoomIn",
    durationInFrames: BEAT,
    captionPlacement: "top",
    focus: "bottom",
  },
  {
    image: "images/durga-scene-17-visarjan.jpg",
    caption: "Visarjan — Ma returns to the river",
    motion: "driftUp",
    durationInFrames: BEAT,
    captionPlacement: "bottom",
    focus: "center",
  },
  {
    image: "images/canonical-durga-idol.jpg",
    caption: "",
    motion: "panLeft",
    durationInFrames: Math.round(BEAT * 0.65),
    captionPlacement: "top",
    focus: "right",
    showCaption: false,
  },
  {
    image: "images/durga-scene-19-boy-end.jpg",
    caption: "Arjun whispers — ashche bochhor abar hobe",
    motion: "zoomOut",
    durationInFrames: BEAT,
    captionPlacement: "bottom",
    focus: "center",
  },
  {
    image: "images/durga-scene-02-mahalaya.jpg",
    caption: "Until next Mahalaya… Subho Bijoya",
    motion: "driftUp",
    durationInFrames: BEAT + 76,
    captionPlacement: "top",
    focus: "top",
  },
];

export const TOTAL_DURATION_IN_FRAMES = SCENES.reduce(
  (sum, scene) => sum + scene.durationInFrames,
  0,
);
