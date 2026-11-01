import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { staticFile } from "remotion";

type Props = {
  src: string;
  panX?: number;
  panY?: number;
  zoom?: number;
  shake?: number;
};

export const AnimatedBackground: React.FC<Props> = ({
  src,
  panX = 30,
  panY = 20,
  zoom = 1.12,
  shake = 0,
}) => {
  const frame = useCurrentFrame();
  const progress = frame / 900;
  const x = Math.sin(progress * Math.PI * 2) * panX + (shake ? Math.sin(frame * 0.9) * shake : 0);
  const y = Math.cos(progress * Math.PI * 2) * panY + (shake ? Math.cos(frame * 1.1) * shake * 0.6 : 0);
  const scale = interpolate(frame % 120, [0, 60, 120], [zoom, zoom + 0.06, zoom], {
    extrapolateRight: "clamp",
  });
  const flicker = 0.88 + Math.sin(frame / 5) * 0.04;

  return (
    <AbsoluteFill style={{ backgroundColor: "#120608" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
          filter: `brightness(${flicker}) contrast(1.08) saturate(1.15)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255,120,40,0.18), transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55))",
        }}
      />
    </AbsoluteFill>
  );
};
