import { AbsoluteFill } from "remotion";

export const BrandWatermark: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 36,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: "inherit",
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: "rgba(255, 248, 231, 0.95)",
          textShadow: "0 1px 3px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.5)",
          padding: "10px 22px",
          borderRadius: 999,
          backgroundColor: "rgba(15, 10, 30, 0.55)",
          border: "1px solid rgba(255, 214, 120, 0.35)",
        }}
      >
        Developed By PanelVerse
      </div>
    </AbsoluteFill>
  );
};
