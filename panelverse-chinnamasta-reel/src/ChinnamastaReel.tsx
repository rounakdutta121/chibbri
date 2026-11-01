import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { MotionEffects } from "./components/MotionEffects";
import { NarrationSlideshow } from "./components/NarrationSlideshow";
import { PanelVerseBadge } from "./components/PanelVerseBadge";
import { WordSubtitles } from "./components/WordSubtitles";

export const ChinnamastaReel: React.FC = () => {
  const frame = useCurrentFrame();
  const vignettePulse = 0.72 + Math.sin(frame / 18) * 0.08;
  const filmGrain = Math.sin(frame * 0.7) * 0.03;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0505" }}>
      <NarrationSlideshow />
      <MotionEffects />

      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 130px rgba(0,0,0,${vignettePulse})`,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, transparent 38%, rgba(0,0,0,0.58) 100%)`,
          opacity: 0.9 + filmGrain,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(255,120,40,0.04), transparent 40%, rgba(120,40,255,0.05))",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <PanelVerseBadge />
      <WordSubtitles />
      <Audio src={staticFile("voiceover.mp3")} />
    </AbsoluteFill>
  );
};
