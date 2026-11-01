import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import scenes from "../scenes.json";

type Scene = {
  id: number;
  file: string;
  start: number;
  end: number;
};

const FPS = 30;

const Slide: React.FC<{ scene: Scene; durationFrames: number }> = ({
  scene,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const progress = frame / Math.max(durationFrames, 1);
  const zoom = interpolate(progress, [0, 1], [1.08, 1.22]);
  const x = interpolate(progress, [0, 1], [-18, 18]);
  const y = interpolate(progress, [0, 1], [12, -12]);
  const rot = interpolate(progress, [0, 0.5, 1], [-1.2, 0.8, -0.6]);
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationFrames - 8, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const shake =
    scene.id >= 9 && scene.id <= 12
      ? Math.sin(frame * 0.8) * 2.5
      : Math.sin(frame * 0.2) * 0.4;
  const flash = interpolate(frame, [0, 3, 8], [0.35, 0.08, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 220, 180, ${flash})`,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <Img
        src={staticFile(scene.file)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoom}) translate(${x + shake}px, ${y}px) rotate(${rot}deg)`,
          filter: "contrast(1.06) saturate(1.12) brightness(0.95)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 35%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const NarrationSlideshow: React.FC = () => {
  const list = scenes as Scene[];

  return (
    <AbsoluteFill>
      {list.map((scene) => {
        const from = Math.round(scene.start * FPS);
        const duration = Math.max(1, Math.round((scene.end - scene.start) * FPS));
        return (
          <Sequence key={scene.id} from={from} durationInFrames={duration} layout="none">
            <Slide scene={scene} durationFrames={duration} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
