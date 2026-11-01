import React from "react";
import { Composition } from "remotion";
import { ChinnamastaReel } from "./ChinnamastaReel";

const FPS = 30;
const DURATION_FRAMES = 2880; // matches voiceover.mp3 (~96s)

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ChinnamastaReel"
        component={ChinnamastaReel}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
