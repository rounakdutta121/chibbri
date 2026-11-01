import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const MotionEffects: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame / 6) * 0.5 + 0.5;
  const driftX = Math.sin(frame / 23) * 12;
  const driftY = Math.cos(frame / 19) * 8;

  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + driftX * 0.2}% ${42 + driftY * 0.2}%, rgba(255,120,50,${0.08 + pulse * 0.05}) 0%, transparent 45%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      {Array.from({ length: 18 }).map((_, i) => {
        const y = ((frame * (1.2 + i * 0.07) + i * 120) % 2100) - 100;
        const x = 80 + (i * 53) % 920;
        const size = 2 + (i % 4);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 3 === 0 ? "rgba(255,220,120,0.7)" : "rgba(255,90,60,0.55)",
              boxShadow: "0 0 8px rgba(255,120,40,0.8)",
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          opacity: interpolate(frame % 90, [0, 45, 90], [0.03, 0.07, 0.03]),
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\"/></filter><rect width=\"120\" height=\"120\" filter=\"url(%23n)\" opacity=\"0.5\"/></svg>')",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </>
  );
};
