import { loadFont } from "@remotion/google-fonts/NotoSerif";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { BrandWatermark } from "./BrandWatermark";
import { ImageSlide } from "./ImageSlide";
import { SCENES } from "./scenes";

const { fontFamily } = loadFont();

export const DurgaStory: React.FC = () => {
  let offset = 0;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {SCENES.map((scene, index) => {
        const from = offset;
        offset += scene.durationInFrames;
        return (
          <Sequence
            key={`${scene.image}-${index}`}
            from={from}
            durationInFrames={scene.durationInFrames}
          >
            <ImageSlide
              image={scene.image}
              caption={scene.caption}
              motion={scene.motion}
              durationInFrames={scene.durationInFrames}
              captionPlacement={scene.captionPlacement}
              focus={scene.focus}
              showCaption={scene.showCaption !== false}
            />
          </Sequence>
        );
      })}
      <BrandWatermark />
      <Audio src={staticFile("audio/vaaroon-clip.mp3")} volume={0.92} />
    </AbsoluteFill>
  );
};
