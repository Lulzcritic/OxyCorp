// MineableRock.tsx
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Billboard, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense } from 'react';
import TimingMinigame3D from './MiningGame';
import { useControlStore } from '../game/useControlStore';

type MineableRockProps = {
  id: string;
  position: [number, number, number];
  // IMPORTANT : getPlayerPos(out?) DOIT retourner la position MONDE du joueur.
  // Si 'out' est fourni, écris dedans pour éviter d'allouer.
  getPlayerPos: (out?: THREE.Vector3) => THREE.Vector3;
  onMined?: (id: string) => void;
  interactRadius?: number;
};

export default function MineableRock({
  id,
  position,
  getPlayerPos,
  onMined,
  interactRadius = 3,
}: MineableRockProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [near, setNear] = useState(false);
  const nearRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const r2 = interactRadius * interactRadius;

  useFrame(() => {
    const p = getPlayerPos(tmp); // <- pas d’allocation si tu remplis 'tmp'
    const dx = p.x - position[0];
    const dz = p.z - position[2];
    const isNear = dx * dx + dz * dz <= r2;
    if (isNear !== nearRef.current) {
      console.log(`[${id}] near ->`, isNear, 'player=', p.toArray(), 'rock=', position);
      nearRef.current = isNear;
      setNear(isNear);
    }
  });

  function handlePointerDown(e: any) {
    e.stopPropagation();
    console.log(`[${id}] down, near=${near}`);
    if (!near || playing) return; // verrou : trop loin => rien
    setPlaying(true);
    useControlStore.setState({ disableMovement: true });
    // TODO: appeler ton Edge Function 'mineRock' ici
    // puis retirer le rocher côté parent
  }

  function handleFinish(success: boolean) {
    setPlaying(false);
    useControlStore.setState({ disableMovement: false });
    if (success) onMined?.(id);
  }

  return (
    <group position={position}>
      <mesh ref={meshRef} onPointerDown={handlePointerDown} castShadow={false} receiveShadow={false}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color={near ? '#b8e986' : '#8a8a8a'} roughness={1} />
      </mesh>

      {/* Label "Miner" uniquement si proche et pas de mini-jeu en cours */}
      {near && !playing && (
        <Billboard position={[0, 1.0, 0]}>
          <Html
            center
            distanceFactor={10}
            transform
            occlude
            style={{ pointerEvents: 'none' }}  // ne capte pas la souris
          >
            <div
              style={{
                padding: '4px 8px',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.65)',
                color: '#eaffea',
                fontSize: 12,
                border: '1px solid #67ff67',
                whiteSpace: 'nowrap',
              }}
            >
              Miner
            </div>
          </Html>
        </Billboard>
      )}

      {/* Mini-jeu */}
      {playing && (
        <TimingMinigame3D
          seed={id}
          onFinish={handleFinish}
          position={[0, 1.2, 0]}
          width={1.8}
          height={0.16}
          speed={2.2}
        />
      )}
    </group>
  );
}
