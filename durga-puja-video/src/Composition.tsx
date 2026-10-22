import { Composition } from "remotion";
import { DurgaStory } from "./DurgaStory";
import {
  FPS,
  HEIGHT,
  TOTAL_DURATION_IN_FRAMES,
  WIDTH,
} from "./scenes";

export const MyComposition = () => {
  return (
    <Composition
      id="DurgaPujaStory"
      component={DurgaStory}
      durationInFrames={TOTAL_DURATION_IN_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
