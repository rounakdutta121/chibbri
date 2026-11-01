import React from "react";

export const PanelVerseBadge: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 118,
      left: 0,
      right: 0,
      textAlign: "center",
      zIndex: 50,
      pointerEvents: "none",
    }}
  >
    <span
      style={{
        fontFamily: "Georgia, serif",
        fontSize: 22,
        letterSpacing: 1.2,
        color: "rgba(255, 235, 200, 0.92)",
        textShadow: "0 2px 8px rgba(0,0,0,0.85)",
        padding: "6px 16px",
        borderTop: "1px solid rgba(255, 200, 120, 0.35)",
        borderBottom: "1px solid rgba(255, 200, 120, 0.35)",
        background: "rgba(20, 8, 8, 0.45)",
      }}
    >
      Developed by PanelVerse
    </span>
  </div>
);
