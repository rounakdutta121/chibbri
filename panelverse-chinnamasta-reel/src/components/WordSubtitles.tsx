import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import subtitles from "../subtitles.json";

type Word = { text: string; start: number; end: number };

export const WordSubtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const words = subtitles as Word[];
  const activeIndex = words.findIndex((w) => t >= w.start && t < w.end);
  if (activeIndex === -1) return null;

  const windowStart = Math.max(0, activeIndex - 2);
  const windowEnd = Math.min(words.length, activeIndex + 4);
  const slice = words.slice(windowStart, windowEnd);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 42,
        left: 24,
        right: 24,
        zIndex: 60,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px 10px",
        lineHeight: 1.35,
      }}
    >
      {slice.map((w, i) => {
        const globalIdx = windowStart + i;
        const isActive = globalIdx === activeIndex;
        return (
          <span
            key={`${w.text}-${globalIdx}`}
            style={{
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: isActive ? 34 : 26,
              fontWeight: isActive ? 800 : 500,
              color: isActive ? "#fff176" : "rgba(255,255,255,0.78)",
              textShadow: "0 2px 6px rgba(0,0,0,0.9)",
              transform: isActive ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.05s linear",
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
