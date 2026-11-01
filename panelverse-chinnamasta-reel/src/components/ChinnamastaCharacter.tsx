import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const OUTLINE = 3;

type Props = {
  scale?: number;
  intensity?: number;
  showAttendants?: boolean;
  showCouple?: boolean;
};

export const ChinnamastaCharacter: React.FC<Props> = ({
  scale = 1,
  intensity = 1,
  showAttendants = true,
  showCouple = true,
}) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame / 12) * 4 * intensity;
  const sway = Math.sin(frame / 20) * 3;
  const bloodPulse = 0.85 + Math.sin(frame / 8) * 0.15 * intensity;
  const glow = 0.4 + Math.sin(frame / 15) * 0.2;

  return (
    <svg
      viewBox="0 0 400 720"
      width={400 * scale}
      height={720 * scale}
      style={{
        filter: `drop-shadow(0 0 ${18 * glow}px rgba(255, 80, 40, 0.65))`,
        transform: `translateY(${breathe}px) rotate(${sway * 0.15}deg)`,
      }}
    >
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef5350" />
          <stop offset="100%" stopColor="#b71c1c" />
        </linearGradient>
        <linearGradient id="fireGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff6f00" />
          <stop offset="100%" stopColor="#ffeb3b" />
        </linearGradient>
      </defs>

      {showCouple ? (
        <g opacity={0.85}>
          <ellipse cx="200" cy="640" rx="90" ry="22" fill="#4e342e" opacity={0.35} />
          <ellipse cx="185" cy="620" rx="28" ry="18" fill="#ffcc80" stroke="#3e2723" strokeWidth={2} />
          <ellipse cx="215" cy="620" rx="28" ry="18" fill="#ffab91" stroke="#3e2723" strokeWidth={2} />
        </g>
      ) : null}

      {showAttendants ? (
        <>
          <g transform="translate(55, 360)">
            <ellipse cx="0" cy="80" rx="34" ry="70" fill="#ffccbc" stroke="#3e2723" strokeWidth={OUTLINE} />
            <circle cx="0" cy="0" r="26" fill="#ffccbc" stroke="#3e2723" strokeWidth={OUTLINE} />
            <circle cx="-8" cy="-4" r="3" fill="#3e2723" />
            <circle cx="8" cy="-4" r="3" fill="#3e2723" />
            <circle cx="0" cy="6" r="2" fill="#c62828" />
          </g>
          <g transform="translate(345, 360)">
            <ellipse cx="0" cy="80" rx="34" ry="70" fill="#ef5350" stroke="#3e2723" strokeWidth={OUTLINE} />
            <circle cx="0" cy="0" r="26" fill="#ef5350" stroke="#3e2723" strokeWidth={OUTLINE} />
            <circle cx="-8" cy="-4" r="3" fill="#3e2723" />
            <circle cx="8" cy="-4" r="3" fill="#3e2723" />
            <circle cx="0" cy="6" r="2" fill="#c62828" />
          </g>
        </>
      ) : null}

      {/* Body */}
      <ellipse cx="200" cy="430" rx="58" ry="95" fill="url(#skin)" stroke="#3e2723" strokeWidth={OUTLINE} />
      {/* Skull garland simplified */}
      {[160, 175, 190, 205, 220, 235, 250].map((x, i) => (
        <circle key={i} cx={x} cy={355 + (i % 2) * 4} r="7" fill="#eceff1" stroke="#3e2723" strokeWidth={2} />
      ))}
      {/* Snake yajnopavita */}
      <path
        d="M 168 380 Q 200 420 232 380 Q 210 450 200 470"
        fill="none"
        stroke="#689f38"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Neck stump + blood streams */}
      <rect x="188" y="295" width="24" height="12" fill="#b71c1c" stroke="#3e2723" strokeWidth={2} />
      {[175, 200, 225].map((x, i) => (
        <path
          key={i}
          d={`M ${x} 301 Q ${x + (i - 1) * 8} 330 ${x + (i - 1) * 15} ${360 + i * 8}`}
          stroke="#d32f2f"
          strokeWidth={5 * bloodPulse}
          fill="none"
          opacity={0.9}
        />
      ))}

      {/* Headless neck head area placeholder - main head in hand */}
      <ellipse cx="200" cy="310" rx="32" ry="28" fill="url(#skin)" stroke="#3e2723" strokeWidth={OUTLINE} />

      {/* Right arm - khadga */}
      <g transform={`rotate(${-25 + sway} 240 340)`}>
        <path d="M 240 340 L 290 280" stroke="#ffcc80" strokeWidth={14} strokeLinecap="round" />
        <path d="M 290 280 L 315 250 L 305 245 L 285 275 Z" fill="#cfd8dc" stroke="#3e2723" strokeWidth={2} />
        <path d="M 305 245 L 330 220" stroke="#90a4ae" strokeWidth={4} />
      </g>

      {/* Left arm - severed head (cartoon) */}
      <g transform={`translate(${165 + sway}, ${250 + breathe * 0.3})`}>
        <path d="M 200 340 L 170 300" stroke="#ffcc80" strokeWidth={14} strokeLinecap="round" />
        <circle cx="155" cy="285" r="30" fill="url(#skin)" stroke="#3e2723" strokeWidth={OUTLINE} />
        <circle cx="145" cy="278" r="4" fill="#3e2723" />
        <circle cx="165" cy="278" r="4" fill="#3e2723" />
        <path d="M 148 292 Q 155 298 162 292" stroke="#3e2723" strokeWidth={2} fill="none" />
        <circle cx="155" cy="268" r="3" fill="#ff1744" />
        <path d="M 155 305 Q 155 318 155 328" stroke="#c62828" strokeWidth={4 * bloodPulse} />
      </g>

      {/* Third eye on body chest */}
      <circle cx="200" cy="400" r="6" fill="#fff59d" stroke="#3e2723" strokeWidth={2} />
      <circle cx="200" cy="400" r="2" fill="#3e2723" />

      {/* Flames behind */}
      <path
        d="M 120 520 Q 140 460 130 400 Q 160 440 170 380 Q 180 450 200 360 Q 220 450 230 380 Q 240 440 270 400 Q 260 460 280 520 Z"
        fill="url(#fireGrad)"
        opacity={0.35 + glow * 0.3}
      />
    </svg>
  );
};

export const getCharacterOpacity = (frame: number, enter: number, exit?: number) => {
  const fadeIn = interpolate(frame, [enter, enter + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (exit === undefined) return fadeIn;
  const fadeOut = interpolate(frame, [exit, exit + 20], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(fadeIn, fadeOut);
};
