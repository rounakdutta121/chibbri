import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { getScene } from './scenes';
import { Scene3DContent } from './Scene3D';
import { TextOverlay } from './TextOverlay';

const Bg: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, 900], [0, 40]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% ${20 + shift * 0.05}%, #1a0f3d 0%, #0c1024 42%, #030308 100%)`,
      }}
    />
  );
};

export const PanelVersePromo: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = getScene(frame);
  const prev = getScene(Math.max(0, frame - 1));
  const local = frame - scene.start;
  const camOrbit = local * 0.008;
  const sceneCut = scene.id !== prev.id && local < 10;
  const flash = sceneCut
    ? interpolate(local, [0, 10], [0.85, 0], { extrapolateRight: 'clamp' })
    : 0;

  return (
    <AbsoluteFill>
      <Bg />
      <ThreeCanvas
        width={1080}
        height={1920}
        camera={{ fov: 42, position: [Math.sin(camOrbit) * 0.6, 0.35, 7.2], near: 0.1, far: 100 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene3DContent scene={scene} />
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 90% 50% at 50% 35%, transparent 0%, rgba(3,3,8,0.55) 70%)',
          pointerEvents: 'none',
        }}
      />
      <TextOverlay scene={scene} />
      {flash > 0 && (
        <AbsoluteFill style={{ background: `rgba(255,255,255,${flash})`, pointerEvents: 'none' }} />
      )}
    </AbsoluteFill>
  );
};
