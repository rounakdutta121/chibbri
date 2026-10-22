import { loadFont } from "@remotion/google-fonts/NotoSerif";
import { AbsoluteFill, Sequence } from "remotion";
import { ImageSlide } from "./ImageSlide";
import { SCENES } from "./scenes";

const { fontFamily } = loadFont();

export const DurgaStory: React.FC = () => {
  let offset = 0;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {SCENES.map((scene) => {
        const from = offset;
        offset += scene.durationInFrames;
        return (
          <Sequence
            key={scene.image}
            from={from}
            durationInFrames={scene.durationInFrames}
          >
            <ImageSlide
              image={scene.image}
              caption={scene.caption}
              motion={scene.motion}
              durationInFrames={scene.durationInFrames}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
