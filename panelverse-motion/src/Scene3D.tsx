import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { Float, MeshDistortMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneDef } from './scenes';
import { sceneProgress } from './scenes';

const Cyan = '#22d3ee';
const Violet = '#a78bfa';
const Gold = '#fbbf24';

const Particles: React.FC<{ frame: number }> = ({ frame }) => {
  const positions = useMemo(() => {
    const arr = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);
  return (
    <points rotation={[0, frame * 0.002, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color={Cyan} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
};

function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 8]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-5, 2, 3]} intensity={2.5} color={Cyan} />
      <pointLight position={[5, -2, 2]} intensity={2.2} color={Violet} />
    </>
  );
}

const HookScene: React.FC<{ prog: number; frame: number }> = ({ prog, frame }) => {
  const rot = frame * 0.015;
  return (
    <group rotation={[0.2, rot, 0]}>
      {[0, 1, 2].map((i) => (
        <Float key={i} speed={2 + i} rotationIntensity={0.4} floatIntensity={0.8}>
          <mesh position={[0, i * 0.55 - 0.55, -i * 0.3]}>
            <boxGeometry args={[2.8 - i * 0.3, 0.12, 1.8 - i * 0.2]} />
            <MeshDistortMaterial
              color={i === 1 ? Violet : i === 2 ? Gold : Cyan}
              metalness={0.6}
              roughness={0.25}
              distort={0.15}
              speed={2}
              emissive={i === 1 ? '#4c1d95' : '#0e7490'}
              emissiveIntensity={0.35}
            />
          </mesh>
        </Float>
      ))}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 2.8, 64]} />
        <meshBasicMaterial color={Cyan} transparent opacity={0.12 * prog} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const WebsiteScene: React.FC<{ prog: number; frame: number }> = ({ frame }) => {
  const open = Math.min(1, frame * 0.02);
  return (
    <group rotation={[0.35, frame * 0.012, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 2, 0.15]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.15, 0.09]}>
        <planeGeometry args={[2.8 * open, 1.5 * open]} />
        <meshStandardMaterial
          color={Cyan}
          emissive="#0891b2"
          emissiveIntensity={0.45}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, -1.35, 0]}>
        <boxGeometry args={[3.6, 0.2, 1.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

const LandingScene: React.FC<{ prog: number; frame: number }> = ({ frame }) => {
  return (
    <group rotation={[0.5, frame * 0.018, 0]}>
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[1.1, 1.6, 4]} />
        <meshStandardMaterial color={Gold} metalness={0.55} roughness={0.35} emissive="#b45309" emissiveIntensity={0.25} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, -0.2 - i * 0.35, 0]}>
          <cylinderGeometry args={[1.3 - i * 0.22, 1.5 - i * 0.22, 0.18, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
      <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 2.2, 48]} />
        <meshBasicMaterial color={Violet} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const AutomationScene: React.FC<{ frame: number }> = ({ frame }) => {
  const nodes = useMemo(
    () =>
      [
        [0, 0.5, 0],
        [-1.4, -0.3, 0.3],
        [1.3, -0.2, -0.2],
        [-0.8, -1.1, 0.5],
        [1.1, -1, 0.4],
      ] as [number, number, number][],
    [],
  );
  const pulse = 1 + Math.sin(frame * 0.15) * 0.08;
  return (
    <group rotation={[0.25, frame * 0.01, 0]}>
      {nodes.map((p, i) => (
        <Float key={i} speed={3} floatIntensity={0.5}>
          <mesh position={p} scale={pulse * (i === 0 ? 1.2 : 0.75)}>
            <sphereGeometry args={[0.35, 32, 32]} />
            <MeshDistortMaterial
              color={i === 0 ? Cyan : Violet}
              metalness={0.5}
              roughness={0.2}
              distort={0.25}
              speed={3}
              emissive={i === 0 ? '#0e7490' : '#5b21b6'}
              emissiveIntensity={0.5}
            />
          </mesh>
        </Float>
      ))}
      {nodes.slice(1).map((p, i) => (
        <Line
          key={`l${i}`}
          points={[nodes[0], p]}
          color={Cyan}
          lineWidth={2}
          transparent
          opacity={0.7}
        />
      ))}
      <mesh rotation={[frame * 0.02, frame * 0.03, 0]}>
        <torusGeometry args={[1.8, 0.03, 16, 100]} />
        <meshStandardMaterial color={Cyan} emissive={Cyan} emissiveIntensity={0.8} metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
};

const StatsScene: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <group rotation={[0.2, frame * 0.008, 0]}>
      {[-1.2, 0, 1.2].map((x, i) => (
        <Float key={i} speed={2.5} floatIntensity={0.6}>
          <mesh position={[x, i * 0.2, 0]} rotation={[0.1, frame * 0.01 + i, 0]}>
            <boxGeometry args={[0.9, 1.1 + i * 0.15, 0.35]} />
            <meshStandardMaterial
              color="#f8fafc"
              metalness={0.3}
              roughness={0.4}
              emissive={i === 0 ? Cyan : i === 1 ? Violet : Gold}
              emissiveIntensity={0.35}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const CTAScene: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <group scale={1.1}>
      <Float speed={4} rotationIntensity={0.6} floatIntensity={1}>
        <mesh rotation={[frame * 0.01, frame * 0.025, 0]}>
          <icosahedronGeometry args={[1.35, 1]} />
          <MeshDistortMaterial
            color={Violet}
            metalness={0.65}
            roughness={0.2}
            distort={0.35}
            speed={4}
            emissive="#7c3aed"
            emissiveIntensity={0.55}
          />
        </mesh>
      </Float>
      <mesh rotation={[Math.PI / 2, 0, frame * 0.02]}>
        <torusGeometry args={[2.1, 0.04, 8, 64]} />
        <meshStandardMaterial color={Cyan} emissive={Cyan} emissiveIntensity={1} />
      </mesh>
    </group>
  );
};

export const Scene3DContent: React.FC<{ scene: SceneDef }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const prog = sceneProgress(frame, scene);
  const camZ = 7.5 - prog * 0.8;
  const camY = 0.3 + Math.sin(frame * 0.03) * 0.15;

  return (
    <>
      <Particles frame={frame} />
      <Lights />
      <group position={[0, camY, camZ]} rotation={[0.05, 0, 0]}>
        {/* camera is fixed; move world slightly for parallax */}
      </group>
      <group position={[0, 0.2, 0]} scale={1.05}>
        {scene.id === 0 && <HookScene prog={prog} frame={frame - scene.start} />}
        {scene.id === 1 && <WebsiteScene prog={prog} frame={frame - scene.start} />}
        {scene.id === 2 && <LandingScene prog={prog} frame={frame - scene.start} />}
        {scene.id === 3 && <AutomationScene frame={frame - scene.start} />}
        {scene.id === 4 && <StatsScene frame={frame - scene.start} />}
        {scene.id === 5 && <CTAScene frame={frame - scene.start} />}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, frame * 0.004]} position={[0, -2.2, 0]}>
        <planeGeometry args={[30, 30, 32, 32]} />
        <meshStandardMaterial
          color="#0a0a12"
          wireframe
          transparent
          opacity={0.35}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      <fog attach="fog" args={['#050508', 6, 14]} />
    </>
  );
};
