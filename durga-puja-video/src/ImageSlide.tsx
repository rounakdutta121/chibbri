import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { MotionType } from "./scenes";

type ImageSlideProps = {
  image: string;
  caption: string;
  motion: MotionType;
  durationInFrames: number;
};

const motionTransform = (
  motion: MotionType,
  progress: number,
): { scale: number; translateX: number; translateY: number } => {
  switch (motion) {
    case "zoomOut":
      return {
        scale: interpolate(progress, [0, 1], [1, 1.14]),
        translateX: 0,
        translateY: 0,
      };
    case "panLeft":
      return {
        scale: 1.1,
        translateX: interpolate(progress, [0, 1], [4, -4]),
        translateY: interpolate(progress, [0, 1], [1, -1]),
      };
    case "panRight":
      return {
        scale: 1.1,
        translateX: interpolate(progress, [0, 1], [-4, 4]),
        translateY: interpolate(progress, [0, 1], [-0.5, 0.5]),
      };
    case "zoomIn":
    default:
      return {
        scale: interpolate(progress, [0, 1], [1.14, 1]),
        translateX: 0,
        translateY: 0,
      };
  }
};

export const ImageSlide: React.FC<ImageSlideProps> = ({
  image,
  caption,
  motion,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const progress = frame / Math.max(durationInFrames - 1, 1);
  const { scale, translateX, translateY } = motionTransform(motion, progress);

  const sceneOpacity = interpolate(
    frame,
    [0, 12, durationInFrames - 14, durationInFrames - 1],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const captionOpacity = interpolate(
    frame,
    [8, 22, durationInFrames - 18, durationInFrames - 6],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const captionY = interpolate(frame, [8, 28], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0a12", opacity: sceneOpacity }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
            transformOrigin: "center center",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,5,20,0.55) 0%, rgba(10,5,20,0.08) 35%, rgba(10,5,20,0.25) 70%, rgba(10,5,20,0.65) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: "38%",
          paddingLeft: 48,
          paddingRight: 48,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            opacity: captionOpacity,
            transform: `translateY(${captionY}px)`,
            maxWidth: 920,
            textAlign: "center",
            fontFamily: "inherit",
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: 0.3,
            color: "#fff8e7",
            textShadow:
              "0 2px 4px rgba(0,0,0,0.85), 0 0 28px rgba(0,0,0,0.55)",
            padding: "22px 32px",
            borderRadius: 12,
            backgroundColor: "rgba(120, 20, 40, 0.42)",
            border: "1px solid rgba(255, 214, 120, 0.35)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          {caption}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
