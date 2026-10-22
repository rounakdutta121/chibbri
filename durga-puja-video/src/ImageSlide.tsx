import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { CaptionPlacement, FocusPoint, MotionType } from "./scenes";

type ImageSlideProps = {
  image: string;
  caption: string;
  motion: MotionType;
  durationInFrames: number;
  captionPlacement: CaptionPlacement;
  focus?: FocusPoint;
  showCaption?: boolean;
};

const focusToObjectPosition: Record<FocusPoint, string> = {
  top: "50% 22%",
  center: "50% 50%",
  bottom: "50% 78%",
  left: "28% 50%",
  right: "72% 50%",
};

const placementStyle = (
  placement: CaptionPlacement,
): React.CSSProperties => {
  switch (placement) {
    case "top":
      return { justifyContent: "flex-start", paddingTop: "9%" };
    case "upper":
      return { justifyContent: "flex-start", paddingTop: "20%" };
    case "lower":
      return { justifyContent: "flex-start", paddingTop: "58%" };
    case "bottom":
      return { justifyContent: "flex-start", paddingTop: "74%" };
    case "mid":
    default:
      return { justifyContent: "flex-start", paddingTop: "42%" };
  }
};

const motionTransform = (
  motion: MotionType,
  progress: number,
  frame: number,
): { scale: number; translateX: number; translateY: number; rotate: number } => {
  const breathe = Math.sin(frame / 9) * 0.012;
  const base = {
    rotate: Math.sin(frame / 14) * 0.35,
  };

  switch (motion) {
    case "zoomOut":
      return {
        ...base,
        scale: interpolate(progress, [0, 1], [1.02, 1.18]) + breathe,
        translateX: interpolate(progress, [0, 1], [0, 1.5]),
        translateY: interpolate(progress, [0, 1], [0, -1]),
      };
    case "panLeft":
      return {
        ...base,
        scale: 1.16 + breathe,
        translateX: interpolate(progress, [0, 1], [5.5, -5.5]),
        translateY: interpolate(progress, [0, 1], [1.5, -2]),
      };
    case "panRight":
      return {
        ...base,
        scale: 1.16 + breathe,
        translateX: interpolate(progress, [0, 1], [-5.5, 5.5]),
        translateY: interpolate(progress, [0, 1], [-1, 1.5]),
      };
    case "driftUp":
      return {
        ...base,
        scale: 1.12 + breathe,
        translateX: Math.sin(frame / 11) * 1.2,
        translateY: interpolate(progress, [0, 1], [3, -4]),
      };
    case "driftDown":
      return {
        ...base,
        scale: 1.12 + breathe,
        translateX: Math.cos(frame / 13) * 1.2,
        translateY: interpolate(progress, [0, 1], [-3, 4]),
      };
    case "punchIn":
      return {
        ...base,
        scale: interpolate(progress, [0, 0.35, 1], [1.28, 1.08, 1.02]) + breathe,
        translateX: 0,
        translateY: interpolate(progress, [0, 1], [2, 0]),
      };
    case "zoomIn":
    default:
      return {
        ...base,
        scale: interpolate(progress, [0, 1], [1.2, 1.02]) + breathe,
        translateX: interpolate(progress, [0, 1], [-1, 1]),
        translateY: 0,
      };
  }
};

export const ImageSlide: React.FC<ImageSlideProps> = ({
  image,
  caption,
  motion,
  durationInFrames,
  captionPlacement,
  focus = "center",
  showCaption = true,
}) => {
  const frame = useCurrentFrame();
  const progress = frame / Math.max(durationInFrames - 1, 1);
  const { scale, translateX, translateY, rotate } = motionTransform(
    motion,
    progress,
    frame,
  );

  const sceneOpacity = interpolate(
    frame,
    [0, 7, durationInFrames - 8, durationInFrames - 1],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const captionOpacity = showCaption
    ? interpolate(
        frame,
        [4, 14, durationInFrames - 12, durationInFrames - 4],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  const captionY = interpolate(frame, [4, 18], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flash = interpolate(
    Math.sin(frame / 5),
    [-1, 1],
    [0.04, 0.12],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0a12", opacity: sceneOpacity }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: focusToObjectPosition[focus],
            transform: `scale(${scale}) translate(${translateX}%, ${translateY}%) rotate(${rotate}deg)`,
            transformOrigin: "center center",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,5,20,0.5) 0%, rgba(10,5,20,0.05) 32%, rgba(10,5,20,0.2) 68%, rgba(10,5,20,0.62) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 40%, rgba(255,180,80,${flash}) 0%, transparent 55%)`,
          mixBlendMode: "screen",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.48) 100%)",
        }}
      />

      {showCaption ? (
        <AbsoluteFill
          style={{
            ...placementStyle(captionPlacement),
            alignItems: "center",
            paddingLeft: 40,
            paddingRight: 40,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              opacity: captionOpacity,
              transform: `translateY(${captionY}px)`,
              maxWidth: 940,
              textAlign: "center",
              fontFamily: "inherit",
              fontSize: caption.length > 55 ? 44 : 48,
              fontWeight: 700,
              lineHeight: 1.22,
              letterSpacing: 0.2,
              color: "#fff8e7",
              textShadow:
                "0 2px 4px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.55)",
              padding: "18px 28px",
              borderRadius: 12,
              backgroundColor: "rgba(90, 12, 28, 0.72)",
              border: "1px solid rgba(255, 214, 120, 0.4)",
              boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
            }}
          >
            {caption}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
