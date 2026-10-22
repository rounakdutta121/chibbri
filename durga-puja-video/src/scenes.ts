export type MotionType = "zoomIn" | "zoomOut" | "panLeft" | "panRight";

export type StoryScene = {
  image: string;
  caption: string;
  motion: MotionType;
  durationInFrames: number;
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Eight beats × 7.5s = 60s */
const SCENE_SECONDS = 7.5;
const sceneFrames = Math.round(SCENE_SECONDS * FPS);

export const SCENES: StoryScene[] = [
  {
    image: "images/durga-scene-01-child.jpg",
    caption: "Little Riya asks Thamma — who is Durga Ma?",
    motion: "zoomIn",
    durationInFrames: sceneFrames,
  },
  {
    image: "images/durga-scene-02-mahalaya.jpg",
    caption: "Mahalaya — when Bengal wakes the Goddess with Chandipath",
    motion: "panRight",
    durationInFrames: sceneFrames,
  },
  {
    image: "images/durga-scene-03-idol.jpg",
    caption:
      "Bengali Ma Durga — on her lion, slaying Mahishasur, with the four gods beside her",
    motion: "zoomOut",
    durationInFrames: sceneFrames,
  },
  {
    image: "images/durga-scene-04-shashthi.jpg",
    caption: "Shashthi — Bodhan. We open our doors and call her home",
    motion: "panLeft",
    durationInFrames: sceneFrames,
  },
  {
    image: "images/durga-scene-05-saptami.jpg",
    caption: "Saptami — Nabapatrika bathed at dawn, life offered to the river",
    motion: "zoomIn",
    durationInFrames: sceneFrames,
  },
  {
    image: "images/durga-scene-06-ashtami.jpg",
    caption: "Ashtami — Pushpanjali, Sandhi Puja, hearts full of flowers",
    motion: "panRight",
    durationInFrames: sceneFrames,
  },
  {
    image: "images/durga-scene-07-navami.jpg",
    caption: "Navami — bhog, khichuri, and laughter around Ma",
    motion: "zoomOut",
    durationInFrames: sceneFrames,
  },
  {
    image: "images/durga-scene-08-dashami.jpg",
    caption: "Dashami — sindoor khela, visarjan… ashche bochhor abar hobe",
    motion: "zoomIn",
    durationInFrames: sceneFrames,
  },
];

export const TOTAL_DURATION_IN_FRAMES = SCENES.reduce(
  (sum, scene) => sum + scene.durationInFrames,
  0,
);
