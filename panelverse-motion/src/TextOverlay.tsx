import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import { loadFont as loadArchivo } from '@remotion/google-fonts/ArchivoBlack';
import type { SceneDef } from './scenes';
import { sceneProgress } from './scenes';

const { fontFamily: inter } = loadFont('normal', {
  weights: ['600', '700', '800'],
  subsets: ['latin'],
});
const { fontFamily: archivo } = loadArchivo();

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.97)',
  border: '4px solid #0b1220',
  borderRadius: 36,
  padding: '48px 52px',
  boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.4) inset',
  maxWidth: 920,
  width: '100%',
  textAlign: 'center',
};

export const TextOverlay: React.FC<{ scene: SceneDef }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - scene.start;
  const enter = spring({ frame: local, fps, config: { damping: 14, stiffness: 120 } });
  const exitStart = scene.end - scene.start - 18;
  const exit = local > exitStart
    ? interpolate(local, [exitStart, scene.end - scene.start], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;
  const opacity = enter * exit;
  const y = interpolate(enter, [0, 1], [120, 0]);

  const prog = sceneProgress(frame, scene);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 64px 140px',
        pointerEvents: 'none',
        fontFamily: inter,
      }}
    >
      <div
        style={{
          ...cardStyle,
          transform: `translateY(${y}px) scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
          opacity,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#5b21b6',
            background: '#f5f3ff',
            border: '2px solid #0b1220',
            borderRadius: 999,
            padding: '10px 22px',
            marginBottom: 28,
          }}
        >
          {scene.eyebrow}
        </div>
        <div
          style={{
            fontFamily: archivo,
            fontSize: scene.id === 5 ? 72 : 64,
            lineHeight: 1.05,
            color: '#0b1220',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          {scene.title}
          <br />
          <span style={{ color: '#0284c7' }}>{scene.titleAccent}</span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 34,
            fontWeight: 700,
            lineHeight: 1.35,
            color: '#334155',
          }}
        >
          {scene.subtitle}
        </div>
        {scene.id === 4 && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            {[
              { n: `${Math.round(prog * 25)}+`, l: 'Projects' },
              { n: `${Math.round(prog * 1000)}+`, l: 'Hrs automated' },
              { n: 'Fast', l: 'Delivery' },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  background: '#f8fafc',
                  border: '3px solid #0b1220',
                  borderRadius: 20,
                  padding: '16px 24px',
                  minWidth: 160,
                }}
              >
                <div style={{ fontFamily: archivo, fontSize: 40, color: '#0284c7' }}>{s.n}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0b1220' }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: '50%',
          transform: `translateX(-50%) scale(${interpolate(enter, [0, 1], [0.8, 1])})`,
          opacity: Math.min(1, enter * 1.2),
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: '#fff',
          border: '3px solid #0b1220',
          borderRadius: 999,
          padding: '12px 28px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg,#22d3ee,#8b5cf6)',
            border: '2px solid #0b1220',
          }}
        />
        <span style={{ fontFamily: archivo, fontSize: 26, letterSpacing: '0.08em', color: '#0b1220' }}>
          PANELVERSE
        </span>
      </div>
    </AbsoluteFill>
  );
};
