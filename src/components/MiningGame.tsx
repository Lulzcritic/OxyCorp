// TimingMinigame3D.tsx
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../utils/seed';

type Props = {
  seed: string | number;              // fixe la position/largeur de la cible
  onFinish: (success: boolean) => void;
  position?: [number, number, number];
  width?: number;                     // largeur de la barre (m)
  height?: number;                    // hauteur de la barre (m)
  speed?: number;                     // vitesse du curseur (m/s)
  stayMs?: number;                    // délai avant fermeture après arrêt
};

function hash32(s: string | number) {
  const str = String(s);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function TimingMinigame3D({
  seed,
  onFinish,
  position = [0, 1.2, 0],
  width = 1.8,
  height = 0.16,
  speed = 2.2,
  stayMs = 350,
}: Props) {
  // PRNG déterministe pour la cible
  const r = useMemo(() => mulberry32(hash32(seed)), [seed]);
  const targetCenter = useMemo(() => (r() * 0.7 - 0.35) * width, [r, width]);      // évite bords
  const targetHalf   = useMemo(() => (0.08 + r() * 0.06) * width, [r, width]);     // 8–14% largeur

  // Refs géométrie/affichage
  const barRef    = useRef<THREE.Mesh>(null!);
  const targetRef = useRef<THREE.Mesh>(null!);
  const cursorRef = useRef<THREE.Mesh>(null!);
  const cursorMat = useRef<THREE.MeshBasicMaterial>(null!);
  const targetMat = useRef<THREE.MeshBasicMaterial>(null!);

  // Mouvement du curseur (rebond type Pong)
  const halfW = width * 0.5;
  const cursorX = useRef(-halfW);
  const dir = useRef<1 | -1>(1);

  // Arrêt / feedback
  const stopped = useRef(false);
  const pulseT = useRef(0); // petite pulsation visuelle après stop

  useFrame((_, dt) => {
    if (!stopped.current) {
      // Avance
      cursorX.current += dir.current * speed * dt;
      // Rebond aux bords
      if (cursorX.current >=  halfW) { cursorX.current =  halfW; dir.current = -1; }
      if (cursorX.current <= -halfW) { cursorX.current = -halfW; dir.current =  1; }
      cursorRef.current.position.x = cursorX.current;
    } else {
      // Petit feedback: pulsation du curseur
      pulseT.current += dt * 6;
      const s = 1 + Math.sin(pulseT.current) * 0.08;
      cursorRef.current.scale.set(s, s, 1);
    }
  });

  function computeSuccess(x: number) {
    return Math.abs(x - targetCenter) <= targetHalf;
  }

  function stopAndFinish() {
    if (stopped.current) return;
    stopped.current = true;

    const x = cursorX.current;
    const success = computeSuccess(x);

    // Feedback couleurs
    cursorMat.current.color.set(success ? '#6BFF6B' : '#FF6464');
    targetMat.current.color.set(success ? '#6BFF6B' : '#FF6464');
    targetMat.current.opacity = 0.8;

    // Fin après un court délai
    setTimeout(() => onFinish(success), stayMs);
  }

  // Souris/clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') stopAndFinish();
      if (e.code === 'Escape') { if (!stopped.current) onFinish(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFinish]);

  return (
    <Billboard position={position}>
      <group>
        {/* Cadre */}
        <mesh position={[0, 0, -0.002]}>
          <planeGeometry args={[width + 0.02, height + 0.02]} />
          <meshBasicMaterial color="#000" />
        </mesh>

        {/* Barre */}
        <mesh ref={barRef}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color="#111" transparent opacity={0.7} />
        </mesh>

        {/* Zone-cible */}
        <mesh ref={targetRef} position={[targetCenter, 0, 0.001]}>
          <planeGeometry args={[targetHalf * 2, height * 0.9]} />
          <meshBasicMaterial ref={targetMat as any} color="#5aff5a" transparent opacity={0.6} />
        </mesh>

        {/* Curseur */}
        <mesh ref={cursorRef} position={[cursorX.current, 0, 0.002]}>
          <planeGeometry args={[height * 0.18, height * 1.25]} />
          <meshBasicMaterial ref={cursorMat as any} color="#ffffff" />
        </mesh>

        {/* Plan capteur de clic (arrête le curseur) */}
        <mesh
          position={[0, 0, 0.01]}
          onPointerDown={(e) => { e.stopPropagation(); stopAndFinish(); }}
        >
          <planeGeometry args={[width, height * 1.8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </Billboard>
  );
}
